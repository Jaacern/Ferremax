from datetime import datetime
import enum
from app import db

class PaymentMethod(enum.Enum):
    CREDIT_CARD = "tarjeta de crédito"
    DEBIT_CARD = "tarjeta de débito"
    BANK_TRANSFER = "transferencia bancaria"
    CASH = "efectivo"

class PaymentStatus(enum.Enum):
    PENDING = "pendiente"
    PROCESSING = "procesando"
    COMPLETED = "completado"
    FAILED = "fallido"
    REFUNDED = "reembolsado"
    CANCELLED = "cancelado"

class CurrencyType(enum.Enum):
    CLP = "CLP"  # Peso chileno
    USD = "USD"  # Dólar estadounidense
    EUR = "EUR"  # Euro
    GBP = "GBP"  # Libra esterlina
    ARS = "ARS"  # Peso argentino
    BRL = "BRL"  # Real brasileño
    MXN = "MXN"  # Peso mexicano

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), nullable=False)
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.PENDING)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.Enum(CurrencyType), default=CurrencyType.CLP)
    transaction_id = db.Column(db.String(100), unique=True)
    payment_date = db.Column(db.DateTime)
    webpay_token = db.Column(db.String(100))
    webpay_buyorder = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, order_id, payment_method, amount, currency=CurrencyType.CLP, **kwargs):
        self.order_id = order_id
        self.payment_method = payment_method
        self.amount = amount
        self.currency = currency
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def complete(self, transaction_id, payment_date=None):
        """Marca el pago como completado"""
        self.status = PaymentStatus.COMPLETED
        self.transaction_id = transaction_id
        self.payment_date = payment_date or datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def fail(self, notes=None):
        """Marca el pago como fallido"""
        self.status = PaymentStatus.FAILED
        if notes:
            self.notes = notes
        self.updated_at = datetime.utcnow()
    
    def refund(self, notes=None):
        """Marca el pago como reembolsado"""
        self.status = PaymentStatus.REFUNDED
        if notes:
            self.notes = notes
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convierte el pago a diccionario (para API)"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_method': self.payment_method.value,
            'status': self.status.value,
            'amount': float(self.amount),
            'currency': self.currency.value,
            'transaction_id': self.transaction_id,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'webpay_token': self.webpay_token,
            'webpay_buyorder': self.webpay_buyorder,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class CurrencyExchangeRate(db.Model):
    __tablename__ = 'currency_exchange_rates'
    
    id = db.Column(db.Integer, primary_key=True)
    from_currency = db.Column(db.Enum(CurrencyType), nullable=False)
    to_currency = db.Column(db.Enum(CurrencyType), nullable=False)
    rate = db.Column(db.Numeric(12, 6), nullable=False)
    source = db.Column(db.String(50), default="Banco Central de Chile")
    fetched_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, from_currency, to_currency, rate, source="Banco Central de Chile"):
        self.from_currency = from_currency
        self.to_currency = to_currency
        self.rate = rate
        self.source = source
    
    def convert_amount(self, amount):
        """Convierte un monto usando esta tasa de cambio"""
        return float(amount) * float(self.rate)
    
    def to_dict(self):
        """Convierte la tasa de cambio a diccionario (para API)"""
        return {
            'id': self.id,
            'from_currency': self.from_currency.value,
            'to_currency': self.to_currency.value,
            'rate': float(self.rate),
            'source': self.source,
            'fetched_at': self.fetched_at.isoformat() if self.fetched_at else None,
        }