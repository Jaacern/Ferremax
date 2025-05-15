from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    get_jwt_identity, 
    jwt_required, 
    get_jwt
)
from datetime import datetime
import logging

# Crear el Blueprint primero
auth_bp = Blueprint('auth', __name__)

# Importar cuando sea necesario dentro de las funciones para evitar importaciones circulares
# Esto es una técnica común para resolver este tipo de problemas

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevos clientes"""
    # Importar aquí para evitar importación circular
    from app import db
    from models.user import User, UserRole
    
    data = request.json
    
    # Validar datos requeridos
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Verificar si el usuario o email ya existen
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Nombre de usuario ya existe"}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Correo electrónico ya está registrado"}), 409
    
    try:
        # Crear nuevo usuario (cliente)
        new_user = User.create_customer(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            address=data.get('address')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generar token de acceso
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            "message": "Usuario registrado exitosamente",
            "user": new_user.to_dict(),
            "access_token": access_token
        }), 201
        
    except Exception as e:
        from app import db
        db.session.rollback()
        logging.error(f"Error en registro: {str(e)}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Inicio de sesión de usuarios"""
    from models.user import User
    
    data = request.json
    
    # Validar datos requeridos
    if not all(k in data for k in ('username', 'password')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Buscar usuario por nombre de usuario
    user = User.query.filter_by(username=data['username']).first()
    
    # Verificar credenciales
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    # Verificar si el usuario está activo
    if not user.is_active:
        return jsonify({"error": "Usuario inactivo. Contacte al administrador"}), 403
    
    # Crear claims adicionales para el token
    additional_claims = {
        "role": user.role.value,
        "password_change_required": user.password_change_required
    }
    
    # Generar token de acceso
    access_token = create_access_token(
        identity=user.id, 
        additional_claims=additional_claims
    )
    
    return jsonify({
        "message": "Inicio de sesión exitoso",
        "user": user.to_dict(),
        "access_token": access_token,
        "password_change_required": user.password_change_required
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario"""
    from app import db
    from models.user import User
    
    user_id = get_jwt_identity()
    data = request.json
    
    # Validar datos requeridos
    if not all(k in data for k in ('current_password', 'new_password')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Buscar usuario
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Verificar contraseña actual
    if not user.check_password(data['current_password']):
        return jsonify({"error": "Contraseña actual incorrecta"}), 401
    
    # Actualizar contraseña
    user.set_password(data['new_password'])
    user.password_change_required = False
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({"message": "Contraseña actualizada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario"""
    from models.user import User
    
    user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario"""
    from app import db
    from models.user import User
    
    user_id = get_jwt_identity()
    data = request.json
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Campos permitidos para actualización
    allowed_fields = ['first_name', 'last_name', 'phone', 'address']
    
    # Actualizar campos
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            "message": "Perfil actualizado correctamente",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Rutas administrativas para gestión de usuarios
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Obtener lista de usuarios (solo admin)"""
    from utils.auth_utils import admin_required
    from models.user import User, UserRole
    
    # Verificar si es admin
    jwt_data = get_jwt()
    if jwt_data.get('role') != UserRole.ADMIN.value:
        return jsonify({"error": "No autorizado"}), 403
    
    # Parámetros de paginación y filtrado
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role = request.args.get('role')
    search = request.args.get('search')
    
    # Iniciar consulta
    query = User.query
    
    # Aplicar filtros
    if role:
        try:
            query = query.filter_by(role=UserRole(role))
        except ValueError:
            pass
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%')) |
            (User.first_name.ilike(f'%{search}%')) |
            (User.last_name.ilike(f'%{search}%'))
        )
    
    # Ejecutar consulta paginada
    pagination = query.paginate(page=page, per_page=per_page)
    
    # Preparar respuesta
    users = [user.to_dict() for user in pagination.items]
    
    return jsonify({
        "users": users,
        "pagination": {
            "total": pagination.total,
            "pages": pagination.pages,
            "page": page,
            "per_page": per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200


@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Obtener detalles de un usuario (solo admin)"""
    from models.user import User, UserRole
    
    # Verificar si es admin
    jwt_data = get_jwt()
    if jwt_data.get('role') != UserRole.ADMIN.value:
        return jsonify({"error": "No autorizado"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    """Crear usuario por parte del administrador"""
    from app import db
    from models.user import User, UserRole
    
    # Verificar si es admin
    jwt_data = get_jwt()
    if jwt_data.get('role') != UserRole.ADMIN.value:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    # Validar datos requeridos
    required_fields = ['username', 'email', 'password', 'role']
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Verificar si el usuario o email ya existen
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Nombre de usuario ya existe"}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Correo electrónico ya está registrado"}), 409
    
    try:
        # Convertir role a enum
        try:
            role = UserRole(data['role'])
        except ValueError:
            return jsonify({"error": "Rol inválido"}), 400
        
        # Crear usuario
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=role,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            rut=data.get('rut'),
            phone=data.get('phone'),
            address=data.get('address'),
            password_change_required=True
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "Usuario creado exitosamente",
            "user": new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Actualizar usuario por parte del administrador"""
    from app import db
    from models.user import User, UserRole
    
    # Verificar si es admin
    jwt_data = get_jwt()
    if jwt_data.get('role') != UserRole.ADMIN.value:
        return jsonify({"error": "No autorizado"}), 403
    
    data = request.json
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Actualizar campos
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Nombre de usuario ya existe"}), 409
        user.username = data['username']
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Correo electrónico ya está registrado"}), 409
        user.email = data['email']
    
    if 'role' in data:
        try:
            user.role = UserRole(data['role'])
        except ValueError:
            return jsonify({"error": "Rol inválido"}), 400
    
    # Campos simples
    simple_fields = ['first_name', 'last_name', 'rut', 'phone', 'address', 'is_active']
    for field in simple_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # Actualizar contraseña si se proporciona
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        user.password_change_required = True
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            "message": "Usuario actualizado correctamente",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Eliminar usuario (solo admin)"""
    from app import db
    from models.user import User, UserRole
    
    # Verificar si es admin
    jwt_data = get_jwt()
    if jwt_data.get('role') != UserRole.ADMIN.value:
        return jsonify({"error": "No autorizado"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Verificar que no se elimine a sí mismo
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({"error": "No puedes eliminar tu propio usuario"}), 403
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500