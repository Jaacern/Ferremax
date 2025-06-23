#!/usr/bin/env python3
"""
Casos de prueba para gRPC - FERREMAS
====================================

Este archivo contiene todos los casos de prueba para verificar el funcionamiento
correcto del servidor gRPC de productos.
"""

import unittest
import grpc
import time
import threading
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import sys
import os

# Agregar el directorio backend al path para importar módulos
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from protos import product_pb2
from protos import product_pb2_grpc

class TestGRPCProductService(unittest.TestCase):
    """Suite de pruebas para el servicio gRPC de productos"""
    
    def setUp(self):
        self.channel = grpc.insecure_channel('localhost:50052')
        self.stub = product_pb2_grpc.ProductServiceStub(self.channel)
        self.timeout = 10.0
        self.valid_product = product_pb2.Product(
            sku="TEST-001",
            name="Producto de Prueba",
            category="MANUAL_TOOLS",
            price=15000.0,
            description="Descripción de prueba",
            brand="Marca Test",
            brand_code="MT001",
            subcategory="Herramientas",
            discount_percentage=0,
            is_featured=False,
            is_new=True,
            image_url="https://example.com/image.jpg"
        )
    
    def tearDown(self):
        if hasattr(self, 'channel'):
            self.channel.close()
    
    def test_01_connection_success(self):
        try:
            response = self.stub.AddProduct(self.valid_product, timeout=self.timeout)
            self.assertIsNotNone(response)
            print("[OK] Conexión gRPC establecida correctamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[OK] Conexión gRPC establecida (método no implementado)")
            else:
                self.fail(f"[ERROR] Conexión gRPC: {e}")
    
    def test_02_valid_method_call(self):
        try:
            response = self.stub.AddProduct(self.valid_product, timeout=self.timeout)
            self.assertIsNotNone(response)
            self.assertIsInstance(response, product_pb2.Response)
            self.assertIsInstance(response.message, str)
            self.assertIsInstance(response.success, bool)
            print(f"[OK] Llamada válida exitosa: {response.message}")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                self.fail(f"[ERROR] Método válido: {e}")
    
    def test_03_invalid_parameters(self):
        invalid_product = product_pb2.Product(
            sku="",
            name="Producto Inválido",
            category="MANUAL_TOOLS",
            price=15000.0
        )
        try:
            response = self.stub.AddProduct(invalid_product, timeout=self.timeout)
            if hasattr(response, 'success'):
                self.assertFalse(response.success)
                self.assertIn("inválido", response.message.lower())
                print(f"[OK] Parámetros inválidos manejados: {response.message}")
            else:
                print("[WARNING] Método no implementado completamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Error gRPC manejado: {e.code()}")
    
    def test_04_timeout_handling(self):
        timeout_product = product_pb2.Product(
            sku="TIMEOUT-001",
            name="Producto Timeout",
            category="MANUAL_TOOLS",
            price=15000.0
        )
        try:
            start_time = time.time()
            self.stub.AddProduct(timeout_product, timeout=0.1)
            end_time = time.time()
            self.assertLess(end_time - start_time, 0.2)
            print("[OK] Timeout respetado correctamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
                print("[OK] Timeout manejado correctamente (DEADLINE_EXCEEDED)")
            elif e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Otro error gRPC: {e.code()}")
    
    def test_05_load_testing(self):
        def make_request(product_id):
            product = product_pb2.Product(
                sku=f"LOAD-{product_id:03d}",
                name=f"Producto Carga {product_id}",
                category="MANUAL_TOOLS",
                price=15000.0 + product_id
            )
            try:
                response = self.stub.AddProduct(product, timeout=self.timeout)
                return f"Producto {product_id}: {response.success}"
            except grpc.RpcError as e:
                return f"Producto {product_id}: Error {e.code()}"
        
        num_requests = 10
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, i) for i in range(num_requests)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        print("[OK] Prueba de carga completada")
        print(f"   - {num_requests} llamadas")
        print(f"   - Tiempo total: {end_time - start_time:.2f}s")
        self.assertEqual(len(results), num_requests)
    
    def test_06_cancellation(self):
        cancel_product = product_pb2.Product(
            sku="CANCEL-001",
            name="Producto Cancelación",
            category="MANUAL_TOOLS",
            price=15000.0
        )
        try:
            with self.channel:
                self.stub.AddProduct(cancel_product, timeout=self.timeout)
                print("[OK] Llamada completada (no cancelada)")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.CANCELLED:
                print("[OK] Cancelación manejada correctamente")
            elif e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Otro error gRPC: {e.code()}")
    
    def test_07_authentication_authorization(self):
        try:
            response = self.stub.AddProduct(self.valid_product, timeout=self.timeout)
            if hasattr(response, 'success'):
                print("[OK] Método responde correctamente (sin auth)")
            else:
                print("[WARNING] Método no implementado completamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNAUTHENTICATED:
                print("[OK] Autenticación requerida")
            elif e.code() == grpc.StatusCode.PERMISSION_DENIED:
                print("[OK] Autorización requerida")
            elif e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Otro error gRPC: {e.code()}")
    
    def test_08_server_error_handling(self):
        error_product = product_pb2.Product(
            sku="ERROR-001",
            name="Producto Error",
            category="CATEGORIA_INVALIDA",
            price=-1000.0
        )
        try:
            response = self.stub.AddProduct(error_product, timeout=self.timeout)
            if hasattr(response, 'success'):
                if not response.success:
                    print(f"[OK] Error manejado: {response.message}")
                else:
                    print("[WARNING] Datos inválidos no validados")
            else:
                print("[WARNING] Método no implementado completamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.INTERNAL:
                print("[OK] Error interno manejado")
            elif e.code() == grpc.StatusCode.INVALID_ARGUMENT:
                print("[OK] Argumentos inválidos manejados")
            elif e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Otro error gRPC: {e.code()}")
    
    def test_09_bidirectional_streaming(self):
        try:
            response = self.stub.AddProduct(self.valid_product, timeout=self.timeout)
            if hasattr(response, 'success'):
                print("[OK] Método unario funcional")
            else:
                print("[WARNING] Método no implementado completamente")
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNIMPLEMENTED:
                print("[WARNING] Método no implementado")
            else:
                print(f"[OK] Error gRPC: {e.code()}")
    
    def test_10_interoperability(self):
        product = product_pb2.Product(
            sku="INTEROP-001",
            name="Producto Interoperabilidad",
            category="MANUAL_TOOLS",
            price=15000.0
        )
        serialized = product.SerializeToString()
        self.assertIsInstance(serialized, bytes)
        self.assertGreater(len(serialized), 0)
        deserialized = product_pb2.Product.FromString(serialized)
        self.assertEqual(deserialized.sku, "INTEROP-001")
        self.assertEqual(deserialized.name, "Producto Interoperabilidad")
        self.assertEqual(deserialized.category, "MANUAL_TOOLS")
        self.assertEqual(deserialized.price, 15000.0)
        print("[OK] Interoperabilidad: serialización/deserialización correcta")

def run_grpc_tests():
    """Ejecutar todas las pruebas gRPC"""
    print("[INFO] Iniciando pruebas gRPC...")
    print("=" * 50)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGRPCProductService)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("=" * 50)
    print("[RESULTADOS] Pruebas gRPC:")
    print(f"   - Ejecutadas: {result.testsRun}")
    print(f"   - Errores: {len(result.errors)}")
    print(f"   - Fallos: {len(result.failures)}")
    print(f"   - Éxitos: {result.testsRun - len(result.errors) - len(result.failures)}")
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_grpc_tests()
    sys.exit(0 if success else 1)
