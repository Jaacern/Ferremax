from app import db
from models.user import User, UserRole
from models.product import Branch, ProductCategory, Product
from werkzeug.security import generate_password_hash
import os
from datetime import datetime
import json

def init_db():
    """Inicializa la base de datos con datos necesarios para el funcionamiento"""
    # Crear tablas si no existen
    db.create_all()
    
    # Verificar si ya existen datos
    if User.query.first() is not None:
        print("La base de datos ya está inicializada.")
        return
    
    # Inicializar sucursales
    create_default_branches()
    
    # Inicializar usuarios por defecto
    create_default_users()
    
    # Inicializar productos de ejemplo (opcional)
    if os.getenv('LOAD_SAMPLE_DATA', 'False').lower() == 'true':
        create_sample_products()
    
    print("Base de datos inicializada correctamente.")

def create_default_branches():
    """Crear sucursales por defecto"""
    branches = [
        {
            'name': 'Casa Matriz Santiago',
            'address': 'Av. Libertador Bernardo O\'Higgins 1111',
            'city': 'Santiago',
            'region': 'Metropolitana',
            'phone': '+56 2 2123 4567',
            'email': 'matriz@ferremas.cl',
            'is_main': True
        },
        {
            'name': 'Sucursal Providencia',
            'address': 'Av. Providencia 2222',
            'city': 'Santiago',
            'region': 'Metropolitana',
            'phone': '+56 2 2234 5678',
            'email': 'providencia@ferremas.cl',
            'is_main': False
        },
        {
            'name': 'Sucursal Las Condes',
            'address': 'Av. Apoquindo 3333',
            'city': 'Santiago',
            'region': 'Metropolitana',
            'phone': '+56 2 2345 6789',
            'email': 'lascondes@ferremas.cl',
            'is_main': False
        },
        {
            'name': 'Sucursal Maipú',
            'address': 'Av. 5 de Abril 4444',
            'city': 'Santiago',
            'region': 'Metropolitana',
            'phone': '+56 2 2456 7890',
            'email': 'maipu@ferremas.cl',
            'is_main': False
        },
        {
            'name': 'Sucursal Viña del Mar',
            'address': 'Av. San Martín 5555',
            'city': 'Viña del Mar',
            'region': 'Valparaíso',
            'phone': '+56 32 2567 8901',
            'email': 'vina@ferremas.cl',
            'is_main': False
        },
        {
            'name': 'Sucursal Concepción',
            'address': 'Av. Paicaví 6666',
            'city': 'Concepción',
            'region': 'Biobío',
            'phone': '+56 41 2678 9012',
            'email': 'concepcion@ferremas.cl',
            'is_main': False
        },
        {
            'name': 'Sucursal Temuco',
            'address': 'Av. Alemania 7777',
            'city': 'Temuco',
            'region': 'La Araucanía',
            'phone': '+56 45 2789 0123',
            'email': 'temuco@ferremas.cl',
            'is_main': False
        }
    ]
    
    for branch_data in branches:
        branch = Branch(**branch_data)
        db.session.add(branch)
    
    db.session.commit()
    print(f"Creadas {len(branches)} sucursales")

def create_default_users():
    """Crear usuarios por defecto"""
    users = [
        {
            'username': 'admin',
            'email': 'admin@ferremas.cl',
            'password': 'Admin123!',
            'role': UserRole.ADMIN,
            'first_name': 'Administrador',
            'last_name': 'Sistema',
            'rut': '11.111.111-1',
            'is_active': True,
            'password_change_required': False
        },
        {
            'username': 'vendedor',
            'email': 'vendedor@ferremas.cl',
            'password': 'Vendedor123!',
            'role': UserRole.VENDOR,
            'first_name': 'Vendedor',
            'last_name': 'Ejemplo',
            'rut': '22.222.222-2',
            'is_active': True,
            'password_change_required': True
        },
        {
            'username': 'bodeguero',
            'email': 'bodeguero@ferremas.cl',
            'password': 'Bodeguero123!',
            'role': UserRole.WAREHOUSE,
            'first_name': 'Bodeguero',
            'last_name': 'Ejemplo',
            'rut': '33.333.333-3',
            'is_active': True,
            'password_change_required': True
        },
        {
            'username': 'contador',
            'email': 'contador@ferremas.cl',
            'password': 'Contador123!',
            'role': UserRole.ACCOUNTANT,
            'first_name': 'Contador',
            'last_name': 'Ejemplo',
            'rut': '44.444.444-4',
            'is_active': True,
            'password_change_required': True
        },
        {
            'username': 'cliente',
            'email': 'cliente@ejemplo.com',
            'password': 'Cliente123!',
            'role': UserRole.CUSTOMER,
            'first_name': 'Cliente',
            'last_name': 'Ejemplo',
            'is_active': True,
            'password_change_required': False
        }
    ]
    
    for user_data in users:
        password = user_data.pop('password')
        role = user_data.pop('role')
        
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password=password,
            role=role
        )
        
        for key, value in user_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        db.session.add(user)
    
    db.session.commit()
    print(f"Creados {len(users)} usuarios")

