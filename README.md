# 🔨 FERREMAS - Sistema de Gestión para Distribuidora de Productos de Ferretería y Construcción
![Demo Ferremax](./demo.gif)

## 📑Contenido
- [Introducción](#introducción)
- [Contexto del Proyecto](#contexto-del-proyecto)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
   - [Preparación del Entorno](#preparación-del-entorno)
   - [Configuración de PostgreSQL](#configuración-de-postgresql)
   - [Configuración del Backend](#configuración-del-backend)
   - [Configuración del Frontend](#configuración-del-frontend)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Ejecución](#ejecución)
- [Funcionalidades](#funcionalidades)
- [Usuarios por Defecto](#usuarios-por-defecto)
- [Flujos de Trabajo](#flujos-de-trabajo)
- [API Endpoints](#api-endpoints)
- [Integración con Servicios Externos](#integración-con-servicios-externos)
- [Solución de Problemas](#solución-de-problemas)
- [Consideraciones para Producción](#consideraciones-para-producción)
- [Seguridad](#seguridad)
- [Rendimiento](#rendimiento)
- [Pruebas](#pruebas)
- [Licencia](#licencia)
- [Contacto](#contacto)

##📋 Introducción

FERREMAS es un sistema de comercio electrónico completo diseñado para una distribuidora de productos de ferretería y construcción. Permite a los clientes comprar productos en línea, mientras proporciona a los administradores, vendedores, bodegueros y contadores las herramientas necesarias para gestionar el inventario, pedidos, pagos y reportes.

El sistema implementa una arquitectura por capas con un backend en Python/Flask y un frontend en React, comunicándose a través de una API RESTful. También integra servicios externos como WebPay para pagos y la API del Banco Central de Chile para conversión de divisas.

## 🌎Contexto del Proyecto

La industria de la ferretería y construcción en Chile ha experimentado un crecimiento sostenido desde la década de los 50, impulsada por el desarrollo urbano y la expansión de infraestructuras. FERREMAS es una distribuidora establecida en Santiago desde los años 80, con 4 sucursales en la región metropolitana y 3 en regiones.

Durante la pandemia de COVID-19 en 2020, las ventas físicas disminuyeron significativamente. Para adaptarse a esta situación, la empresa decidió implementar una plataforma de comercio electrónico que permitiera a los clientes realizar compras en línea, y a los empleados de diferentes roles gestionar todo el proceso.

##🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor con separación clara entre el frontend y el backend:

### Backend
- **API RESTful**: Implementada con Flask
- **Arquitectura por capas**:
  - Capa de presentación (API endpoints)
  - Capa de lógica de negocio (servicios)
  - Capa de acceso a datos (modelos y ORM)
- **Base de datos relacional**: PostgreSQL

### Frontend
- **SPA (Single Page Application)**: Implementada con React
- **Arquitectura de componentes**:
  - Componentes presentacionales
  - Contenedores (smart components)
  - Estado global con Redux
- **Interfaces específicas por rol**: Administrador, Vendedor, Bodeguero, Contador y Cliente

##💻 Tecnologías

### Backend
- **Python 3.11+**
- **Flask**: Framework web
- **Flask-RESTful**: Para crear la API REST
- **Flask-SQLAlchemy**: ORM para interactuar con la base de datos
- **Flask-Migrate**: Gestión de migraciones de la base de datos
- **Flask-JWT-Extended**: Autenticación basada en tokens JWT
- **Flask-CORS**: Manejo de CORS para la comunicación con el frontend
- **Flask-SSE**: Para notificaciones en tiempo real
- **psycopg2**: Driver de PostgreSQL
- **Werkzeug**: Utilidades HTTP y WSGI
- **Redis**: Para Server-Sent Events (SSE)

### Frontend
- **React 18**: Biblioteca para interfaces de usuario
- **React Router 6**: Enrutamiento en el lado del cliente
- **Redux Toolkit**: Gestión del estado de la aplicación
- **Axios**: Cliente HTTP para realizar peticiones a la API
- **Bootstrap 5**: Framework CSS para el diseño responsive
- **React-Bootstrap**: Componentes de Bootstrap para React
- **Chart.js**: Visualización de datos con gráficos

### Base de Datos
- **PostgreSQL 15+**: Sistema de gestión de base de datos relacional

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **Visual Studio Code**: IDE recomendado
- **Postman**: Pruebas de API
- **pgAdmin 4**: Administración de PostgreSQL

##✅  Requisitos Previos

Antes de comenzar la instalación, asegúrate de tener instalado:

1. **Python 3.11+**: [Descargar e instalar Python](https://www.python.org/downloads/)
2. **Node.js 16.x+**: [Descargar e instalar Node.js](https://nodejs.org/)
3. **PostgreSQL 15+**: [Descargar e instalar PostgreSQL](https://www.postgresql.org/download/)
4. **Git**: [Descargar e instalar Git](https://git-scm.com/downloads)
5. **Redis** (opcional, para notificaciones en tiempo real): [Descargar e instalar Redis](https://redis.io/download)

##🔧 Instalación

### Preparación del Entorno

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/ferremas.git
   cd ferremas
   ```

### Configuración de PostgreSQL

1. **Iniciar pgAdmin 4** desde el menú de inicio
2. **Ingresar la contraseña maestra** de pgAdmin
3. **Crear una nueva base de datos**:
   - Expandir "Servers" → PostgreSQL
   - Clic derecho en "Databases" → "Create" → "Database..."
   - Nombre: `ferremas`
   - Owner: `postgres` (o el usuario que hayas creado)
   - Clic en "Save"

Alternativamente, desde la línea de comandos:
```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE ferremas;

# Salir de psql
\q
```

### Configuración del Backend

1. **Crear y activar un entorno virtual**:
   ```bash
   # Navegar a la carpeta del backend
   cd backend
   
   # Crear el entorno virtual
   python -m venv venv
   
   # Activar el entorno virtual (Windows)
   venv\Scripts\activate
   
   # Activar el entorno virtual (macOS/Linux)
   # source venv/bin/activate
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

   En caso de error con `psycopg2-binary`, intentar:
   ```bash
   pip install psycopg2
   ```

3. **Crear archivo de variables de entorno**:
   Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/ferremas
   SECRET_KEY=una_clave_secreta_muy_segura_para_tu_aplicacion
   CORS_ORIGINS=http://localhost:3000
   ```
   Reemplaza `tu_contraseña` con la contraseña de tu usuario PostgreSQL.

4. **Inicializar la base de datos**:
   ```bash
   python run.py --init-db
   ```
   
   Este comando crea las tablas y carga datos iniciales, incluyendo usuarios de prueba y productos.

### Configuración del Frontend

1. **Instalar dependencias**:
   ```bash
   # Navegar a la carpeta del frontend
   cd ../frontend
   
   # Instalar dependencias
   npm install
   ```

2. **Configurar proxy** (opcional):
   Si el frontend no puede conectarse al backend, verifica que el archivo `package.json` incluya:
   ```json
   "proxy": "http://localhost:5000"
   ```

##📁 Estructura del Proyecto

```
ferremas/
├── backend/
│   ├── api/                  # Endpoints de la API REST
│   ├── db/                   # Configuración y migraciones de base de datos
│   ├── models/               # Modelos de datos (ORM)
│   ├── services/             # Servicios externos (WebPay, Banco Central)
│   ├── utils/                # Utilidades y funciones auxiliares
│   ├── app.py                # Aplicación principal Flask
│   ├── config.py             # Configuración de la aplicación
│   ├── requirements.txt      # Dependencias de Python
│   └── run.py                # Script para ejecutar la aplicación
│
└── frontend/
    ├── public/               # Archivos estáticos públicos
    └── src/
        ├── assets/           # Imágenes, CSS, etc.
        ├── components/       # Componentes reutilizables de React
        │   ├── auth/         # Componentes de autenticación
        │   ├── cart/         # Componentes de carrito de compras
        │   ├── common/       # Componentes comunes (Navbar, Footer, etc.)
        │   └── products/     # Componentes de productos
        ├── pages/            # Páginas completas
        │   ├── Admin/        # Páginas para administradores
        │   ├── Auth/         # Páginas de autenticación
        │   ├── Cart/         # Páginas de carrito y checkout
        │   ├── Catalog/      # Páginas de catálogo de productos
        │   ├── User/         # Páginas de perfil de usuario
        │   ├── Vendor/       # Páginas para vendedores
        │   └── Warehouse/    # Páginas para bodegueros
        ├── services/         # Servicios para comunicación con la API
        ├── store/            # Estado global con Redux
        ├── utils/            # Utilidades y funciones auxiliares
        ├── App.js            # Componente principal de la aplicación
        └── index.js          # Punto de entrada de React
```

## ▶️Ejecución

### Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Activar el entorno virtual (si no está activado)
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Ejecutar en modo desarrollo
python run.py --debug
```

El servidor estará disponible en `http://localhost:5000`.

### Frontend

```bash
# Navegar a la carpeta del frontend
cd frontend

# Ejecutar en modo desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

##⚙️ Funcionalidades

### Generales
- Registro e inicio de sesión de usuarios
- Catálogo de productos con búsqueda y filtros
- Carrito de compras
- Proceso de checkout y pagos
- Perfiles de usuario
- Gestión de pedidos
- Notificaciones en tiempo real

### Por Rol

#### Cliente
- Registro e inicio de sesión
- Navegación por el catálogo de productos
- Búsqueda y filtrado de productos
- Agregar productos al carrito
- Checkout y opciones de pago
- Ver historial de pedidos
- Gestionar perfil

#### Administrador
- Panel de control con estadísticas
- Gestión de productos (CRUD)
- Gestión de usuarios (CRUD)
- Gestión de sucursales
- Informes de ventas
- Configuración del sistema

#### Vendedor
- Aprobar o rechazar pedidos
- Ver inventario disponible
- Enviar órdenes a bodegueros
- Organizar despacho a clientes

#### Bodeguero
- Ver órdenes de pedidos
- Aceptar y preparar pedidos
- Gestionar inventario
- Transferir stock entre sucursales

#### Contador
- Confirmar pagos por transferencia
- Registrar entrega de productos
- Generar informes financieros

##👥 Usuarios por Defecto

El sistema incluye los siguientes usuarios predefinidos:

| Rol | Usuario | Contraseña | Descripción |
|-----|---------|------------|-------------|
| Administrador | admin | Admin123! | Acceso completo al sistema |
| Vendedor | vendedor | Vendedor123! | Gestión de ventas y pedidos |
| Bodeguero | bodeguero | Bodeguero123! | Gestión de inventario |
| Contador | contador | Contador123! | Gestión financiera |
| Cliente | cliente | Cliente123! | Usuario de prueba |

##🔄 Flujos de Trabajo

### Flujo de Compra
1. Cliente navega por el catálogo
2. Agrega productos al carrito
3. Procede al checkout
4. Selecciona método de entrega (retiro en tienda o despacho)
5. Selecciona método de pago
6. Completa la compra
7. Recibe confirmación

### Flujo de Gestión de Pedido
1. Vendedor recibe notificación de nuevo pedido
2. Vendedor aprueba o rechaza el pedido
3. Si es aprobado, el pedido pasa al bodeguero
4. Bodeguero prepara el pedido
5. Bodeguero marca el pedido como listo
6. Vendedor organiza el despacho
7. Contador confirma el pago y registra la entrega

### Flujo de Gestión de Inventario
1. Bodeguero verifica el inventario
2. Si un producto está con stock bajo, el sistema envía notificaciones
3. Bodeguero puede solicitar transferencia de stock entre sucursales
4. Administrador puede actualizar el inventario general

##🌐 API Endpoints

### Autenticación
- `POST /api/auth/register`: Registro de usuario
- `POST /api/auth/login`: Inicio de sesión
- `POST /api/auth/change-password`: Cambiar contraseña
- `GET /api/auth/profile`: Obtener perfil de usuario
- `PUT /api/auth/profile`: Actualizar perfil de usuario

### Productos
- `GET /api/products`: Listar productos
- `GET /api/products/{id}`: Obtener detalles de un producto
- `POST /api/products`: Crear nuevo producto (admin)
- `PUT /api/products/{id}`: Actualizar producto (admin)
- `DELETE /api/products/{id}`: Eliminar producto (admin)
- `GET /api/products/categories`: Listar categorías
- `GET /api/products/branches`: Listar sucursales

### Pedidos
- `POST /api/orders`: Crear nuevo pedido
- `GET /api/orders`: Listar pedidos
- `GET /api/orders/{id}`: Obtener detalles de un pedido
- `PUT /api/orders/{id}/status`: Actualizar estado de un pedido

### Stock
- `GET /api/stock`: Listar inventario
- `PUT /api/stock/update/{id}`: Actualizar stock
- `POST /api/stock/transfer`: Transferir stock entre sucursales
- `GET /api/stock/alerts`: Obtener alertas de stock bajo

### Pagos
- `POST /api/payments/initiate`: Iniciar proceso de pago
- `GET /api/payments/confirm`: Confirmar pago (callback de WebPay)
- `POST /api/payments/confirm-transfer`: Confirmar pago por transferencia

##🔌 Integración con Servicios Externos

### WebPay (Transbank)
El sistema está integrado con WebPay para procesar pagos con tarjetas de crédito y débito. Para configurar WebPay:

1. Obtener credenciales de Transbank (modo integración o producción)
2. Configurar en el archivo `.env`:
   ```
   WEBPAY_API_KEY=tu_api_key
   WEBPAY_COMMERCE_CODE=tu_codigo_comercio
   WEBPAY_ENVIRONMENT=INTEGRACION  # o PRODUCCION
   ```

### API del Banco Central de Chile
Para la conversión de divisas, el sistema utiliza la API del Banco Central de Chile:

1. Obtener credenciales de acceso a la API
2. Configurar en el archivo `.env`:
   ```
   BANCO_CENTRAL_API_URL=https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx
   BANCO_CENTRAL_API_USER=tu_usuario
   BANCO_CENTRAL_API_PASS=tu_password
   ```

##❓ Solución de Problemas

### Problemas de conexión a la base de datos
- **Síntoma**: Error "Could not connect to server: Connection refused"
- **Solución**: Verifica que el servidor PostgreSQL esté en ejecución
- **Comando**: `pg_ctl status` o revisa en el Administrador de servicios

### Error al inicializar la base de datos
- **Síntoma**: Error al ejecutar `python run.py --init-db`
- **Solución**: Verifica que la base de datos `ferremas` exista y las credenciales sean correctas
- **Verificación**: Intenta conectarte manualmente: `psql -U postgres -d ferremas`

### Problemas con psycopg2
- **Síntoma**: Error "No module named 'psycopg2'"
- **Solución**: Instala psycopg2 directamente: `pip install psycopg2`
- **Alternativa**: Si continúa el error, instala las herramientas de desarrollo de PostgreSQL

### Frontend no se conecta al backend
- **Síntoma**: Error "Network Error" en la consola del navegador
- **Solución**: Verifica que el backend esté en ejecución y el proxy esté configurado
- **Verificación**: Prueba los endpoints directamente con Postman o `curl`

### Errores de CORS
- **Síntoma**: Error en consola del navegador sobre CORS
- **Solución**: Verifica la configuración de CORS en el backend
- **Configuración**: Asegúrate de que `CORS_ORIGINS` incluya `http://localhost:3000`

### Problemas de autenticación
- **Síntoma**: Error 401 Unauthorized
- **Solución**: Verifica que el token JWT sea válido y no haya expirado
- **Verificación**: Intenta cerrar sesión y volver a iniciar sesión

### Redis no disponible (para notificaciones SSE)
- **Síntoma**: Error al iniciar el servidor o al recibir notificaciones
- **Solución**: Instala y ejecuta Redis, o desactiva las notificaciones en tiempo real
- **Configuración**: Comenta las líneas relacionadas con SSE en `app.py` si no necesitas esta funcionalidad

##🚀 Consideraciones para Producción

### Seguridad
- Cambiar todas las claves secretas y credenciales
- Utilizar HTTPS para todas las comunicaciones
- Implementar límites de tasa (rate limiting) para prevenir ataques
- Configurar firewalls adecuadamente
- Realizar auditorías de seguridad regulares

### Base de Datos
- Realizar copias de seguridad regulares
- Considerar la replicación para alta disponibilidad
- Optimizar consultas frecuentes
- Implementar estrategias de indexación

### Despliegue
- Utilizar contenedores Docker para facilitar el despliegue
- Configurar un servidor de aplicación como Gunicorn para el backend
- Utilizar Nginx como proxy inverso
- Implementar un CDN para archivos estáticos
- Configurar monitoreo y alertas

### Optimización
- Minimizar y comprimir archivos JavaScript y CSS
- Implementar lazy loading para imágenes
- Utilizar caché para reducir consultas a la base de datos
- Optimizar el tamaño de las imágenes

##🔒 Seguridad

### Autenticación
- Tokens JWT con expiración
- Almacenamiento seguro de contraseñas con hash
- Protección contra ataques de fuerza bruta
- Renovación segura de tokens

### Protección de Datos
- Validación de entradas en el backend
- Sanitización de datos
- Protección contra XSS y CSRF
- Control de acceso basado en roles

### Auditoría
- Registro de acciones sensibles
- Historial de cambios en datos críticos
- Alertas de seguridad

##⚡ Rendimiento

### Backend
- Paginación de resultados para reducir carga
- Caché de consultas frecuentes
- Optimización de consultas a la base de datos
- Monitoreo de tiempo de respuesta

### Frontend
- Lazy loading de componentes
- Memoización de componentes pesados
- Estrategias de carga diferida
- Optimización de re-renderizados

##🧪 Pruebas

### Pruebas Unitarias
- Ejecutar con: `pytest` (backend)
- Ejecutar con: `npm test` (frontend)

### Pruebas de Integración
- Verificar flujos completos de usuario
- Probar integración entre módulos

### Pruebas de Carga
- Simular múltiples usuarios concurrentes
- Medir tiempo de respuesta bajo carga

## 📄Licencia

Este proyecto está licenciado bajo [LICENCIA]. Consulta el archivo LICENSE para más detalles.

##📞 Contacto



---

© 2025 FERREMAS. Todos los derechos reservados.
