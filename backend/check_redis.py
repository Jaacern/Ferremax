#!/usr/bin/env python3
"""
Script para verificar la configuración de Redis y SSE
"""

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def check_redis_connection():
    """Verificar conexión a Redis"""
    try:
        import redis
        
        # Obtener URL de Redis desde variables de entorno
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        print(f"🔍 Verificando conexión a Redis: {redis_url}")
        
        # Crear cliente Redis
        r = redis.from_url(redis_url)
        
        # Probar conexión
        r.ping()
        print("✅ Conexión a Redis exitosa")
        
        # Probar publicación y suscripción
        pubsub = r.pubsub()
        pubsub.subscribe('test_channel')
        
        # Publicar mensaje de prueba
        r.publish('test_channel', 'test_message')
        
        # Esperar mensaje
        message = pubsub.get_message(timeout=2)
        if message and message['type'] == 'message':
            print("✅ Publicación y suscripción funcionando correctamente")
        else:
            print("⚠️  Publicación/suscripción puede tener problemas")
        
        pubsub.unsubscribe('test_channel')
        pubsub.close()
        
        return True
        
    except ImportError:
        print("❌ Redis no está instalado. Instalar con: pip install redis")
        return False
    except Exception as e:
        print(f"❌ Error conectando a Redis: {e}")
        return False

def check_environment():
    """Verificar variables de entorno"""
    print("\n🔍 Verificando variables de entorno:")
    
    # Variables importantes
    important_vars = [
        'REDIS_URL',
        'SECRET_KEY',
        'DATABASE_URL',
        'JWT_SECRET_KEY'
    ]
    
    for var in important_vars:
        value = os.getenv(var)
        if value:
            # Ocultar valores sensibles
            if 'SECRET' in var or 'KEY' in var:
                display_value = value[:10] + '...' if len(value) > 10 else '***'
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"⚠️  {var}: No definida (usando valor por defecto)")

def check_flask_sse():
    """Verificar configuración de Flask-SSE"""
    print("\n🔍 Verificando Flask-SSE:")
    
    try:
        from flask import Flask
        from flask_sse import sse
        
        # Crear app de prueba
        app = Flask(__name__)
        app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379')
        app.config['SSE_REDIS_URL'] = app.config['REDIS_URL']
        
        # Registrar blueprint
        app.register_blueprint(sse, url_prefix='/stream')
        
        print("✅ Flask-SSE configurado correctamente")
        
        # Verificar que el blueprint esté registrado
        with app.app_context():
            try:
                redis_client = sse.redis
                redis_client.ping()
                print("✅ SSE Redis client funcionando")
            except Exception as e:
                print(f"❌ Error en SSE Redis client: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error configurando Flask-SSE: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Diagnóstico de Redis y SSE para FERREMAS")
    print("=" * 50)
    
    # Verificar variables de entorno
    check_environment()
    
    # Verificar Redis
    redis_ok = check_redis_connection()
    
    # Verificar Flask-SSE
    sse_ok = check_flask_sse()
    
    print("\n" + "=" * 50)
    print("📋 RESUMEN:")
    
    if redis_ok and sse_ok:
        print("✅ Todo está configurado correctamente")
        print("💡 Las notificaciones SSE deberían funcionar")
    else:
        print("❌ Hay problemas de configuración")
        
        if not redis_ok:
            print("   - Redis no está funcionando")
            print("   - Instalar Redis: https://redis.io/download")
            print("   - O usar Docker: docker run -d -p 6379:6379 redis")
        
        if not sse_ok:
            print("   - Flask-SSE tiene problemas")
            print("   - Verificar instalación: pip install Flask-SSE")
    
    print("\n🔧 COMANDOS ÚTILES:")
    print("   - Iniciar Redis: redis-server")
    print("   - Verificar Redis: redis-cli ping")
    print("   - Instalar dependencias: pip install redis Flask-SSE")

if __name__ == "__main__":
    main() 