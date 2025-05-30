from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from sqlalchemy import or_

from app import db
from models.product import Product, ProductCategory, Stock, Branch, PriceHistory
from utils.auth_utils import admin_required, role_required, has_role
from models.user import UserRole

products_bp = Blueprint('products', __name__)

# Rutas públicas
@products_bp.route('', methods=['GET'])
def get_products():
    """Obtener lista de productos (público)"""
    # Parámetros de paginación y filtrado
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    subcategory = request.args.get('subcategory')
    brand = request.args.get('brand')
    search = request.args.get('search')
    featured = request.args.get('featured', type=bool)
    new = request.args.get('new', type=bool)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    # Iniciar consulta
    query = Product.query
    
    # Aplicar filtros
    if category:
        try:
            query = query.filter_by(category=ProductCategory(category))
        except ValueError:
            pass
    
    if subcategory:
        query = query.filter_by(subcategory=subcategory)
    
    if brand:
        query = query.filter_by(brand=brand)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%'),
                Product.brand.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%')
            )
        )
    
    if featured is not None:
        query = query.filter_by(is_featured=featured)
    
    if new is not None:
        query = query.filter_by(is_new=new)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Ejecutar consulta paginada
    pagination = query.paginate(page=page, per_page=per_page)
    
    # Preparar respuesta
    products = [product.to_dict() for product in pagination.items]
    
    return jsonify({
        "products": products,
        "pagination": {
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Obtener detalles de un producto (público)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    product_data = product.to_dict()
    
    # Agregar información de stock por sucursal
    stocks_by_branch = []
    for stock in product.stocks:
        stocks_by_branch.append({
            "branch_id": stock.branch_id,
            "branch_name": stock.branch.name,
            "quantity": stock.quantity,
            "is_available": stock.quantity > 0
        })
    
    product_data["stocks"] = stocks_by_branch
    
    # Historial de precios
    price_history = []
    for price_record in product.price_history:
        price_history.append({
            "date": price_record.created_at.isoformat(),
            "price": float(price_record.price)
        })
    
    product_data["price_history"] = price_history
    
    return jsonify({"product": product_data}), 200


@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Obtener lista de categorías (público)"""
    categories = [{"id": cat.value, "name": cat.value} for cat in ProductCategory]
    return jsonify({"categories": categories}), 200


@products_bp.route('/branches', methods=['GET'])
def get_branches():
    """Obtener lista de sucursales (público)"""
    branches = Branch.query.all()
    return jsonify({"branches": [branch.to_dict() for branch in branches]}), 200


# Rutas API para consumo externo
@products_bp.route('/api/products/<string:sku>', methods=['GET'])
def get_product_api(sku):
    """API pública para consultar producto por SKU"""
    product = Product.query.filter_by(sku=sku).first()
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    return jsonify(product.to_api_dict()), 200


@products_bp.route('/api/products', methods=['GET'])
def get_products_api():
    """API pública para listar productos"""
    # Parámetros de filtrado
    brand = request.args.get('brand')
    category = request.args.get('category')
    
    # Iniciar consulta
    query = Product.query
    
    # Aplicar filtros
    if brand:
        query = query.filter_by(brand=brand)
    
    if category:
        try:
            query = query.filter_by(category=ProductCategory(category))
        except ValueError:
            pass
    
    # Limitar a 100 resultados para evitar sobrecarga
    products = query.limit(100).all()
    
    return jsonify([product.to_api_dict() for product in products]), 200


# Rutas administrativas
@products_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_product():
    """Crear nuevo producto (solo admin)"""
    data = request.json
    
    # Validar datos requeridos
    required_fields = ['sku', 'name', 'price', 'category']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Verificar si el SKU ya existe
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({"error": "El SKU ya existe"}), 409
    
    try:
        # Convertir categoría a enum
        try:
            category = ProductCategory(data['category'])
        except ValueError:
            return jsonify({"error": "Categoría inválida"}), 400
        
        # Crear producto
        new_product = Product(
            sku=data['sku'],
            name=data['name'],
            price=data['price'],
            category=category,
            description=data.get('description'),
            brand=data.get('brand'),
            brand_code=data.get('brand_code'),
            subcategory=data.get('subcategory'),
            discount_percentage=data.get('discount_percentage', 0),
            is_featured=data.get('is_featured', False),
            is_new=data.get('is_new', True),
            image_url=data.get('image_url')
        )
        
        db.session.add(new_product)
        
        # Guardar precio inicial en historial
        price_history = PriceHistory(
            product_id=new_product.id,
            price=data['price']
        )
        db.session.add(price_history)
        
        # Inicializar stock en sucursales si se proporciona
        if 'stocks' in data and isinstance(data['stocks'], list):
            for stock_data in data['stocks']:
                if 'branch_id' in stock_data and 'quantity' in stock_data:
                    stock = Stock(
                        product_id=new_product.id,
                        branch_id=stock_data['branch_id'],
                        quantity=stock_data['quantity'],
                        min_stock=stock_data.get('min_stock', 5)
                    )
                    db.session.add(stock)
        
        db.session.commit()
        
        return jsonify({
            "message": "Producto creado exitosamente",
            "product": new_product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_product(product_id):
    """Actualizar producto (solo admin)"""
    data = request.json
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    try:
        # Actualizar SKU si es diferente y no existe
        if 'sku' in data and data['sku'] != product.sku:
            if Product.query.filter_by(sku=data['sku']).first():
                return jsonify({"error": "El SKU ya existe"}), 409
            product.sku = data['sku']
        
        # Actualizar categoría si se proporciona
        if 'category' in data:
            try:
                product.category = ProductCategory(data['category'])
            except ValueError:
                return jsonify({"error": "Categoría inválida"}), 400
        
        # Actualizar precio y registrar en historial si cambió
        if 'price' in data and float(data['price']) != float(product.price):
            old_price = float(product.price)
            product.price = float(data['price'])
            
            # Registrar en historial
            price_history = PriceHistory(
                product_id=product.id,
                price=data['price']
            )
            db.session.add(price_history)
        
        # Campos simples
        simple_fields = [
            'name', 'description', 'brand', 'brand_code', 
            'subcategory', 'discount_percentage', 'is_featured', 
            'is_new', 'image_url'
        ]
        
        for field in simple_fields:
            if field in data:
                setattr(product, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            "message": "Producto actualizado correctamente",
            "product": product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_product(product_id):
    """Eliminar producto (solo admin)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Producto eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Rutas para gestión de stock
@products_bp.route('/stock', methods=['GET'])
@jwt_required()
def get_stock():
    """Obtener lista de stock (vendedor, bodeguero, admin)"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if not role or role not in [
        UserRole.ADMIN.value, 
        UserRole.VENDOR.value, 
        UserRole.WAREHOUSE.value
    ]:
        return jsonify({"error": "No autorizado"}), 403
    
    # Parámetros
    branch_id = request.args.get('branch_id', type=int)
    product_id = request.args.get('product_id', type=int)
    low_stock = request.args.get('low_stock', type=bool)
    
    # Iniciar consulta
    query = Stock.query
    
    # Aplicar filtros
    if branch_id:
        query = query.filter_by(branch_id=branch_id)
    
    if product_id:
        query = query.filter_by(product_id=product_id)
    
    if low_stock:
        query = query.filter(Stock.quantity <= Stock.min_stock)
    
    # Ejecutar consulta
    stocks = query.all()
    
    # Enriquecer con información de producto
    result = []
    for stock in stocks:
        stock_data = stock.to_dict()
        stock_data['product'] = stock.product.to_dict()
        stock_data['branch'] = stock.branch.to_dict()
        result.append(stock_data)
    
    return jsonify({"stocks": result}), 200


@products_bp.route('/stock/<int:stock_id>', methods=['PUT'])
@jwt_required()
def update_stock(stock_id):
    """Actualizar stock (admin, bodeguero)"""
    # Verificar roles permitidos
    jwt_data = get_jwt()
    role = jwt_data.get('role')
    
    if not role or role not in [UserRole.ADMIN.value, UserRole.WAREHOUSE.value]:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    stock = Stock.query.get(stock_id)
    if not stock:
        return jsonify({"error": "Stock no encontrado"}), 404
    
    try:
        # Actualizar cantidad
        if 'quantity' in data:
            stock.quantity = data['quantity']
        
        # Actualizar stock mínimo
        if 'min_stock' in data:
            stock.min_stock = data['min_stock']
        
        db.session.commit()
        
        return jsonify({
            "message": "Stock actualizado correctamente",
            "stock": stock.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/branches', methods=['POST'])
@jwt_required()
@admin_required
def create_branch():
    """Crear nueva sucursal (solo admin)"""
    data = request.json
    
    # Validar datos requeridos
    if not data.get('name'):
        return jsonify({"error": "Falta el nombre de la sucursal"}), 400
    
    try:
        new_branch = Branch(
            name=data['name'],
            address=data.get('address'),
            city=data.get('city'),
            region=data.get('region'),
            phone=data.get('phone'),
            email=data.get('email'),
            is_main=data.get('is_main', False)
        )
        
        db.session.add(new_branch)
        db.session.commit()
        
        return jsonify({
            "message": "Sucursal creada exitosamente",
            "branch": new_branch.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/branches/<int:branch_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_branch(branch_id):
    """Actualizar sucursal (solo admin)"""
    data = request.json
    
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({"error": "Sucursal no encontrada"}), 404
    
    try:
        # Campos simples
        fields = ['name', 'address', 'city', 'region', 'phone', 'email', 'is_main']
        for field in fields:
            if field in data:
                setattr(branch, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            "message": "Sucursal actualizada correctamente",
            "branch": branch.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/branches/<int:branch_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_branch(branch_id):
    """Eliminar sucursal (solo admin)"""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({"error": "Sucursal no encontrada"}), 404
    
    try:
        db.session.delete(branch)
        db.session.commit()
        return jsonify({"message": "Sucursal eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "No se puede eliminar la sucursal: " + str(e)}), 500