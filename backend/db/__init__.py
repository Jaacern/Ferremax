"""
backend.db
---------- 
• engine        → motor SQLAlchemy compartido con Flask
• SessionLocal  → factoría de sesiones thread-safe (scoped_session)
"""

from sqlalchemy.orm import scoped_session, sessionmaker
from app import app, db   # ← tu instancia global creada en app/__init__.py

# ---------------------------------------------------------------
# Asegurar un contexto de aplicación para que db.engine exista
# ---------------------------------------------------------------
app.app_context().push()

# ---------------------------------------------------------------
# Factoría de sesiones: una por hilo (gRPC usa pool de hilos)
# ---------------------------------------------------------------
SessionLocal = scoped_session(
    sessionmaker(
        bind=db.engine,
        autoflush=False,
        autocommit=False,
        expire_on_commit=False,
    )
)

# Exportamos el engine por si Alembic u otros lo necesitan
engine = db.engine
