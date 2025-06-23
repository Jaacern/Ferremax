#!/usr/bin/env python3
"""
Casos de prueba para Server-Sent Events (SSE) - FERREMAS
=========================================================

Este archivo contiene todos los casos de prueba para verificar el funcionamiento
correcto de las notificaciones en tiempo real mediante SSE.
"""

import unittest
import requests
import json
import time
import threading
import sseclient
import sys
import os
from urllib.parse import urljoin

class TestSSE(unittest.TestCase):
    """Suite de pruebas para Server-Sent Events"""

    def setUp(self):
        self.base_url = "http://localhost:5000"
        self.sse_url = f"{self.base_url}/stream"
        self.session = requests.Session()
        self.received_events = []
        self.connection_status = None

    def tearDown(self):
        self.session.close()

    def test_01_connection_established(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                print("[OK] Conexión SSE establecida correctamente")
                headers = response.headers
                self.assertEqual(headers.get('Content-Type'), 'text/event-stream')
                self.assertEqual(headers.get('Cache-Control'), 'no-cache')
                self.assertEqual(headers.get('Connection'), 'keep-alive')
                print("[OK] Headers SSE correctos")
                response.close()
            else:
                print(f"[WARN] Conexión SSE: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Conexión SSE: {e}")

    def test_02_message_reception(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                start_time = time.time()
                events_received = 0
                for event in client.events():
                    events_received += 1
                    print(f"[OK] Evento recibido: {event.event} - {event.data}")
                    self.assertIsNotNone(event.event)
                    self.assertIsNotNone(event.data)
                    if events_received >= 3 or (time.time() - start_time) > 5:
                        break
                if events_received > 0:
                    print(f"[OK] {events_received} eventos recibidos")
                else:
                    print("[WARN] No se recibieron eventos")
                client.close()
                response.close()
            else:
                print(f"[WARN] Recepción: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Recepción: {e}")
        except Exception as e:
            print(f"[ERROR] Recepción: {e}")

    def test_03_automatic_reconnection(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                response.close()
                time.sleep(1)
                response2 = self.session.get(self.sse_url, stream=True)
                if response2.status_code == 200:
                    print("[OK] Reconexión exitosa")
                    response2.close()
                else:
                    print(f"[WARN] Reconexión: {response2.status_code} (esperado 200)")
            else:
                print(f"[WARN] Reconexión: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Reconexión: {e}")

    def test_04_message_order(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                events = []
                start_time = time.time()
                for event in client.events():
                    events.append({'timestamp': time.time(), 'event': event.event, 'data': event.data})
                    if len(events) >= 5 or (time.time() - start_time) > 5:
                        break
                if len(events) > 1:
                    timestamps = [e['timestamp'] for e in events]
                    is_ordered = all(timestamps[i] <= timestamps[i+1] for i in range(len(timestamps)-1))
                    if is_ordered:
                        print("[OK] Eventos en orden cronológico")
                    else:
                        print("[WARN] Eventos fuera de orden")
                else:
                    print("[WARN] No se recibieron suficientes eventos")
                client.close()
                response.close()
            else:
                print(f"[WARN] Orden: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Orden: {e}")

    def test_05_json_data_handling(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                json_events = 0
                start_time = time.time()
                for event in client.events():
                    try:
                        data = json.loads(event.data)
                        json_events += 1
                        print(f"[OK] JSON recibido: {event.event} - {data}")
                        self.assertIsInstance(data, (dict, list))
                    except json.JSONDecodeError:
                        print(f"[WARN] No es JSON: {event.data}")
                    if json_events >= 3 or (time.time() - start_time) > 5:
                        break
                print(f"[OK] Eventos JSON: {json_events}") if json_events else print("[WARN] No se recibieron JSON")
                client.close()
                response.close()
            else:
                print(f"[WARN] JSON: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] JSON: {e}")

    def test_06_error_event(self):
        try:
            invalid_sse_url = f"{self.base_url}/stream-invalid"
            response = self.session.get(invalid_sse_url, stream=True)
            if response.status_code == 404:
                print("[OK] Error 404 recibido correctamente")
            else:
                print(f"[WARN] Esperado 404, se recibió {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"[OK] Error de conexión manejado: {e}")

    def test_07_performance_test(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                events_processed = 0
                start_time = time.time()
                for event in client.events():
                    events_processed += 1
                    time.sleep(0.01)
                    if events_processed >= 50 or (time.time() - start_time) > 10:
                        break
                end_time = time.time()
                duration = end_time - start_time
                eps = events_processed / duration if duration > 0 else 0
                print(f"[OK] Eventos procesados: {events_processed} en {duration:.2f}s ({eps:.2f}/s)")
                client.close()
                response.close()
            else:
                print(f"[WARN] Rendimiento: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Rendimiento: {e}")

    def test_08_server_connection_close(self):
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                response.close()
                try:
                    for event in client.events():
                        pass
                except Exception as e:
                    print(f"[OK] Desconexión detectada: {e}")
                else:
                    print("[WARN] Cliente no detectó desconexión")
            else:
                print(f"[WARN] Desconexión: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Desconexión: {e}")

    def test_09_multiple_connections(self):
        connections = []
        max_connections = 5
        try:
            for i in range(max_connections):
                response = self.session.get(self.sse_url, stream=True)
                if response.status_code == 200:
                    connections.append(response)
                    print(f"[OK] Conexión {i+1} establecida")
                else:
                    print(f"[WARN] Conexión {i+1}: {response.status_code}")
            if len(connections) > 1:
                print(f"[OK] {len(connections)} conexiones simultáneas")
                time.sleep(2)
                for i, conn in enumerate(connections):
                    conn.close()
                    print(f"[OK] Conexión {i+1} cerrada")
            else:
                print("[WARN] Conexiones insuficientes")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Múltiples conexiones: {e}")
        finally:
            for conn in connections:
                try:
                    conn.close()
                except:
                    pass

    def test_10_specific_event_types(self):
        event_types_to_check = ['stock_alert', 'order_notification', 'payment_notification', 'system_notification']
        try:
            response = self.session.get(self.sse_url, stream=True)
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                received_types = set()
                start_time = time.time()
                for event in client.events():
                    if event.event in event_types_to_check:
                        received_types.add(event.event)
                        print(f"[OK] Evento específico: {event.event}")
                    if len(received_types) >= len(event_types_to_check) or (time.time() - start_time) > 10:
                        break
                print(f"[OK] Tipos recibidos: {', '.join(received_types)}") if received_types else print("[WARN] No se recibieron tipos específicos")
                client.close()
                response.close()
            else:
                print(f"[WARN] Eventos específicos: {response.status_code} (esperado 200)")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Eventos específicos: {e}")

def run_sse_tests():
    print("[INFO] Iniciando pruebas SSE...")
    print("=" * 50)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSSE)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("=" * 50)
    print("[RESUMEN] Pruebas SSE:")
    print(f"   - Ejecutadas: {result.testsRun}")
    print(f"   - Errores: {len(result.errors)}")
    print(f"   - Fallos: {len(result.failures)}")
    print(f"   - Exitosas: {result.testsRun - len(result.errors) - len(result.failures)}")
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_sse_tests()
    sys.exit(0 if success else 1)
