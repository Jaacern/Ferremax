import os
import argparse
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def main():
    """Función principal para ejecutar la aplicación Flask"""
    parser = argparse.ArgumentParser(description='Ejecutar servidor de backend FERREMAS')
    
    # Argumentos de línea de comandos
    parser.add_argument('--host', default='0.0.0.0', help='Host para el servidor (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000, help='Puerto para el servidor (default: 5000)')
    parser.add_argument('--debug', action='store_true', help='Ejecutar en modo debug')
    parser.add_argument('--init-db', action='store_true', help='Inicializar la base de datos')
    parser.add_argument('--migrate', action='store_true', help='Ejecutar migraciones de la base de datos')
    parser.add_argument('--env', default='development', choices=['development', 'testing', 'production'], 
                       help='Entorno de ejecución (development, testing, production)')
    
    args = parser.parse_args()
    
    # Establecer variables de entorno
    os.environ['FLASK_ENV'] = args.env
    
    if args.debug:
        os.environ['FLASK_DEBUG'] = '1'
    
    # Importar app aquí para que cargue las variables de entorno configuradas
    from app import app, db
    
    # Manejar inicialización de base de datos
    if args.init_db:
        with app.app_context():
            db.create_all()
            from db.initialize import init_db
            init_db()
        print("Base de datos inicializada")
        return
    
    # Manejar migraciones
    if args.migrate:
        with app.app_context():
            from db.schemas import run_migrations
            run_migrations()
        print("Migraciones aplicadas")
        return
    
    # Ejecutar la aplicación
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == '__main__':
    main()