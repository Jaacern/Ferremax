#!/usr/bin/env python3
"""
Script de configuración rápida para las pruebas de FERREMAS
==========================================================

Este script instala todas las dependencias necesarias para ejecutar
las pruebas de gRPC, REST API y SSE.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Ejecutar un comando y mostrar el resultado"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} falló:")
        print(f"   Error: {e.stderr}")
        return False

def check_python_version():
    """Verificar que la versión de Python sea compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        print(f"   Versión actual: {version.major}.{version.minor}.{version.micro}")
        return False
    else:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True

def install_dependencies():
    """Instalar dependencias de las pruebas"""
    print("\n📦 Instalando dependencias...")
    
    # Actualizar pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Actualizando pip"):
        return False
    
    # Instalar dependencias básicas
    basic_deps = [
        "requests>=2.31.0",
        "sseclient-py>=1.7.2",
        "grpcio>=1.71.0",
        "grpcio-tools>=1.71.0"
    ]
    
    for dep in basic_deps:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Instalando {dep}"):
            return False
    
    # Instalar dependencias opcionales
    optional_deps = [
        "unittest2>=1.1.0",
        "jsonschema>=4.17.3",
        "psutil>=5.9.0",
        "pydantic>=2.4.2",
        "colorlog>=6.7.0"
    ]
    
    print("\n📦 Instalando dependencias opcionales...")
    for dep in optional_deps:
        run_command(f"{sys.executable} -m pip install {dep}", f"Instalando {dep}")
    
    return True

def verify_installation():
    """Verificar que las dependencias se instalaron correctamente"""
    print("\n🔍 Verificando instalación...")
    
    modules_to_check = [
        ("requests", "Cliente HTTP"),
        ("sseclient", "Cliente SSE"),
        ("grpc", "Cliente gRPC"),
        ("unittest", "Framework de pruebas")
    ]
    
    all_ok = True
    
    for module, description in modules_to_check:
        try:
            __import__(module)
            print(f"✅ {description} ({module}) - OK")
        except ImportError:
            print(f"❌ {description} ({module}) - No disponible")
            all_ok = False
    
    return all_ok

def create_test_environment():
    """Crear archivos de configuración para las pruebas"""
    print("\n📝 Configurando entorno de pruebas...")
    
    # Crear directorio de pruebas si no existe
    if not os.path.exists("tests"):
        os.makedirs("tests")
        print("✅ Directorio 'tests' creado")
    
    # Verificar que los archivos de prueba existen
    test_files = [
        "tests/test_grpc.py",
        "tests/test_rest_api.py", 
        "tests/test_sse.py",
        "tests/README.md",
        "tests/requirements.txt"
    ]
    
    missing_files = []
    for file_path in test_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("⚠️ Archivos de prueba faltantes:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print("   Ejecuta las pruebas desde el directorio raíz del proyecto")
    else:
        print("✅ Todos los archivos de prueba están disponibles")
    
    return len(missing_files) == 0

def main():
    """Función principal"""
    print("🚀 Configuración de Pruebas FERREMAS")
    print("=" * 50)
    
    # Verificar versión de Python
    if not check_python_version():
        sys.exit(1)
    
    # Instalar dependencias
    if not install_dependencies():
        print("\n❌ Error al instalar dependencias")
        sys.exit(1)
    
    # Verificar instalación
    if not verify_installation():
        print("\n❌ Error en la verificación de dependencias")
        sys.exit(1)
    
    # Configurar entorno
    create_test_environment()
    
    print("\n" + "=" * 50)
    print("🎉 Configuración completada exitosamente!")
    print("\n📋 Próximos pasos:")
    print("1. Asegúrate de que los servidores estén corriendo:")
    print("   - Backend: python backend/run.py")
    print("   - Frontend: npm start (en directorio frontend)")
    print("   - Redis: redis-server")
    print("\n2. Ejecuta las pruebas:")
    print("   - Todas las pruebas: python run_all_tests.py")
    print("   - Pruebas gRPC: cd tests && python test_grpc.py")
    print("   - Pruebas REST API: cd tests && python test_rest_api.py")
    print("   - Pruebas SSE: cd tests && python test_sse.py")
    print("\n📚 Para más información, consulta tests/README.md")

if __name__ == '__main__':
    main() 