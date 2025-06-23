from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import uuid

from app import db, sse
from models.order import Order, OrderItem, OrderStatus, DeliveryMethod
from models.product import Product, Stock, Branch
from models.user import User, UserRole
from utils.auth_utils import admin_required, role_required, has_role

orders_bp = Blueprint('orders', __name__)

def generate_order_number():
    """Genera un número de orden único"""
    prefix = "ORD"
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{timestamp}-{random_suffix}"

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Crear nuevo pedido"""
    user_id = get_jwt_identity()
    data = request.json
    
    # Validar datos requeridos
    required_fields = ['items', 'delivery_method']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Validar items
    if not data['items'] or not isinstance(data['items'], list):
        return jsonify({"error": "Se requiere al menos un item de producto"}), 400
    
    # Validar método de entrega
    try:
        delivery_method = DeliveryMethod(data['delivery_method'])
    except ValueError:
        return jsonify({"error": "Método de entrega inválido"}), 400
    
    # Validar dirección de entrega para despacho a domicilio
    if delivery_method == DeliveryMethod.DELIVERY and not data.get('delivery_address'):
        return jsonify({"error": "Se requiere dirección de envío para despacho a domicilio"}), 400
    
    # Validar existencia de sucursal
    branch = None
    if delivery_method == DeliveryMethod.PICKUP:
        branch_id = data.get('branch_id')
        if not branch_id:
            return jsonify({"error": "Se requiere sucursal para retiro en tienda"}), 400
        branch = Branch.query.get(branch_id)
        if not branch:
            return jsonify({"error": "Sucursal no encontrada"}), 404

    try:
        # Generar número de orden
        order_number = generate_order_number()
        
        # Calcular total y crear orden
        total_amount = 0
        discount_amount = 0
        
        # Calcular costo de envío
        delivery_cost = float(data.get('delivery_cost', 0))
        if delivery_method == DeliveryMethod.DELIVERY:
            # Aquí se podría implementar lógica para calcular costos de envío automáticamente
            if delivery_cost <= 0:
                delivery_cost = 5000  # Costo de envío base
        
        # Crear la orden
        new_order = Order(
            user_id=user_id,
            branch_id=branch.id if branch else None,
            order_number=order_number,
            total_amount=0,  # Se actualizará luego
            delivery_method=delivery_method,
            delivery_address=data.get('delivery_address'),
            delivery_cost=delivery_cost,
            notes=data.get('notes')
        )
        
        db.session.add(new_order)
        db.session.flush()  # Para obtener el ID de la orden
        
        # Validar inventario y crear items de la orden
        items_data = []
        
        for item_data in data['items']:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            if not product_id or quantity <= 0:
                db.session.rollback()
                return jsonify({"error": "Datos de producto inválidos"}), 400
            
            # Obtener producto
            product = Product.query.get(product_id)
            if not product:
                db.session.rollback()
                return jsonify({"error": f"Producto {product_id} no encontrado"}), 404

            # Verificar stock en la sucursal (solo si hay branch)
            if branch:
                stock = Stock.query.filter_by(
                    product_id=product_id, 
                    branch_id=branch.id
                ).first()

                if not stock or stock.quantity < quantity:
                    db.session.rollback()
                    return jsonify({
                        "error": f"Stock insuficiente para {product.name} en la sucursal seleccionada"
                    }), 400
            
            # Calcular precio
            unit_price = product.current_price()
            item_total = unit_price * quantity
            
            # Crear item de orden
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price
            )
            
            db.session.add(order_item)
            
            # Actualizar total
            total_amount += item_total
            
            # Preparar datos para la respuesta
            items_data.append({
                "product_id": product_id,
                "product_name": product.name,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": item_total
            })
        
        # Aplicar descuento si hay más de 4 artículos
        if len(data['items']) >= 4:
            # Verificar si el usuario es cliente registrado
            user = User.query.get(user_id)
            if user and user.role == UserRole.CUSTOMER:
                discount_percentage = 5  # 5% de descuento
                discount_amount = total_amount * (discount_percentage / 100)
        
        # Actualizar monto total de la orden
        new_order.total_amount = total_amount
        new_order.discount_amount = discount_amount
        
        db.session.commit()
        
        # Respuesta
        return jsonify({
            "message": "Pedido creado exitosamente",
            "order": {
                "id": new_order.id,
                "order_number": new_order.order_number,
                "status": new_order.status.value,
                "total_amount": float(new_order.total_amount),
                "discount_amount": float(new_order.discount_amount),
                "delivery_cost": float(new_order.delivery_cost),
                "final_amount": new_order.calculate_final_amount(),
                "items": items_data
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Obtener lista de pedidos según el rol del usuario"""
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Parámetros de filtrado
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    branch_id = request.args.get('branch_id', type=int)
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    # Iniciar consulta
    query = Order.query
    
    # Filtrar según el rol
    if role == UserRole.CUSTOMER.value:
        # Clientes solo ven sus propios pedidos
        query = query.filter_by(user_id=user_id)
    elif role == UserRole.VENDOR.value:
        # Vendedores ven pedidos de su sucursal
        #if not branch_id:
            # Obtener sucursal del vendedor (implementar lógica según tu sistema)
            #return jsonify({"error": "Se requiere sucursal para filtrar pedidos"}), 400
        query = query.filter_by(branch_id=branch_id)
    elif role == UserRole.WAREHOUSE.value:
        # Bodegueros ven pedidos de su sucursal
        if not branch_id:
            return jsonify({"error": "Se requiere sucursal para filtrar pedidos"}), 400
        query = query.filter_by(branch_id=branch_id)
    elif role == UserRole.ACCOUNTANT.value:
        # Contadores pueden ver todos los pedidos, pero se pueden filtrar por sucursal
        if branch_id:
            query = query.filter_by(branch_id=branch_id)
    elif role != UserRole.ADMIN.value:
        # Otros roles no tienen permiso
        return jsonify({"error": "No autorizado"}), 403
    
    # Filtros adicionales
    if status:
        try:
            query = query.filter_by(status=OrderStatus(status))
        except ValueError:
            pass
    
    if from_date:
        try:
            from_datetime = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            query = query.filter(Order.created_at >= from_datetime)
        except (ValueError, TypeError):
            pass
    
    if to_date:
        try:
            to_datetime = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
            query = query.filter(Order.created_at <= to_datetime)
        except (ValueError, TypeError):
            pass
    
    # Ordenar por fecha de creación (descendente)
    query = query.order_by(Order.created_at.desc())
    
    # Ejecutar consulta paginada
    pagination = query.paginate(page=page, per_page=per_page)
    
    # Preparar respuesta
    orders_data = []
    for order in pagination.items:
        order_dict = order.to_dict()
        
        # Agregar información del usuario y sucursal
        order_dict['user'] = order.user.to_dict() if order.user else None
        order_dict['branch'] = order.branch.to_dict() if order.branch else None
        
        orders_data.append(order_dict)
    
    return jsonify({
        "orders": orders_data,
        "pagination": {
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Obtener detalles de un pedido"""
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Obtener orden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
    
    # Verificar permisos
    if role == UserRole.CUSTOMER.value and order.user_id != user_id:
        return jsonify({"error": "No autorizado"}), 403
    elif role in [UserRole.VENDOR.value, UserRole.WAREHOUSE.value]:
        # Verificar si pertenece a su sucursal
        # Aquí debería implementarse una lógica para verificar la sucursal del empleado
        pass
    
    # Preparar respuesta detallada
    order_data = order.to_dict()
    
    # Agregar información del usuario y sucursal
    order_data['user'] = order.user.to_dict() if order.user else None
    order_data['branch'] = order.branch.to_dict() if order.branch else None
    
    # Historial de estados
    status_history = []
    for history in order.status_history:
        status_history.append({
            "date": history.created_at.isoformat(),
            "old_status": history.old_status.value,
            "new_status": history.new_status.value,
            "notes": history.notes
        })
    
    order_data["status_history"] = status_history
    
    # Información de pagos
    payments = []
    for payment in order.payments:
        payments.append(payment.to_dict())
    
    order_data["payments"] = payments
    
    return jsonify({"order": order_data}), 200


@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Actualizar estado de un pedido"""
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Verificar permisos según rol
    if role not in [
        UserRole.ADMIN.value, 
        UserRole.VENDOR.value, 
        UserRole.WAREHOUSE.value, 
        UserRole.ACCOUNTANT.value
    ]:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    # Validar datos
    if 'status' not in data:
        return jsonify({"error": "Se requiere especificar el nuevo estado"}), 400
    
    try:
        new_status = OrderStatus(data['status'])
    except ValueError:
        return jsonify({"error": "Estado inválido"}), 400
    
    # Obtener orden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
    
    # Validar transiciones de estado según rol
    valid_transition = False
    
    if role == UserRole.ADMIN.value:
        # Administradores pueden cambiar a cualquier estado
        valid_transition = True
    elif role == UserRole.VENDOR.value:
        # Vendedores pueden aprobar, rechazar o marcar como entregado
        if new_status in [OrderStatus.APPROVED, OrderStatus.REJECTED, OrderStatus.DELIVERED]:
            valid_transition = True
    elif role == UserRole.WAREHOUSE.value:
        # Bodegueros pueden marcar como en preparación o listo
        if new_status in [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SHIPPED]:
            valid_transition = True
    elif role == UserRole.ACCOUNTANT.value:
        # Contadores pueden confirmar pagos (implementar si es necesario)
        pass
    
    if not valid_transition:
        return jsonify({"error": "No autorizado para realizar este cambio de estado"}), 403
    
    try:
        # Actualizar estado
        if order.update_status(new_status, data.get('notes')):
            
            # Lógica específica según el estado
            if new_status == OrderStatus.APPROVED:
                # Reservar stock
                pass
            elif new_status == OrderStatus.REJECTED:
                # Liberar stock si estaba reservado
                pass
            elif new_status == OrderStatus.DELIVERED:
                # Confirmar entrega y actualizar inventario
                for item in order.items:
                    # Disminuir stock
                    stock = Stock.query.filter_by(
                        product_id=item.product_id,
                        branch_id=order.branch_id
                    ).first()
                    
                    if stock:
                        stock.quantity -= item.quantity
                        
                        # Verificar si el stock está bajo mínimo
                        if stock.quantity <= 0:
                            # Enviar notificación SSE
                            sse.publish({
                                "event": "stock_alert",
                                "data": {
                                    "product_id": item.product_id,
                                    "product_name": item.product.name,
                                    "branch_id": order.branch_id,
                                    "branch_name": order.branch.name,
                                    "current_stock": stock.quantity,
                                    "message": f"Stock bajo en {item.product.name} ({order.branch.name})"
                                }
                            }, type='stock_alert')
            
            db.session.commit()
            
            return jsonify({
                "message": "Estado del pedido actualizado correctamente",
                "order": order.to_dict()
            }), 200
        else:
            return jsonify({"message": "El estado del pedido ya era " + new_status.value}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    """Cancelar un pedido"""
    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    # Obtener orden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
    
    # Verificar permisos
    if role == UserRole.CUSTOMER.value and order.user_id != user_id:
        return jsonify({"error": "No autorizado"}), 403
    
    # Validar que el pedido esté en un estado que permita cancelación
    if order.status not in [OrderStatus.PENDING, OrderStatus.APPROVED]:
        return jsonify({
            "error": "No se puede cancelar el pedido en su estado actual"
        }), 400
    
    try:
        # Actualizar estado
        notes = request.json.get('notes', 'Cancelado por el usuario')
        order.update_status(OrderStatus.CANCELLED, notes)
        
        db.session.commit()
        
        return jsonify({
            "message": "Pedido cancelado correctamente",
            "order": order.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500