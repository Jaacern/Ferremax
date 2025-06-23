from datetime import datetime
import enum
from app import db

class OrderStatus(enum.Enum):
    PENDING = "pendiente"
    APPROVED = "aprobado"
    REJECTED = "rechazado"
    PREPARING = "en preparación"
    READY = "listo para entrega"
    SHIPPED = "enviado"
    DELIVERED = "entregado"
    CANCELLED = "cancelado"

class DeliveryMethod(enum.Enum):
    PICKUP = "retiro en tienda"
    DELIVERY = "despacho a domicilio"

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    delivery_method = db.Column(db.Enum(DeliveryMethod), nullable=False)
    delivery_address = db.Column(db.String(200))
    delivery_cost = db.Column(db.Numeric(10, 2), default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    payments = db.relationship('Payment', backref='order', lazy=True)
    status_history = db.relationship('OrderStatusHistory', backref='order', lazy=True, cascade="all, delete-orphan")
    
    def __init__(self, user_id, branch_id, order_number, total_amount, delivery_method, **kwargs):
        self.user_id = user_id
        self.branch_id = branch_id
        self.order_number = order_number
        self.total_amount = total_amount
        self.delivery_method = delivery_method
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def calculate_final_amount(self):
        """Calcula el monto final de la orden"""
        return float(self.total_amount) - float(self.discount_amount) + float(self.delivery_cost)
    
    def update_status(self, new_status, notes=None):
        """Actualiza el estado de la orden y registra en el historial"""
        if self.status != new_status:
            # Crear registro en el historial
            history = OrderStatusHistory(
                order_id=self.id,
                old_status=self.status,
                new_status=new_status,
                notes=notes
            )
            db.session.add(history)
            
            # Actualizar estado actual
            self.status = new_status
            self.updated_at = datetime.utcnow()
            
            return True
        return False
    
    def to_dict(self):
        """Convierte la orden a diccionario (para API)"""
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'branch_id': self.branch_id,
            'status': self.status.value,
            'total_amount': float(self.total_amount),
            'discount_amount': float(self.discount_amount),
            'delivery_method': self.delivery_method.value,
            'delivery_address': self.delivery_address,
            'delivery_cost': float(self.delivery_cost),
            'final_amount': self.calculate_final_amount(),
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    def __init__(self, order_id, product_id, quantity, unit_price):
        self.order_id = order_id
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price
        self.total_price = float(unit_price) * quantity
    
    def to_dict(self):
        """Convierte el item de orden a diccionario (para API)"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price)
        }


class OrderStatusHistory(db.Model):
    __tablename__ = 'order_status_history'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    old_status = db.Column(db.Enum(OrderStatus), nullable=False)
    new_status = db.Column(db.Enum(OrderStatus), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, order_id, old_status, new_status, notes=None):
        self.order_id = order_id
        self.old_status = old_status
        self.new_status = new_status
        self.notes = notes