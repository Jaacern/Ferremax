"""
migrations/env.py  – Ferremax
Configura Alembic para integrarse con Flask-SQLAlchemy y detectar todos
los modelos que viven en backend/.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context
import logging

# ───────────────────────── rutas básicas ──────────────────────────
# BASE_DIR  = carpeta donde está este env.py  →  ..  (la raíz Ferremax)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

# Añade backend/ al PYTHONPATH para que `import backend.app` funcione
sys.path.append(BACKEND_DIR)

# ───────────────────── importar app y db ──────────────────────────
from backend.app import app, db   # noqa: E402

# Necesitamos un contexto de aplicación para que SQLAlchemy funcione
app.app_context().push()

# ───────────────────── configurar Alembic ─────────────────────────
config = context.config
fileConfig(config.config_file_name)           # logging
logger = logging.getLogger("alembic.env")

# Reemplaza la URL del .ini por la del engine real
config.set_main_option("sqlalchemy.url", str(db.engine.url))

# ───────  IMPORTA todos los módulos de modelos antes de metadata ──
#          Añade más imports si tienes otros módulos con modelos
import backend.models.product   # noqa: E402,F401
# import backend.models.order
# import backend.models.user
# import backend.models.payment
# ...

# Metadata completa que Alembic usará para autogenerar
target_metadata = db.Model.metadata

# ──────────────────── funciones de migración ──────────────────────
def run_migrations_offline() -> None:
    """Genera SQL sin conectarse a la base de datos."""
    context.configure(
        url=str(db.engine.url),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Aplica migraciones directamente (modo online)."""
    connectable = db.engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()

# ────────────────────── despachar modo ────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
