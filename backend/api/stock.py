from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import and_, or_, func
from app import db, sse
from models.product import Product, Stock, Branch
from models.user import UserRole
from utils.auth_utils import admin_required, role_required, has_role
from services.notification_service import NotificationService

stock_bp = Blueprint('stock', __name__)

@stock_bp.route('', methods=['GET'])
@jwt_required()
def get_stocks():
    """Obtener lista de stock"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role not in [
        UserRole.ADMIN.value, 
        UserRole.VENDOR.value, 
        UserRole.WAREHOUSE.value
    ]:
        return jsonify({"error": "No autorizado"}), 403
    
    # Parámetros de filtrado
    branch_id = request.args.get('branch_id', type=int)
    product_id = request.args.get('product_id', type=int)
    category = request.args.get('category')
    low_stock = request.args.get('low_stock', type=bool)
    out_of_stock = request.args.get('out_of_stock', type=bool)
    search = request.args.get('search')
    
    # Iniciar consulta
    query = db.session.query(Stock, Product, Branch).join(
        Product, Stock.product_id == Product.id
    ).join(
        Branch, Stock.branch_id == Branch.id
    )
    
    # Aplicar filtros
    if branch_id:
        query = query.filter(Stock.branch_id == branch_id)
    
    if product_id:
        query = query.filter(Stock.product_id == product_id)
    
    if category:
        query = query.filter(Product.category == category)
    
    if low_stock:
        query = query.filter(Stock.quantity <= Stock.min_stock)
    
    if out_of_stock:
        query = query.filter(Stock.quantity <= 0)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.brand.ilike(f'%{search}%'),
                Branch.name.ilike(f'%{search}%')
            )
        )
    
    # Ejecutar consulta
    results = query.all()
    
    # Preparar respuesta
    stocks_data = []
    for stock, product, branch in results:
        stocks_data.append({
            "id": stock.id,
            "product_id": product.id,
            "product_name": product.name,
            "product_sku": product.sku,
            "product_brand": product.brand,
            "branch_id": branch.id,
            "branch_name": branch.name,
            "quantity": stock.quantity,
            "min_stock": stock.min_stock,
            "is_low_stock": stock.quantity <= stock.min_stock,
            "is_out_of_stock": stock.quantity <= 0,
            "updated_at": stock.updated_at.isoformat() if stock.updated_at else None
        })
    
    return jsonify({"stocks": stocks_data}), 200


@stock_bp.route('/update/<int:stock_id>', methods=['PUT'])
@jwt_required()
def update_stock(stock_id):
    """Actualizar cantidad de stock"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role not in [UserRole.ADMIN.value, UserRole.WAREHOUSE.value]:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    # Validar datos
    if 'quantity' not in data:
        return jsonify({"error": "Se requiere especificar la cantidad"}), 400
    
    # Obtener stock
    stock = Stock.query.get(stock_id)
    if not stock:
        return jsonify({"error": "Stock no encontrado"}), 404
    
    try:
        old_quantity = stock.quantity
        stock.quantity = int(data['quantity'])
        
        # Actualizar stock mínimo si se proporciona
        if 'min_stock' in data:
            stock.min_stock = int(data['min_stock']) 
        
        # Verificar si el stock está bajo mínimo
        if stock.quantity <= stock.min_stock:
            product = Product.query.get(stock.product_id)
            branch = Branch.query.get(stock.branch_id)
        if product and branch:
            NotificationService.send_stock_alert(
                product_id=product.id,
                product_name=product.name,
                branch_id=branch.id,
                branch_name=branch.name,
                current_stock=stock.quantity,
                min_stock=stock.min_stock
        )
        
        # Verificar si el stock está agotado
        if stock.quantity <= 0:
            # Enviar notificación SSE de stock agotado
            product = Product.query.get(stock.product_id)
            branch = Branch.query.get(stock.branch_id)
            
            if product and branch:
                sse.publish({
                    "product_id": product.id,
                    "product_name": product.name,
                    "branch_id": branch.id,
                    "branch_name": branch.name,
                    "current_stock": stock.quantity,
                    "message": f"Stock agotado en {product.name} ({branch.name})"
                }, type='stock_alert')
        
        db.session.commit()
        
        return jsonify({
            "message": "Stock actualizado correctamente",
            "stock": {
                "id": stock.id,
                "product_id": stock.product_id,
                "branch_id": stock.branch_id,
                "old_quantity": old_quantity,
                "new_quantity": stock.quantity,
                "min_stock": stock.min_stock,
                "is_low_stock": stock.quantity <= stock.min_stock,
                "is_out_of_stock": stock.quantity <= 0,
                "updated_at": stock.updated_at.isoformat() if stock.updated_at else None
            }
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@stock_bp.route('/transfer', methods=['POST'])
@jwt_required()
def transfer_stock():
    """Transferir stock entre sucursales"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role not in [UserRole.ADMIN.value, UserRole.WAREHOUSE.value]:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    # Validar datos
    required_fields = ['product_id', 'source_branch_id', 'target_branch_id', 'quantity']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    if data['source_branch_id'] == data['target_branch_id']:
        return jsonify({"error": "Las sucursales origen y destino deben ser diferentes"}), 400
    
    if data['quantity'] <= 0:
        return jsonify({"error": "La cantidad debe ser mayor a cero"}), 400
    
    # Verificar stock origen
    source_stock = Stock.query.filter_by(
        product_id=data['product_id'], 
        branch_id=data['source_branch_id']
    ).first()
    
    if not source_stock or source_stock.quantity < data['quantity']:
        return jsonify({"error": "Stock insuficiente en la sucursal origen"}), 400
    
    # Verificar o crear stock destino
    target_stock = Stock.query.filter_by(
        product_id=data['product_id'], 
        branch_id=data['target_branch_id']
    ).first()
    
    if not target_stock:
        # Crear stock en sucursal destino
        target_stock = Stock(
            product_id=data['product_id'],
            branch_id=data['target_branch_id'],
            quantity=0,
            min_stock=source_stock.min_stock
        )
        db.session.add(target_stock)
    
    try:
        # Actualizar cantidades
        source_stock.quantity -= data['quantity']
        target_stock.quantity += data['quantity']
        
        # Verificar si el stock origen está bajo mínimo
        if source_stock.quantity <= source_stock.min_stock:
            # Enviar notificación SSE
            product = Product.query.get(source_stock.product_id)
            source_branch = Branch.query.get(source_stock.branch_id)
            
            if product and source_branch:
                sse.publish({
                    "product_id": product.id,
                    "product_name": product.name,
                    "branch_id": source_branch.id,
                    "branch_name": source_branch.name,
                    "current_stock": source_stock.quantity,
                    "min_stock": source_stock.min_stock,
                    "message": f"Stock bajo en {product.name} ({source_branch.name}) después de transferencia"
                }, type='stock_alert')
        
        db.session.commit()
        
        return jsonify({
            "message": "Transferencia de stock realizada correctamente",
            "transfer": {
                "product_id": data['product_id'],
                "source_branch_id": data['source_branch_id'],
                "target_branch_id": data['target_branch_id'],
                "quantity": data['quantity'],
                "source_remaining": source_stock.quantity,
                "target_new_quantity": target_stock.quantity
            }
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@stock_bp.route('/bulk-update', methods=['POST'])
@jwt_required()
@admin_required
def bulk_update_stock():
    """Actualización masiva de stock (solo admin)"""
    data = request.json
    
    # Validar datos
    if not isinstance(data, list):
        return jsonify({"error": "Se espera un array de actualizaciones"}), 400
    
    updates_result = []
    
    try:
        for update in data:
            if not all(k in update for k in ('stock_id', 'quantity')):
                continue
            
            stock = Stock.query.get(update['stock_id'])
            if not stock:
                updates_result.append({
                    "stock_id": update['stock_id'],
                    "success": False,
                    "error": "Stock no encontrado"
                })
                continue
            
            old_quantity = stock.quantity
            stock.quantity = update['quantity']
            
            # Actualizar stock mínimo si se proporciona
            if 'min_stock' in update:
                stock.min_stock = update['min_stock']
            
            updates_result.append({
                "stock_id": stock.id,
                "product_id": stock.product_id,
                "branch_id": stock.branch_id,
                "old_quantity": old_quantity,
                "new_quantity": stock.quantity,
                "success": True
            })
            
            # Verificar alertas de stock bajo
            if stock.quantity <= stock.min_stock:
                product = Product.query.get(stock.product_id)
                branch = Branch.query.get(stock.branch_id)
                
                if product and branch:
                    sse.publish({
                        "product_id": product.id,
                        "product_name": product.name,
                        "branch_id": branch.id,
                        "branch_name": branch.name,
                        "current_stock": stock.quantity,
                        "min_stock": stock.min_stock,
                        "message": f"Stock bajo en {product.name} ({branch.name})"
                    }, type='stock_alert')
        
        db.session.commit()
        
        return jsonify({
            "message": "Actualización masiva de stock completada",
            "updates": updates_result
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@stock_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_stock_alerts():
    """Obtener alertas de stock bajo"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if role not in [
        UserRole.ADMIN.value, 
        UserRole.VENDOR.value, 
        UserRole.WAREHOUSE.value
    ]:
        return jsonify({"error": "No autorizado"}), 403
    
    # Parámetros
    branch_id = request.args.get('branch_id', type=int)
    
    # Consulta de stock bajo
    query = db.session.query(Stock, Product, Branch).join(
        Product, Stock.product_id == Product.id
    ).join(
        Branch, Stock.branch_id == Branch.id
    ).filter(
        Stock.quantity <= Stock.min_stock
    )
    
    if branch_id:
        query = query.filter(Stock.branch_id == branch_id)
    
    # Ejecutar consulta
    results = query.all()
    
    # Preparar respuesta
    alerts = []
    for stock, product, branch in results:
        alert_level = "critical" if stock.quantity <= 0 else "warning"
        
        alerts.append({
            "id": stock.id,
            "product_id": product.id,
            "product_name": product.name,
            "product_sku": product.sku,
            "branch_id": branch.id,
            "branch_name": branch.name,
            "current_stock": stock.quantity,
            "min_stock": stock.min_stock,
            "alert_level": alert_level,
            "updated_at": stock.updated_at.isoformat() if stock.updated_at else None
        })
    
    return jsonify({"alerts": alerts}), 200


@stock_bp.route('/initialize', methods=['POST'])
@jwt_required()
@admin_required
def initialize_stock():
    """Inicializar stock de un producto en todas las sucursales"""
    data = request.json
    
    # Validar datos
    if not all(k in data for k in ('product_id', 'quantity')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Verificar producto
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    # Obtener todas las sucursales
    branches = Branch.query.all()
    if not branches:
        return jsonify({"error": "No hay sucursales registradas"}), 404
    
    results = []
    
    try:
        for branch in branches:
            # Verificar si ya existe stock
            stock = Stock.query.filter_by(
                product_id=data['product_id'],
                branch_id=branch.id
            ).first()
            
            if stock:
                # Actualizar stock existente
                old_quantity = stock.quantity
                stock.quantity = data['quantity']
                if 'min_stock' in data:
                    stock.min_stock = data['min_stock']
                
                results.append({
                    "branch_id": branch.id,
                    "branch_name": branch.name,
                    "old_quantity": old_quantity,
                    "new_quantity": stock.quantity,
                    "action": "updated"
                })
            else:
                # Crear nuevo stock
                new_stock = Stock(
                    product_id=data['product_id'],
                    branch_id=branch.id,
                    quantity=data['quantity'],
                    min_stock=data.get('min_stock', 5)
                )
                db.session.add(new_stock)
                
                results.append({
                    "branch_id": branch.id,
                    "branch_name": branch.name,
                    "quantity": new_stock.quantity,
                    "action": "created"
                })
        
        db.session.commit()
        
        return jsonify({
            "message": f"Stock de {product.name} inicializado en todas las sucursales",
            "results": results
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@stock_bp.route('/<int:stock_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_stock_by_id(stock_id):
    """Obtener un stock específico por ID"""
    stock = Stock.query.get(stock_id)
    if not stock:
        return jsonify({"error": "Stock no encontrado"}), 404

    product = Product.query.get(stock.product_id)
    branch = Branch.query.get(stock.branch_id)

    return jsonify({
        "id": stock.id,
        "product_id": stock.product_id,
        "product_name": product.name if product else None,
        "product_sku": product.sku if product else None,
        "branch_id": stock.branch_id,
        "branch_name": branch.name if branch else None,
        "quantity": stock.quantity,
        "min_stock": stock.min_stock,
        "is_low_stock": stock.quantity <= stock.min_stock,
        "is_out_of_stock": stock.quantity <= 0,
        "updated_at": stock.updated_at.isoformat() if stock.updated_at else None
    }), 200
