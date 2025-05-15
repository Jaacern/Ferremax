from app import db
from datetime import datetime

def create_migration_table():
    """
    Crea una tabla de migraciones para llevar control de versiones de la base de datos
    """
    if not db.engine.has_table('migrations'):
        # Crear tabla de migraciones
        db.engine.execute("""
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(100) NOT NULL UNIQUE,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT
        )
        """)
        print("Tabla de migraciones creada correctamente")

def check_migration(version):
    """
    Verifica si una migración específica ya ha sido aplicada
    
    Args:
        version: Versión de la migración a verificar
        
    Returns:
        bool: True si la migración ya fue aplicada, False en caso contrario
    """
    result = db.engine.execute(
        "SELECT COUNT(*) FROM migrations WHERE version = %s", 
        (version,)
    ).scalar()
    return result > 0

def register_migration(version, description):
    """
    Registra una migración como aplicada
    
    Args:
        version: Versión de la migración
        description: Descripción de los cambios realizados
    """
    db.engine.execute(
        "INSERT INTO migrations (version, applied_at, description) VALUES (%s, %s, %s)",
        (version, datetime.utcnow(), description)
    )
    print(f"Migración {version} registrada correctamente")

def run_migrations():
    """
    Ejecuta todas las migraciones pendientes
    """
    # Asegurar que existe la tabla de migraciones
    create_migration_table()
    
    # Definir migraciones
    migrations = [
        {
            'version': '1.0.0',
            'description': 'Esquema inicial',
            'function': initial_schema
        },
        {
            'version': '1.0.1',
            'description': 'Agregar índices para búsqueda',
            'function': add_search_indexes
        },
        # Agregar aquí más migraciones según sea necesario
    ]
    
    # Ejecutar migraciones pendientes
    for migration in migrations:
        if not check_migration(migration['version']):
            print(f"Aplicando migración {migration['version']}: {migration['description']}")
            migration['function']()
            register_migration(migration['version'], migration['description'])
        else:
            print(f"Migración {migration['version']} ya aplicada")

def initial_schema():
    """
    Primera migración: Esquema inicial
    
    Esta migración no necesita hacer nada ya que SQLAlchemy 
    crea las tablas a partir de los modelos definidos.
    """
    pass

def add_search_indexes():
    """
    Segunda migración: Agregar índices para mejorar rendimiento de búsquedas
    """
    # Índice para búsqueda de productos por nombre
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products (name)")
    
    # Índice para búsqueda de productos por marca
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand)")
    
    # Índice para filtrado por categoría
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)")
    
    # Índice para búsqueda de usuarios por email
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
    
    # Índice para filtrado de órdenes por estado
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)")
    
    # Índice para búsqueda de órdenes por número
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number)")
    
    # Índices para stock
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_stock_product ON stocks (product_id)")
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_stock_branch ON stocks (branch_id)")
    db.engine.execute("CREATE INDEX IF NOT EXISTS idx_stock_product_branch ON stocks (product_id, branch_id)")

if __name__ == "__main__":
    # Esto permite ejecutar las migraciones directamente
    from app import app
    with app.app_context():
        run_migrations()