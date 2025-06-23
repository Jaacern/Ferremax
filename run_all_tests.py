#!/usr/bin/env python3
"""
Script principal para ejecutar todas las pruebas de FERREMAS
===========================================================

Este script ejecuta todas las pruebas de:
- gRPC
- REST API  
- Server-Sent Events (SSE)

Y genera un reporte completo de los resultados.
"""

import sys
import os
import time
import subprocess
from datetime import datetime

def print_header(title):
    """Imprimir un encabezado formateado"""
    print("\n" + "=" * 60)
    print(f"🚀 {title}")
    print("=" * 60)

def print_section(title):
    """Imprimir una sección formateada"""
    print(f"\n📋 {title}")
    print("-" * 40)

def check_server_status():
    """Verificar si los servidores están corriendo"""
    print_section("Verificando estado de servidores")
    
    servers = [
        ("Backend Flask", "http://localhost:5000"),
        ("gRPC Server", "localhost:50052"),
        ("Frontend React", "http://localhost:3000")
    ]
    
    all_running = True
    
    for name, url in servers:
        try:
            if "localhost:50052" in url:
                # Para gRPC, intentar una conexión simple
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('localhost', 50052))
                sock.close()
                if result == 0:
                    print(f"✅ {name}: Corriendo")
                else:
                    print(f"❌ {name}: No está corriendo")
                    all_running = False
            else:
                # Para HTTP, hacer una petición GET
                import requests
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ {name}: Corriendo")
                else:
                    print(f"⚠️ {name}: Respondiendo pero con status {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: No está corriendo - {e}")
            all_running = False
    
    return all_running

def run_grpc_tests():
    """Ejecutar pruebas de gRPC"""
    print_section("Ejecutando pruebas gRPC")
    
    try:
        # Cambiar al directorio de pruebas
        os.chdir("tests")
        
        # Ejecutar pruebas gRPC
        result = subprocess.run([
            sys.executable, "test_grpc.py"
        ], capture_output=True, text=True, timeout=60)
        
        print(result.stdout)
        if result.stderr:
            print("Errores:", result.stderr)
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("❌ Pruebas gRPC: Timeout (más de 60 segundos)")
        return False
    except Exception as e:
        print(f"❌ Pruebas gRPC: Error - {e}")
        return False
    finally:
        # Volver al directorio original
        os.chdir("..")

def run_rest_api_tests():
    """Ejecutar pruebas de REST API"""
    print_section("Ejecutando pruebas REST API")
    
    try:
        # Cambiar al directorio de pruebas
        os.chdir("tests")
        
        # Ejecutar pruebas REST API
        result = subprocess.run([
            sys.executable, "test_rest_api.py"
        ], capture_output=True, text=True, timeout=60)
        
        print(result.stdout)
        if result.stderr:
            print("Errores:", result.stderr)
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("❌ Pruebas REST API: Timeout (más de 60 segundos)")
        return False
    except Exception as e:
        print(f"❌ Pruebas REST API: Error - {e}")
        return False
    finally:
        # Volver al directorio original
        os.chdir("..")

def run_sse_tests():
    """Ejecutar pruebas de SSE"""
    print_section("Ejecutando pruebas SSE")
    
    try:
        # Cambiar al directorio de pruebas
        os.chdir("tests")
        
        # Ejecutar pruebas SSE
        result = subprocess.run([
            sys.executable, "test_sse.py"
        ], capture_output=True, text=True, timeout=60)
        
        print(result.stdout)
        if result.stderr:
            print("Errores:", result.stderr)
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("❌ Pruebas SSE: Timeout (más de 60 segundos)")
        return False
    except Exception as e:
        print(f"❌ Pruebas SSE: Error - {e}")
        return False
    finally:
        # Volver al directorio original
        os.chdir("..")

def generate_report(results):
    """Generar reporte final de resultados"""
    print_header("REPORTE FINAL DE PRUEBAS")
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    failed_tests = total_tests - passed_tests
    
    print(f"📊 Resumen de resultados:")
    print(f"   - Total de suites de prueba: {total_tests}")
    print(f"   - Pruebas exitosas: {passed_tests}")
    print(f"   - Pruebas fallidas: {failed_tests}")
    print(f"   - Tasa de éxito: {(passed_tests/total_tests)*100:.1f}%")
    
    print(f"\n📋 Detalle por suite:")
    for suite_name, success in results.items():
        status = "✅ PASÓ" if success else "❌ FALLÓ"
        print(f"   - {suite_name}: {status}")
    
    # Recomendaciones
    print(f"\n💡 Recomendaciones:")
    if failed_tests == 0:
        print("   🎉 ¡Excelente! Todas las pruebas pasaron exitosamente.")
        print("   Tu implementación de gRPC, REST API y SSE está funcionando correctamente.")
    else:
        print("   🔧 Algunas pruebas fallaron. Revisa los errores arriba.")
        print("   Asegúrate de que todos los servidores estén corriendo.")
        print("   Verifica la configuración de la base de datos.")
    
    return failed_tests == 0

def main():
    """Función principal"""
    print_header("SUITE DE PRUEBAS FERREMAS")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Verificar estado de servidores
    servers_ok = check_server_status()
    
    if not servers_ok:
        print("\n⚠️ ADVERTENCIA: Algunos servidores no están corriendo.")
        print("Las pruebas pueden fallar. Asegúrate de iniciar:")
        print("   - Backend: python backend/run.py")
        print("   - Frontend: npm start (en directorio frontend)")
        print("   - Redis: redis-server (para SSE)")
        
        response = input("\n¿Continuar con las pruebas? (y/N): ")
        if response.lower() != 'y':
            print("❌ Pruebas canceladas por el usuario.")
            sys.exit(1)
    
    # Ejecutar todas las pruebas
    results = {}
    
    # Pruebas gRPC
    results["gRPC"] = run_grpc_tests()
    
    # Pruebas REST API
    results["REST API"] = run_rest_api_tests()
    
    # Pruebas SSE
    results["SSE"] = run_sse_tests()
    
    # Generar reporte final
    all_passed = generate_report(results)
    
    # Código de salida
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main() 