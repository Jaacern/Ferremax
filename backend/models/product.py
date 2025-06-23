from datetime import datetime
import enum
from app import db


class ProductCategory(enum.Enum):
    MANUAL_TOOLS = "Herramientas Manuales"
    POWER_TOOLS = "Herramientas Eléctricas"
    CONSTRUCTION_MATERIALS = "Materiales de Construcción"
    FINISHES = "Acabados"
    SAFETY_EQUIPMENT = "Equipos de Seguridad"
    FASTENERS = "Tornillos y Anclajes"
    ADHESIVES = "Fijaciones y Adhesivos"
    MEASURING_TOOLS = "Equipos de Medición"

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    brand = db.Column(db.String(50))
    brand_code = db.Column(db.String(50))
    category = db.Column(db.Enum(ProductCategory), nullable=False)
    subcategory = db.Column(db.String(50))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    discount_percentage = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    image_url  = db.Column(db.String(255))
    image_data = db.Column(db.LargeBinary)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    stocks = db.relationship('Stock', backref='product', lazy=True, cascade="all, delete-orphan")
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    price_history = db.relationship('PriceHistory', backref='product', lazy=True, cascade="all, delete-orphan")
    
    def __init__(self, sku, name, price, category, **kwargs):
        self.sku = sku
        self.name = name
        self.price = price
        self.category = category
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def current_price(self):
        """Calcula el precio actual con descuento si aplica"""
        if self.discount_percentage > 0:
            return float(self.price) * (1 - (self.discount_percentage / 100))
        return float(self.price)
    
    def to_dict(self):
        """Convierte el producto a diccionario (para API)"""
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'description': self.description,
            'brand': self.brand,
            'brand_code': self.brand_code,
            'category': self.category.name,
            'subcategory': self.subcategory,
            'category_label': self.category.value,
            "price": float(self.price) if self.price is not None else None,
            'current_price': self.current_price(),
            'discount_percentage': self.discount_percentage,
            'is_featured': self.is_featured,
            'is_new': self.is_new,
            'image_url': self.image_url,
            'has_image': bool(self.image_data), 
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    def to_api_dict(self):
        """Formato para la API externa según requisitos"""
        return {
            'Código del producto': self.sku,
            'Marca': self.brand,
            'Código': self.brand_code,
            'Nombre': self.name,
            'Precio': [
                {
                    'Fecha': price_record.created_at.isoformat(),
                    'Valor': float(price_record.price)
                } for price_record in self.price_history[-5:]  # Últimos 5 precios
            ]
        }


class Stock(db.Model):
    __tablename__ = 'stocks'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    min_stock = db.Column(db.Integer, default=5)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, product_id, branch_id, quantity, min_stock=5):
        self.product_id = product_id
        self.branch_id = branch_id
        self.quantity = quantity
        self.min_stock = min_stock
    
    def is_low_stock(self):
        """Verifica si el stock está bajo el mínimo"""
        return self.quantity <= self.min_stock
    
    def to_dict(self):
        """Convierte el stock a diccionario (para API)"""
        return {
            'id': self.id,
            'product_id': self.product_id,
            'branch_id': self.branch_id,
            'quantity': self.quantity,
            'min_stock': self.min_stock,
            'is_low_stock': self.is_low_stock(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Branch(db.Model):
    __tablename__ = 'branches'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    region = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    is_main = db.Column(db.Boolean, default=False)
    
    # Relaciones
    stocks = db.relationship('Stock', backref='branch', lazy=True)
    orders = db.relationship('Order', backref='branch', lazy=True)
    
    def __init__(self, name, **kwargs):
        self.name = name
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convierte la sucursal a diccionario (para API)"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'region': self.region,
            'phone': self.phone,
            'email': self.email,
            'is_main': self.is_main
        }


class PriceHistory(db.Model):
    __tablename__ = 'price_history'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, product_id, price):
        self.product_id = product_id
        self.price = price