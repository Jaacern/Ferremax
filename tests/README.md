# Suite de Pruebas FERREMAS

Este directorio contiene todas las pruebas automatizadas para verificar el funcionamiento correcto de la aplicación FERREMAS.

## 📋 Casos de Prueba Implementados

### 🚀 gRPC (10 casos de prueba)
1. **Conexión exitosa** - Verificar que el cliente puede establecer conexión con el servidor gRPC
2. **Llamada a método válido** - Probar un método gRPC con parámetros válidos y verificar la respuesta correcta
3. **Llamada a método con parámetros inválidos** - Enviar datos inválidos y validar respuesta de error
4. **Timeout de llamada** - Probar que la llamada al método respeta un timeout configurado
5. **Prueba de carga** - Ejecutar múltiples llamadas concurrentes para evaluar rendimiento
6. **Cancelación de llamada** - Probar que el cliente puede cancelar una llamada en curso
7. **Autenticación y autorización** - Validar que los métodos protegidos solo se puedan acceder con credenciales válidas
8. **Manejo de errores del servidor** - Forzar errores internos y verificar códigos de error correctos
9. **Streaming bidireccional** - Probar el intercambio continuo de mensajes entre cliente y servidor
10. **Interoperabilidad** - Verificar que clientes en diferentes lenguajes pueden comunicarse correctamente

### 🌐 REST API (10 casos de prueba)
1. **Respuesta 200 OK con datos válidos** - Probar endpoints GET con parámetros correctos
2. **Creación de recurso (POST) con datos válidos** - Verificar creación y respuesta 201 Created
3. **Actualización de recurso (PUT/PATCH)** - Confirmar que los datos se actualizan correctamente
4. **Eliminación de recurso (DELETE)** - Validar que el recurso se elimina y la API responde con 204 No Content
5. **Manejo de parámetros inválidos** - Enviar parámetros malformados y validar respuesta 400 Bad Request
6. **Autenticación y autorización** - Probar acceso sin token y con token inválido, debe rechazar
7. **Paginación y filtrado** - Verificar que el API responde correctamente con parámetros de paginado y filtros
8. **Prueba de carga** - Realizar múltiples peticiones simultáneas y medir tiempo de respuesta
9. **Prueba de CORS** - Validar que las configuraciones CORS permiten o bloquean dominios correctamente
10. **Manejo de errores del servidor** - Forzar un error 500 y validar que el cliente recibe mensaje adecuado

### 📡 Server-Sent Events (SSE) (10 casos de prueba)
1. **Conexión establecida correctamente** - El cliente recibe evento de conexión abierto
2. **Recepción de mensajes** - Validar que el cliente recibe eventos enviados por el servidor
3. **Reconexión automática** - Simular desconexión y verificar que el cliente intenta reconectar
4. **Orden de mensajes** - Verificar que los eventos llegan en orden correcto
5. **Manejo de datos JSON** - Probar envío y recepción de mensajes con payload en formato JSON
6. **Evento de error** - Forzar error en la conexión SSE y validar manejo en el cliente
7. **Prueba de rendimiento** - Enviar un gran volumen de eventos y medir la capacidad del cliente para procesarlos
8. **Cerrar conexión desde servidor** - Validar que el cliente detecta la desconexión cuando el servidor cierra la conexión
9. **Manejo de múltiples conexiones** - Probar que el servidor puede gestionar varias conexiones SSE simultáneas
10. **Tipos de eventos específicos** - Verificar que se pueden recibir diferentes tipos de eventos SSE

## 🚀 Cómo Ejecutar las Pruebas

### Prerrequisitos

1. **Servidores corriendo:**
   ```bash
   # Terminal 1: Backend Flask + gRPC
   cd backend
   python run.py
   
   # Terminal 2: Frontend React
   cd frontend
   npm start
   
   # Terminal 3: Redis (para SSE)
   redis-server
   ```

2. **Dependencias de Python:**
   ```bash
   pip install requests sseclient-py grpcio grpcio-tools
   ```

### Ejecutar Todas las Pruebas

```bash
# Desde el directorio raíz del proyecto
python run_all_tests.py
```

### Ejecutar Pruebas Individuales

```bash
# Pruebas gRPC
cd tests
python test_grpc.py

# Pruebas REST API
python test_rest_api.py

# Pruebas SSE
python test_sse.py
```

## 📊 Interpretación de Resultados

### ✅ Pruebas Exitosas
- **gRPC**: Conexión establecida, métodos responden correctamente
- **REST API**: Endpoints funcionan, autenticación correcta, CORS configurado
- **SSE**: Conexiones establecidas, eventos recibidos, reconexión automática

### ⚠️ Pruebas con Advertencias
- **Métodos no implementados**: Algunas funcionalidades están en desarrollo
- **Servidores no corriendo**: Verificar que todos los servicios estén activos
- **Timeouts**: Algunas pruebas pueden tardar más de lo esperado

### ❌ Pruebas Fallidas
- **Errores de conexión**: Verificar que los servidores estén corriendo
- **Errores de autenticación**: Verificar configuración de JWT
- **Errores de base de datos**: Verificar conexión a PostgreSQL

## 🔧 Solución de Problemas

### Error: "No module named 'grpc'"
```bash
pip install grpcio grpcio-tools
```

### Error: "No module named 'sseclient'"
```bash
pip install sseclient-py
```

### Error: "Connection refused"
- Verificar que el backend esté corriendo en `localhost:5000`
- Verificar que el servidor gRPC esté corriendo en `localhost:50052`
- Verificar que Redis esté corriendo para SSE

### Error: "Database connection failed"
- Verificar que PostgreSQL esté corriendo
- Verificar las credenciales en el archivo `.env`
- Ejecutar migraciones: `python backend/run.py --migrate`

## 📈 Métricas de Rendimiento

Las pruebas incluyen métricas de rendimiento:

- **gRPC**: Tiempo de respuesta promedio, llamadas concurrentes
- **REST API**: Tiempo de respuesta, peticiones por segundo
- **SSE**: Eventos procesados por segundo, latencia de conexión

## 🎯 Cobertura de Pruebas

Esta suite de pruebas cubre:

- ✅ **Funcionalidad básica** de todos los servicios
- ✅ **Manejo de errores** y casos edge
- ✅ **Rendimiento** y escalabilidad
- ✅ **Seguridad** y autenticación
- ✅ **Interoperabilidad** entre servicios

## 📝 Notas de Desarrollo

- Las pruebas están diseñadas para ser **no destructivas**
- Se crean datos de prueba temporales que se limpian automáticamente
- Las pruebas son **independientes** y pueden ejecutarse en cualquier orden
- Se incluyen **timeouts** para evitar bloqueos indefinidos

## 🤝 Contribución

Para agregar nuevas pruebas:

1. Crear un nuevo archivo `test_*.py` en este directorio
2. Seguir la estructura de las pruebas existentes
3. Incluir documentación clara de lo que se está probando
4. Agregar la nueva prueba al script principal `run_all_tests.py` 