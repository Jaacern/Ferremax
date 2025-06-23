products_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_product():
    """Crear nuevo producto VIA GRPC (solo admin)"""
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
        db.session.flush()
        
        if 'stocks' not in data:
            branches = Branch.query.all()
            for br in branches:
                db.session.add(
                    Stock(
                        product_id=new_product.id,
                        branch_id=br.id,
                        quantity=5,
                        min_stock=5
                    )
                )

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