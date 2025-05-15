from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

# Importar la instancia de db desde app.py
from app import db

class UserRole(enum.Enum):
    ADMIN = "admin"
    VENDOR = "vendor"
    WAREHOUSE = "warehouse"
    ACCOUNTANT = "accountant"
    CUSTOMER = "customer"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    rut = db.Column(db.String(12), unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    password_change_required = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    orders = db.relationship('Order', backref='user', lazy=True)
    
    def __init__(self, username, email, password, role, **kwargs):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convierte el usuario a diccionario (para API)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.value,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'rut': self.rut,
            'phone': self.phone,
            'address': self.address,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    @classmethod
    def create_admin(cls, username, email, password, rut, **kwargs):
        """Método de clase para crear un administrador"""
        return cls(
            username=username,
            email=email, 
            password=password,
            role=UserRole.ADMIN,
            rut=rut,
            password_change_required=True,
            **kwargs
        )
    
    @classmethod
    def create_customer(cls, username, email, password, **kwargs):
        """Método de clase para crear un cliente"""
        return cls(
            username=username,
            email=email,
            password=password,
            role=UserRole.CUSTOMER,
            **kwargs
        )