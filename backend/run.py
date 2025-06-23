import os
import argparse
from threading import Thread
from dotenv import load_dotenv

# gRPC
from services.grpc_product_service import serve as serve_grpc

# ---------------------------------------------------------------------------
load_dotenv()
# ---------------------------------------------------------------------------


def start_servers(args, app):
    """
    Arranca el hilo gRPC y luego levanta Flask.

    Evitamos que gRPC se duplique con el autoreloader:
      • WERKZEUG_RUN_MAIN == 'true' solo existe en el segundo proceso
        (el que realmente atiende peticiones).
    """
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not args.debug:
        # --> ¡sin argumentos porque serve() no los espera!
        Thread(target=serve_grpc, daemon=True).start()

    app.run(
        host=args.host,
        port=args.port,
        debug=args.debug,
        use_reloader=args.debug,   # cambio en caliente solo en modo debug
    )


def main() -> None:
    parser = argparse.ArgumentParser("Backend Ferremas")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--init-db", action="store_true")
    parser.add_argument("--migrate", action="store_true")
    parser.add_argument(
        "--env",
        default="development",
        choices=["development", "testing", "production"],
    )
    args = parser.parse_args()

    os.environ["FLASK_ENV"] = args.env
    if args.debug:
        os.environ["FLASK_DEBUG"] = "1"

    # Importamos después de configurar el entorno
    from app import app, db

    # ----- inicializar BD ---------------------------------------------------
    if args.init_db:
        with app.app_context():
            db.create_all()
            from db.initialize import init_db

            init_db()
        print("✓ Base de datos inicializada")
        return

    # ----- migraciones ------------------------------------------------------
    if args.migrate:
        with app.app_context():
            from db.schemas import run_migrations

            run_migrations()
        print("✓ Migraciones aplicadas")
        return

    # ----- gRPC + Flask -----------------------------------------------------
    start_servers(args, app)


if __name__ == "__main__":
    main()