def create_sample_products():
    """Crear productos de ejemplo"""
    # Datos de ejemplo (simplificado)
    product_data = [
        {
            'sku': 'FER-00001',
            'name': 'Martillo de Carpintero Stanley',
            'description': 'Martillo de carpintero profesional con mango ergonómico.',
            'brand': 'Stanley',
            'brand_code': 'STA-1234',
            'category': ProductCategory.MANUAL_TOOLS,
            'subcategory': 'Martillos',
            'price': 12990,
            'is_featured': True,
            'is_new': False,
            'image_url': '/img/products/martillo_stanley.jpg'
        },
        {
            'sku': 'FER-00002',
            'name': 'Taladro Percutor Inalámbrico Bosch',
            'description': 'Taladro percutor inalámbrico 18V con 2 baterías y maletín.',
            'brand': 'Bosch',
            'brand_code': 'BOS-5678',
            'category': ProductCategory.POWER_TOOLS,
            'subcategory': 'Taladros',
            'price': 89990,
            'discount_percentage': 10,
            'is_featured': True,
            'is_new': True,
            'image_url': '/img/products/taladro_bosch.jpg'
        },
        {
            'sku': 'FER-00003',
            'name': 'Juego de Destornilladores Makita',
            'description': 'Set de 10 destornilladores profesionales de precisión.',
            'brand': 'Makita',
            'brand_code': 'MAK-9012',
            'category': ProductCategory.MANUAL_TOOLS,
            'subcategory': 'Destornilladores',
            'price': 19990,
            'is_featured': False,
            'is_new': False,
            'image_url': '/img/products/destornilladores_makita.jpg'
        },
        {
            'sku': 'FER-00004',
            'name': 'Sierra Circular Dewalt',
            'description': 'Sierra circular de 7-1/4" con guía láser y maleta.',
            'brand': 'Dewalt',
            'brand_code': 'DEW-3456',
            'category': ProductCategory.POWER_TOOLS,
            'subcategory': 'Sierras',
            'price': 129990,
            'discount_percentage': 15,
            'is_featured': True,
            'is_new': True,
            'image_url': '/img/products/sierra_dewalt.jpg'
        },
        {
            'sku': 'FER-00005',
            'name': 'Saco de Cemento Melón 25kg',
            'description': 'Cemento para uso general en construcción.',
            'brand': 'Melón',
            'brand_code': 'MEL-7890',
            'category': ProductCategory.CONSTRUCTION_MATERIALS,
            'subcategory': 'Cemento',
            'price': 5990,
            'is_featured': False,
            'is_new': False,
            'image_url': '/img/products/cemento_melon.jpg'
        }
    ]
    
    # Crear productos
    for product_info in product_data:
        product = Product(**product_info)
        db.session.add(product)
    
    db.session.commit()
    print(f"Creados {len(product_data)} productos de ejemplo")
    
    # Obtener sucursales y productos para crear stock
    branches = Branch.query.all()
    products = Product.query.all()
    
    # Crear stock para cada producto en cada sucursal
    stock_entries = []
    for product in products:
        for branch in branches:
            from models.product import Stock
            # Cantidad aleatoria entre 5 y 50
            import random
            quantity = random.randint(5, 50)
            
            stock = Stock(
                product_id=product.id,
                branch_id=branch.id,
                quantity=quantity,
                min_stock=5
            )
            db.session.add(stock)
            stock_entries.append((product.name, branch.name, quantity))
    
    db.session.commit()
    print(f"Creados {len(stock_entries)} registros de stock")

if __name__ == "__main__":
    # Esto permite ejecutar la inicialización directamente
    from app import app
    with app.app_context():
        init_db()