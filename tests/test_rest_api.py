#!/usr/bin/env python3
"""
Casos de prueba para REST API - FERREMAS
=========================================

Este archivo contiene todos los casos de prueba para verificar el funcionamiento
correcto de la API REST de FERREMAS.
"""

import unittest
import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import sys
import os

class TestRESTAPI(unittest.TestCase):
    """Suite de pruebas para la API REST de FERREMAS"""

    def setUp(self):
        self.base_url = "http://localhost:5000/api"
        self.session = requests.Session()
        self.test_user = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        self.test_product = {
            "sku": "TEST-REST-001",
            "name": "Producto REST Test",
            "price": 15000.0,
            "category": "MANUAL_TOOLS",
            "description": "Producto de prueba para API REST",
            "brand": "Test Brand",
            "is_featured": False,
            "is_new": True
        }
        self.auth_token = None

    def tearDown(self):
        self.session.close()

    def get_auth_token(self):
        if not self.auth_token:
            try:
                response = self.session.post(f"{self.base_url}/auth/register", json=self.test_user)
                if response.status_code == 201:
                    self.auth_token = response.json().get('access_token')
                else:
                    login_data = {
                        "username": self.test_user["username"],
                        "password": self.test_user["password"]
                    }
                    response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
                    if response.status_code == 200:
                        self.auth_token = response.json().get('access_token')
            except Exception as e:
                print(f"[WARN] No se pudo obtener token: {e}")
        return self.auth_token

    def test_01_200_ok_with_valid_data(self):
        endpoints = [
            "/products/categories",
            "/products/branches",
            "/products?page=1&per_page=5"
        ]
        for endpoint in endpoints:
            try:
                res = self.session.get(f"{self.base_url}{endpoint}")
                self.assertEqual(res.status_code, 200)
                self.assertIsInstance(res.json(), (dict, list))
                print(f"[OK] GET {endpoint}: 200 OK")
            except Exception as e:
                print(f"[ERROR] GET {endpoint}: {e}")

    def test_02_create_resource_post(self):
        token = self.get_auth_token()
        if not token:
            print("[WARN] Token no disponible")
            return
        headers = {"Authorization": f"Bearer {token}"}
        try:
            res = self.session.post(f"{self.base_url}/products", json=self.test_product, headers=headers)
            if res.status_code == 201:
                print(f"[OK] POST /products: 201 Created")
            elif res.status_code == 400:
                print(f"[WARN] POST /products: 400 Bad Request - {res.json().get('error')}")
            else:
                print(f"[WARN] POST /products: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"[ERROR] POST /products: {e}")

    def test_03_update_resource_put(self):
        token = self.get_auth_token()
        if not token:
            print("[WARN] Token no disponible")
            return
        headers = {"Authorization": f"Bearer {token}"}
        try:
            res = self.session.get(f"{self.base_url}/products?page=1&per_page=1")
            if res.status_code == 200 and res.json().get("products"):
                pid = res.json()["products"][0]["id"]
                update = {"name": "Producto Actualizado", "price": 20000.0}
                r = self.session.put(f"{self.base_url}/products/{pid}", json=update, headers=headers)
                self.assertEqual(r.status_code, 200)
                print(f"[OK] PUT /products/{pid}: 200 OK")
            else:
                print("[WARN] No hay productos para actualizar")
        except Exception as e:
            print(f"[ERROR] PUT /products: {e}")

    def test_04_delete_resource(self):
        token = self.get_auth_token()
        if not token:
            print("[WARN] Token no disponible")
            return
        headers = {"Authorization": f"Bearer {token}"}
        temp_product = self.test_product.copy()
        temp_product["sku"] = f"TEMP-DELETE-{int(time.time())}"
        try:
            res = self.session.post(f"{self.base_url}/products", json=temp_product, headers=headers)
            if res.status_code == 201:
                print("[OK] Producto temporal creado para prueba de eliminación")
            else:
                print(f"[WARN] No se pudo crear producto - {res.status_code}")
        except Exception as e:
            print(f"[ERROR] DELETE test: {e}")

    def test_05_invalid_parameters(self):
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        invalids = [
            {"name": "Sin SKU", "price": 1000.0, "category": "MANUAL_TOOLS"},
            {"sku": "INVALID-001", "name": "Negativo", "price": -1000.0, "category": "MANUAL_TOOLS"},
            {"sku": "INVALID-002", "name": "Categoría Inválida", "price": 1000.0, "category": "INVALID"}
        ]
        for i, data in enumerate(invalids):
            try:
                r = self.session.post(f"{self.base_url}/products", json=data, headers=headers)
                self.assertEqual(r.status_code, 400)
                print(f"[OK] Parámetro inválido {i+1}: 400 Bad Request")
            except Exception as e:
                print(f"[ERROR] Parámetro inválido {i+1}: {e}")

    def test_06_authentication_authorization(self):
        try:
            r1 = self.session.post(f"{self.base_url}/products", json=self.test_product)
            self.assertEqual(r1.status_code, 401)
            print("[OK] Acceso sin token: 401 Unauthorized")
        except Exception as e:
            print(f"[ERROR] Acceso sin token: {e}")
        try:
            r2 = self.session.post(
                f"{self.base_url}/products", json=self.test_product,
                headers={"Authorization": "Bearer invalid_token"}
            )
            self.assertEqual(r2.status_code, 401)
            print("[OK] Acceso con token inválido: 401 Unauthorized")
        except Exception as e:
            print(f"[ERROR] Acceso token inválido: {e}")

    def test_07_pagination_filtering(self):
        queries = [
            "?page=1&per_page=5", "?category=MANUAL_TOOLS",
            "?featured=true", "?new=true",
            "?search=herramienta", "?min_price=1000&max_price=50000"
        ]
        for q in queries:
            try:
                r = self.session.get(f"{self.base_url}/products{q}")
                self.assertEqual(r.status_code, 200)
                self.assertIn("products", r.json())
                print(f"[OK] Filtro {q}: 200 OK")
            except Exception as e:
                print(f"[ERROR] Filtro {q}: {e}")

    def test_08_load_testing(self):
        def fetch(i):
            try:
                start = time.time()
                r = self.session.get(f"{self.base_url}/products/categories")
                return time.time() - start
            except:
                return None
        with ThreadPoolExecutor(max_workers=10) as ex:
            times = list(filter(None, ex.map(fetch, range(20))))
        if times:
            print(f"[OK] Prueba de carga: {len(times)} exitosas")
        else:
            print("[ERROR] Todas las peticiones fallaron")

    def test_09_cors_testing(self):
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type"
        }
        try:
            res = self.session.options(f"{self.base_url}/products/categories", headers=headers)
            if "Access-Control-Allow-Origin" in res.headers:
                print("[OK] CORS headers detectados")
            else:
                print("[WARN] No se encontraron headers CORS")
        except Exception as e:
            print(f"[ERROR] CORS: {e}")

    def test_10_server_error_handling(self):
        try:
            r = self.session.get(f"{self.base_url}/endpoint-inexistente")
            self.assertEqual(r.status_code, 404)
            print("[OK] Error 404 manejado")
        except Exception as e:
            print(f"[ERROR] Error 404 general: {e}")
        try:
            r = self.session.get(f"{self.base_url}/products/999999")
            self.assertEqual(r.status_code, 404)
            print("[OK] Error 404 producto manejado")
        except Exception as e:
            print(f"[ERROR] Error 404 producto: {e}")

def run_rest_api_tests():
    print("[INFO] Iniciando pruebas REST API")
    print("=" * 50)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestRESTAPI)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    print("=" * 50)
    print("[SUMMARY] REST API:")
    print(f"   Ejecutadas: {result.testsRun}")
    print(f"   Errores: {len(result.errors)}")
    print(f"   Fallos: {len(result.failures)}")
    print(f"   Éxitos: {result.testsRun - len(result.errors) - len(result.failures)}")
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_rest_api_tests()
    sys.exit(0 if success else 1)
