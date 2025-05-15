import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 horas
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    SSE_REDIS_URL = REDIS_URL
    
    # APIs externas
    WEBPAY_API_KEY = os.getenv('WEBPAY_API_KEY', 'test-api-key')
    WEBPAY_COMMERCE_CODE = os.getenv('WEBPAY_COMMERCE_CODE', '597055555532')
    WEBPAY_ENVIRONMENT = os.getenv('WEBPAY_ENVIRONMENT', 'INTEGRACION')
    
    BANCO_CENTRAL_API_URL = os.getenv('BANCO_CENTRAL_API_URL', 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx')
    BANCO_CENTRAL_API_USER = os.getenv('BANCO_CENTRAL_API_USER', 'test_user')
    BANCO_CENTRAL_API_PASS = os.getenv('BANCO_CENTRAL_API_PASS', 'test_pass')


class DevelopmentConfig(Config):
    """Configuración de desarrollo"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost/ferremas')
    

class TestingConfig(Config):
    """Configuración de pruebas"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'postgresql://postgres:postgres@localhost/ferremas_test')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora en pruebas


class ProductionConfig(Config):
    """Configuración de producción"""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 8  # 8 horas en producción


# Configuración según entorno
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Obtiene configuración según variable de entorno FLASK_ENV"""
    env = os.getenv('FLASK_ENV', 'development')
    return config_by_name[env]