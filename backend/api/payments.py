from flask import Blueprint, request, jsonify, url_for, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime

from app import db
from models.payment import Payment, PaymentMethod, PaymentStatus, CurrencyType, CurrencyExchangeRate
from models.order import Order, OrderStatus
from models.user import UserRole
from utils.auth_utils import admin_required, role_required
from services.webpay_service import WebpayService
from services.currency_service import CurrencyService

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    """Iniciar proceso de pago para una orden"""
    user_id = get_jwt_identity()
    data = request.json
    
    # Validar datos requeridos
    required_fields = ['order_id', 'payment_method']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Validar método de pago
    try:
        payment_method = PaymentMethod(data['payment_method'])
    except ValueError:
        return jsonify({"error": "Método de pago inválido"}), 400
    
    # Obtener orden
    order = Order.query.get(data['order_id'])
    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404
    
    # Verificar que el usuario es dueño de la orden o tiene rol adecuado
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role == UserRole.CUSTOMER.value and order.user_id != user_id:
        return jsonify({"error": "No autorizado"}), 403
    
    # Verificar que la orden esté en estado pendiente o aprobada
    if order.status not in [OrderStatus.PENDING, OrderStatus.APPROVED]:
        return jsonify({"error": "No se puede iniciar pago para esta orden en su estado actual"}), 400
    
    # Verificar si ya hay pagos para esta orden
    existing_payment = Payment.query.filter_by(order_id=order.id).first()
    if existing_payment and existing_payment.status in [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.COMPLETED]:
        return jsonify({
            "error": "Ya existe un pago para esta orden", 
            "payment": existing_payment.to_dict()
        }), 409
    
    # Calcular monto final
    amount = order.calculate_final_amount()
    
    # Verificar moneda y realizar conversión si es necesario
    currency = CurrencyType.CLP  # Moneda por defecto
    if 'currency' in data:
        try:
            currency = CurrencyType(data['currency'])
        except ValueError:
            return jsonify({"error": "Moneda inválida"}), 400
        
        # Si la moneda no es CLP, convertir el monto
        if currency != CurrencyType.CLP:
            currency_service = CurrencyService()
            try:
                converted_amount = currency_service.convert(amount, CurrencyType.CLP, currency)
                amount = converted_amount
            except Exception as e:
                return jsonify({"error": f"Error al convertir moneda: {str(e)}"}), 500
    
    try:
        # Crear registro de pago
        new_payment = Payment(
            order_id=order.id,
            payment_method=payment_method,
            amount=amount,
            currency=currency,
            status=PaymentStatus.PENDING,
            notes=data.get('notes')
        )
        
        db.session.add(new_payment)
        db.session.flush()  # Para obtener el ID del pago
        
        payment_response = None
        
        # Procesar según método de pago
        if payment_method in [PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD]:
            # Integración con WebPay
            webpay_service = WebpayService()
            
            # URL de retorno (ajustar según configuración)
            return_url = url_for('payments.confirm_payment', _external=True)
            
            # Iniciar transacción en WebPay
            transaction_result = webpay_service.initiate_transaction(
                buy_order=f"ORD-{order.id}-{new_payment.id}",
                session_id=str(user_id),
                amount=amount,
                return_url=return_url
            )
            
            if transaction_result and 'token' in transaction_result:
                # Guardar token de WebPay
                new_payment.webpay_token = transaction_result['token']
                new_payment.webpay_buyorder = f"ORD-{order.id}-{new_payment.id}"
                new_payment.status = PaymentStatus.PROCESSING
                
                payment_response = {
                    "redirect_url": transaction_result['url'],
                    "token": transaction_result['token']
                }
        
        elif payment_method == PaymentMethod.BANK_TRANSFER:
            # Para transferencias bancarias, proporcionar datos de la cuenta
            payment_response = {
                "account_info": {
                    "bank": "Banco de FERREMAS",
                    "account_type": "Cuenta Corriente",
                    "account_number": "12345678",
                    "rut": "76.543.210-K",
                    "email": "pagos@ferremas.cl",
                    "reference": f"ORD-{order.id}"
                }
            }
        
        db.session.commit()
        
        return jsonify({
            "message": "Proceso de pago iniciado correctamente",
            "payment": new_payment.to_dict(),
            "payment_details": payment_response
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/confirm', methods=['GET', 'POST'])
def confirm_payment():
    """Confirmar pago desde WebPay (callback)"""
    # Recibir parámetros de WebPay
    token = request.args.get('token_ws') or request.form.get('token_ws')
    
    if not token:
        return jsonify({"error": "Token de transacción no proporcionado"}), 400
    
    try:
        # Buscar pago por token
        payment = Payment.query.filter_by(webpay_token=token).first()
        
        if not payment:
            return jsonify({"error": "Pago no encontrado para el token proporcionado"}), 404
        
        # Validar transacción con WebPay
        webpay_service = WebpayService()
        transaction_result = webpay_service.confirm_transaction(token)
        
        if not transaction_result:
            payment.status = PaymentStatus.FAILED
            payment.notes = "Error al confirmar transacción con WebPay"
            db.session.commit()
            
            return jsonify({
                "error": "Error al confirmar transacción",
                "payment": payment.to_dict()
            }), 400
        
        # Verificar resultado de la transacción
        if transaction_result.get('status') == 'AUTHORIZED':
            # Transacción exitosa
            payment.status = PaymentStatus.COMPLETED
            payment.transaction_id = transaction_result.get('transaction_id')
            payment.payment_date = datetime.utcnow()
            
            # Actualizar estado de la orden a aprobada si estaba pendiente
            order = Order.query.get(payment.order_id)
            if order and order.status == OrderStatus.PENDING:
                order.update_status(OrderStatus.APPROVED, "Pago confirmado automáticamente")
            
            db.session.commit()
            
            # Redirigir a página de éxito o retornar respuesta JSON
            if request.headers.get('Accept') == 'application/json':
                return jsonify({
                    "message": "Pago confirmado correctamente",
                    "payment": payment.to_dict()
                }), 200
            else:
                # URL de redirección de éxito (ajustar según frontend)
                return jsonify({
                    "redirect": f"/payment/success?order_id={payment.order_id}"
                }), 200
        else:
            # Transacción fallida
            payment.status = PaymentStatus.FAILED
            payment.notes = f"Transacción rechazada: {transaction_result.get('status')}"
            db.session.commit()
            
            # Redirigir a página de error o retornar respuesta JSON
            if request.headers.get('Accept') == 'application/json':
                return jsonify({
                    "error": "Pago rechazado",
                    "payment": payment.to_dict()
                }), 400
            else:
                # URL de redirección de error (ajustar según frontend)
                return jsonify({
                    "redirect": f"/payment/failed?order_id={payment.order_id}"
                }), 400
                
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/confirm-transfer', methods=['POST'])
@jwt_required()
@role_required([UserRole.ADMIN, UserRole.ACCOUNTANT])
def confirm_transfer_payment():
    """Confirmar pago por transferencia (manual por contador o admin)"""
    data = request.json
    
    # Validar datos
    if not all(k in data for k in ('payment_id', 'transaction_id')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Buscar pago
    payment = Payment.query.get(data['payment_id'])
    if not payment:
        return jsonify({"error": "Pago no encontrado"}), 404
    
    # Verificar que sea un pago por transferencia
    if payment.payment_method != PaymentMethod.BANK_TRANSFER:
        return jsonify({"error": "El pago no es por transferencia bancaria"}), 400
    
    # Verificar que el pago esté pendiente
    if payment.status != PaymentStatus.PENDING:
        return jsonify({
            "error": f"El pago no está en estado pendiente (estado actual: {payment.status.value})"
        }), 400
    
    try:
        # Actualizar pago
        payment.status = PaymentStatus.COMPLETED
        payment.transaction_id = data['transaction_id']
        payment.payment_date = data.get('payment_date', datetime.utcnow())
        payment.notes = data.get('notes')
        
        # Actualizar estado de la orden a aprobada si estaba pendiente
        order = Order.query.get(payment.order_id)
        if order and order.status == OrderStatus.PENDING:
            order.update_status(OrderStatus.APPROVED, "Pago por transferencia confirmado por contador")
        
        db.session.commit()
        
        return jsonify({
            "message": "Pago por transferencia confirmado correctamente",
            "payment": payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/order/<int:order_id>', methods=['GET'])
@jwt_required()
def get_payment_by_order(order_id):
    """Obtener pagos de una orden"""
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Obtener orden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404
    
    # Verificar permisos
    if role == UserRole.CUSTOMER.value and order.user_id != user_id:
        return jsonify({"error": "No autorizado"}), 403
    
    # Obtener pagos
    payments = Payment.query.filter_by(order_id=order_id).all()
    
    return jsonify({
        "payments": [payment.to_dict() for payment in payments]
    }), 200


@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Obtener detalles de un pago"""
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Obtener pago
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Pago no encontrado"}), 404
    
    # Verificar permisos
    if role == UserRole.CUSTOMER.value:
        order = Order.query.get(payment.order_id)
        if not order or order.user_id != user_id:
            return jsonify({"error": "No autorizado"}), 403
    
    return jsonify({
        "payment": payment.to_dict()
    }), 200


@payments_bp.route('/cancel/<int:payment_id>', methods=['PUT'])
@jwt_required()
@role_required([UserRole.ADMIN, UserRole.ACCOUNTANT])
def cancel_payment(payment_id):
    """Cancelar un pago (admin o contador)"""
    data = request.json
    
    # Obtener pago
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "Pago no encontrado"}), 404
    
    # Verificar que el pago no esté completado
    if payment.status == PaymentStatus.COMPLETED:
        return jsonify({"error": "No se puede cancelar un pago ya completado"}), 400
    
    try:
        # Actualizar estado
        payment.status = PaymentStatus.CANCELLED
        payment.notes = data.get('notes', 'Pago cancelado manualmente')
        
        db.session.commit()
        
        return jsonify({
            "message": "Pago cancelado correctamente",
            "payment": payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/exchange-rates', methods=['GET'])
def get_exchange_rates():
    """Obtener tasas de cambio disponibles"""
    # Obtener moneda origen y destino
    from_currency = request.args.get('from', default='CLP')
    to_currency = request.args.get('to')
    
    try:
        # Convertir a enum
        from_currency_enum = CurrencyType(from_currency)
        
        # Iniciar consulta
        query = CurrencyExchangeRate.query.filter_by(from_currency=from_currency_enum)
        
        # Filtrar por moneda destino si se proporciona
        if to_currency:
            try:
                to_currency_enum = CurrencyType(to_currency)
                query = query.filter_by(to_currency=to_currency_enum)
            except ValueError:
                pass
        
        # Obtener resultados más recientes
        rates = query.order_by(CurrencyExchangeRate.fetched_at.desc()).all()
        
        return jsonify({
            "rates": [rate.to_dict() for rate in rates]
        }), 200
        
    except ValueError:
        return jsonify({"error": "Moneda inválida"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/convert', methods=['GET'])
def convert_amount():
    """Convertir monto entre monedas"""
    # Obtener parámetros
    amount = request.args.get('amount', type=float)
    from_currency = request.args.get('from', default='CLP')
    to_currency = request.args.get('to', default='USD')
    
    if not amount:
        return jsonify({"error": "Se requiere especificar un monto"}), 400
    
    try:
        # Convertir a enums
        from_currency_enum = CurrencyType(from_currency)
        to_currency_enum = CurrencyType(to_currency)
        
        # Usar servicio de conversión
        currency_service = CurrencyService()
        converted_amount = currency_service.convert(amount, from_currency_enum, to_currency_enum)
        
        # Obtener tasa utilizada
        rate = currency_service.get_current_rate(from_currency_enum, to_currency_enum)
        
        return jsonify({
            "original": {
                "amount": amount,
                "currency": from_currency
            },
            "converted": {
                "amount": converted_amount,
                "currency": to_currency
            },
            "rate": float(rate.rate),
            "rate_date": rate.fetched_at.isoformat()
        }), 200
        
    except ValueError:
        return jsonify({"error": "Moneda inválida"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@payments_bp.route('/update-rates', methods=['POST'])
@jwt_required()
@admin_required
def update_exchange_rates():
    """Actualizar tasas de cambio (solo admin)"""
    try:
        # Usar servicio para actualizar tasas
        currency_service = CurrencyService()
        updated_rates = currency_service.update_rates()
        
        return jsonify({
            "message": "Tasas de cambio actualizadas correctamente",
            "updated_rates": updated_rates
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500