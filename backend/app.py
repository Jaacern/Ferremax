from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_sse import sse
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar app
app = Flask(__name__)

# Configuración
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'clave-secreta-desarrollo')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost/ferremas')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 horas

# Configuración para SSE (notificaciones en tiempo real)
app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379')
app.config['SSE_REDIS_URL'] = app.config['REDIS_URL']

# Habilitar CORS con configuración más específica
CORS(app, 
     supports_credentials=True, 
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
         }
     })

# Inicializar extensiones
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Registrar blueprint para SSE (notificaciones en tiempo real)
app.register_blueprint(sse, url_prefix='/stream')

# Rutas básicas
@app.route('/')
def index():
    return jsonify({"message": "API de FERREMAS funcionando correctamente"})

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Error interno del servidor"}), 500

# Importar modelos (después de inicializar db)
# Nota: Esto se hace al final para evitar importaciones circulares
from models.user import User
from models.product import Product, Branch, Stock
from models.order import Order, OrderItem, OrderStatus
from models.payment import Payment, CurrencyExchangeRate

# Importar y registrar blueprints de API
from api.auth import auth_bp
from api.products import products_bp
from api.orders import orders_bp
from api.stock import stock_bp
from api.payments import payments_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(stock_bp, url_prefix='/api/stock')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

if __name__ == '__main__':
    app.run(debug=True)