import logging
import grpc
from concurrent import futures

# Configurar logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

from protos import product_pb2
from db import SessionLocal
from protos import product_pb2_grpc
from models.product import (Product, ProductCategory,
                                    Branch, Stock, PriceHistory)

class GRPCProductService(product_pb2_grpc.ProductServiceServicer):

    def AddProduct(self, request, context):
        """Guarda un producto y stock inicial en la BD."""
        db = SessionLocal()
        try:
            # Validaciones mínimas
            if not request.sku or not request.name or request.price < 0:
                return product_pb2.Response(message="Datos inválidos", success=False)

            # Evitar SKU duplicado
            if db.query(Product).filter_by(sku=request.sku).first():
                return product_pb2.Response(message="SKU ya existe", success=False)

            # Convertir categoría de string a enum
            try:
                # Si viene como nombre del enum (MANUAL_TOOLS)
                if hasattr(ProductCategory, request.category):
                    category = ProductCategory[request.category]
                else:
                    # Si viene como valor del enum ("Herramientas Manuales")
                    category = ProductCategory(request.category)
            except (KeyError, ValueError):
                return product_pb2.Response(message=f"Categoría inválida: {request.category}", success=False)

            product = Product(
                sku        = request.sku,
                name       = request.name,
                price      = request.price,
                category   = category,
                description= request.description or None,
                brand      = request.brand or None,
                brand_code = request.brand_code or None,
                subcategory= request.subcategory or None,
                discount_percentage = request.discount_percentage,
                is_featured = request.is_featured,
                is_new      = request.is_new,
                image_data  = request.image if request.image else None,
                image_url   = request.image_url or None,
            )
            db.add(product)
            db.flush()                       # id listo

            # Historial de precios
            db.add(PriceHistory(product_id=product.id, price=product.price))

            # Stock base = 5 en todas las sucursales existentes
            for br in db.query(Branch).all():
                db.add(Stock(product_id=product.id, branch_id=br.id, quantity=5))

            db.commit()
            return product_pb2.Response(message="Producto guardado", success=True)

        except Exception as exc:
            db.rollback()
            log.exception(exc)
            return product_pb2.Response(message=str(exc), success=False)
        finally:
            db.close()

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    product_pb2_grpc.add_ProductServiceServicer_to_server(GRPCProductService(), server)
    server.add_insecure_port('[::]:50052')
    log.info("🚀 gRPC ⇒ escuchando en puerto 50052")
    print("✅ Servidor gRPC iniciado correctamente en puerto 50052")
    server.start()
    server.wait_for_termination()
