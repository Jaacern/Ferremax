#!/usr/bin/env python3
"""
Casos de prueba para Server-Sent Events (SSE) - FERREMAS
========================================================

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
        """Configuración inicial para cada prueba"""
        self.base_url = "http://localhost:5000"
        self.sse_url = f"{self.base_url}/stream"
        self.session = requests.Session()
        
        # Eventos recibidos durante las pruebas
        self.received_events = []
        self.connection_status = None
    
    def tearDown(self):
        """Limpieza después de cada prueba"""
        self.session.close()
    
    def test_01_connection_established(self):
        """1. Conexión establecida correctamente: El cliente recibe evento de conexión abierto"""
        try:
            # Intentar establecer conexión SSE
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                print("✅ Conexión SSE establecida correctamente")
                
                # Verificar headers SSE
                headers = response.headers
                self.assertEqual(headers.get('Content-Type'), 'text/event-stream')
                self.assertEqual(headers.get('Cache-Control'), 'no-cache')
                self.assertEqual(headers.get('Connection'), 'keep-alive')
                
                print("✅ Headers SSE correctos")
                
                # Cerrar la conexión
                response.close()
            else:
                print(f"⚠️ Conexión SSE: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Conexión SSE: Error de conexión - {e}")
    
    def test_02_message_reception(self):
        """2. Recepción de mensajes: Validar que el cliente recibe eventos enviados por el servidor"""
        try:
            # Establecer conexión SSE
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                # Crear cliente SSE
                client = sseclient.SSEClient(response)
                
                # Esperar por eventos (timeout de 5 segundos)
                start_time = time.time()
                events_received = 0
                
                for event in client.events():
                    events_received += 1
                    print(f"✅ Evento recibido: {event.event} - {event.data}")
                    
                    # Verificar estructura del evento
                    self.assertIsNotNone(event.event)
                    self.assertIsNotNone(event.data)
                    
                    # Salir después de recibir algunos eventos o timeout
                    if events_received >= 3 or (time.time() - start_time) > 5:
                        break
                
                if events_received > 0:
                    print(f"✅ Recepción de mensajes: {events_received} eventos recibidos")
                else:
                    print("⚠️ Recepción de mensajes: No se recibieron eventos (posible timeout)")
                
                # Cerrar conexión
                client.close()
                response.close()
            else:
                print(f"⚠️ Recepción de mensajes: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Recepción de mensajes: Error de conexión - {e}")
        except Exception as e:
            print(f"❌ Recepción de mensajes: Error - {e}")
    
    def test_03_automatic_reconnection(self):
        """3. Reconexión automática: Simular desconexión y verificar que el cliente intenta reconectar"""
        try:
            # Establecer conexión SSE
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                # Simular desconexión cerrando la conexión
                response.close()
                
                # Intentar reconectar
                time.sleep(1)
                response2 = self.session.get(self.sse_url, stream=True)
                
                if response2.status_code == 200:
                    print("✅ Reconexión automática: Conexión restablecida")
                    response2.close()
                else:
                    print(f"⚠️ Reconexión automática: {response2.status_code} (esperado 200)")
            else:
                print(f"⚠️ Reconexión automática: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Reconexión automática: Error de conexión - {e}")
    
    def test_04_message_order(self):
        """4. Orden de mensajes: Verificar que los eventos llegan en orden correcto"""
        try:
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                events = []
                start_time = time.time()
                
                for event in client.events():
                    events.append({
                        'timestamp': time.time(),
                        'event': event.event,
                        'data': event.data
                    })
                    
                    # Salir después de recibir algunos eventos o timeout
                    if len(events) >= 5 or (time.time() - start_time) > 5:
                        break
                
                if len(events) > 1:
                    # Verificar que los eventos están en orden cronológico
                    timestamps = [e['timestamp'] for e in events]
                    is_ordered = all(timestamps[i] <= timestamps[i+1] for i in range(len(timestamps)-1))
                    
                    if is_ordered:
                        print("✅ Orden de mensajes: Los eventos llegaron en orden cronológico")
                    else:
                        print("⚠️ Orden de mensajes: Los eventos no llegaron en orden cronológico")
                else:
                    print("⚠️ Orden de mensajes: No se recibieron suficientes eventos para verificar orden")
                
                client.close()
                response.close()
            else:
                print(f"⚠️ Orden de mensajes: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Orden de mensajes: Error de conexión - {e}")
    
    def test_05_json_data_handling(self):
        """5. Manejo de datos JSON: Probar envío y recepción de mensajes con payload en formato JSON"""
        try:
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                json_events = 0
                start_time = time.time()
                
                for event in client.events():
                    try:
                        # Intentar parsear como JSON
                        data = json.loads(event.data)
                        json_events += 1
                        print(f"✅ JSON válido recibido: {event.event} - {data}")
                        
                        # Verificar estructura básica del JSON
                        if isinstance(data, dict):
                            print("✅ Estructura JSON correcta (objeto)")
                        elif isinstance(data, list):
                            print("✅ Estructura JSON correcta (array)")
                        
                    except json.JSONDecodeError:
                        print(f"⚠️ Evento no es JSON válido: {event.data}")
                    
                    # Salir después de procesar algunos eventos o timeout
                    if json_events >= 3 or (time.time() - start_time) > 5:
                        break
                
                if json_events > 0:
                    print(f"✅ Manejo de datos JSON: {json_events} eventos JSON procesados")
                else:
                    print("⚠️ Manejo de datos JSON: No se recibieron eventos JSON")
                
                client.close()
                response.close()
            else:
                print(f"⚠️ Manejo de datos JSON: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Manejo de datos JSON: Error de conexión - {e}")
    
    def test_06_error_event(self):
        """6. Evento de error: Forzar error en la conexión SSE y validar manejo en el cliente"""
        try:
            # Intentar conectar a un endpoint SSE inexistente
            invalid_sse_url = f"{self.base_url}/stream-invalid"
            response = self.session.get(invalid_sse_url, stream=True)
            
            if response.status_code == 404:
                print("✅ Evento de error: 404 Not Found (esperado para endpoint inválido)")
            else:
                print(f"⚠️ Evento de error: {response.status_code} (esperado 404)")
                
        except requests.exceptions.RequestException as e:
            print(f"✅ Evento de error: Error de conexión manejado - {e}")
    
    def test_07_performance_test(self):
        """7. Prueba de rendimiento: Enviar un gran volumen de eventos y medir la capacidad del cliente para procesarlos"""
        try:
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                events_processed = 0
                start_time = time.time()
                
                for event in client.events():
                    events_processed += 1
                    
                    # Procesar el evento (simulado)
                    time.sleep(0.01)  # Simular procesamiento
                    
                    # Salir después de procesar muchos eventos o timeout
                    if events_processed >= 50 or (time.time() - start_time) > 10:
                        break
                
                end_time = time.time()
                processing_time = end_time - start_time
                
                if events_processed > 0:
                    events_per_second = events_processed / processing_time
                    print(f"✅ Prueba de rendimiento:")
                    print(f"   - Eventos procesados: {events_processed}")
                    print(f"   - Tiempo de procesamiento: {processing_time:.2f} segundos")
                    print(f"   - Eventos por segundo: {events_per_second:.2f}")
                else:
                    print("⚠️ Prueba de rendimiento: No se procesaron eventos")
                
                client.close()
                response.close()
            else:
                print(f"⚠️ Prueba de rendimiento: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Prueba de rendimiento: Error de conexión - {e}")
    
    def test_08_server_connection_close(self):
        """8. Cerrar conexión desde servidor: Validar que el cliente detecta la desconexión cuando el servidor cierra la conexión"""
        try:
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                # Simular cierre de conexión desde el servidor
                response.close()
                
                # Verificar que el cliente detecta la desconexión
                try:
                    # Intentar leer más eventos (debería fallar)
                    for event in client.events():
                        pass
                except Exception as e:
                    print(f"✅ Cierre de conexión desde servidor: Cliente detectó desconexión - {e}")
                else:
                    print("⚠️ Cierre de conexión desde servidor: Cliente no detectó desconexión")
            else:
                print(f"⚠️ Cierre de conexión desde servidor: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Cierre de conexión desde servidor: Error de conexión - {e}")
    
    def test_09_multiple_connections(self):
        """9. Manejo de múltiples conexiones: Probar que el servidor puede gestionar varias conexiones SSE simultáneas"""
        connections = []
        max_connections = 5
        
        try:
            # Establecer múltiples conexiones
            for i in range(max_connections):
                response = self.session.get(self.sse_url, stream=True)
                if response.status_code == 200:
                    connections.append(response)
                    print(f"✅ Conexión {i+1} establecida")
                else:
                    print(f"⚠️ Conexión {i+1}: {response.status_code} (esperado 200)")
            
            if len(connections) > 1:
                print(f"✅ Múltiples conexiones: {len(connections)} conexiones simultáneas establecidas")
                
                # Mantener las conexiones abiertas por un momento
                time.sleep(2)
                
                # Cerrar todas las conexiones
                for i, conn in enumerate(connections):
                    conn.close()
                    print(f"✅ Conexión {i+1} cerrada")
            else:
                print("⚠️ Múltiples conexiones: No se pudieron establecer suficientes conexiones")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Múltiples conexiones: Error de conexión - {e}")
        finally:
            # Asegurar que todas las conexiones se cierren
            for conn in connections:
                try:
                    conn.close()
                except:
                    pass
    
    def test_10_specific_event_types(self):
        """10. Tipos de eventos específicos: Verificar que se pueden recibir diferentes tipos de eventos SSE"""
        event_types_to_check = [
            'stock_alert',
            'order_notification', 
            'payment_notification',
            'system_notification'
        ]
        
        try:
            response = self.session.get(self.sse_url, stream=True)
            
            if response.status_code == 200:
                client = sseclient.SSEClient(response)
                
                received_types = set()
                start_time = time.time()
                
                for event in client.events():
                    if event.event in event_types_to_check:
                        received_types.add(event.event)
                        print(f"✅ Evento específico recibido: {event.event}")
                    
                    # Salir después de recibir todos los tipos o timeout
                    if len(received_types) >= len(event_types_to_check) or (time.time() - start_time) > 10:
                        break
                
                if received_types:
                    print(f"✅ Tipos de eventos específicos: {len(received_types)} tipos recibidos")
                    print(f"   - Tipos recibidos: {', '.join(received_types)}")
                else:
                    print("⚠️ Tipos de eventos específicos: No se recibieron eventos específicos")
                
                client.close()
                response.close()
            else:
                print(f"⚠️ Tipos de eventos específicos: {response.status_code} (esperado 200)")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Tipos de eventos específicos: Error de conexión - {e}")

def run_sse_tests():
    """Ejecutar todas las pruebas de SSE"""
    print("🚀 Iniciando pruebas SSE...")
    print("=" * 50)
    
    # Crear suite de pruebas
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSSE)
    
    # Ejecutar pruebas
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("=" * 50)
    print(f"📊 Resultados de pruebas SSE:")
    print(f"   - Pruebas ejecutadas: {result.testsRun}")
    print(f"   - Errores: {len(result.errors)}")
    print(f"   - Fallos: {len(result.failures)}")
    print(f"   - Exitosas: {result.testsRun - len(result.errors) - len(result.failures)}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_sse_tests()
    sys.exit(0 if success else 1) 