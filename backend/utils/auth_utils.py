from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from models.user import UserRole

def role_required(roles):
    """
    Decorador para verificar que el usuario tenga uno de los roles especificados
    
    Args:
        roles: Lista o instancia única de UserRole permitidos
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            
            # Convertir roles a una lista si es un solo rol
            if not isinstance(roles, (list, tuple)):
                role_list = [roles]
            else:
                role_list = roles
            
            # Convertir a valores de enum si es necesario
            role_values = [r.value if isinstance(r, UserRole) else r for r in role_list]
            
            if claims.get("role") not in role_values:
                return jsonify({"error": "No autorizado para esta acción"}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """Decorador para verificar que el usuario sea administrador"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        if claims.get("role") != UserRole.ADMIN.value:
            return jsonify({"error": "Se requieren permisos de administrador"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def vendor_required(fn):
    """Decorador para verificar que el usuario sea vendedor"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        if claims.get("role") != UserRole.VENDOR.value:
            return jsonify({"error": "Se requieren permisos de vendedor"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def warehouse_required(fn):
    """Decorador para verificar que el usuario sea bodeguero"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        if claims.get("role") != UserRole.WAREHOUSE.value:
            return jsonify({"error": "Se requieren permisos de bodeguero"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def accountant_required(fn):
    """Decorador para verificar que el usuario sea contador"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        if claims.get("role") != UserRole.ACCOUNTANT.value:
            return jsonify({"error": "Se requieren permisos de contador"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def has_role(role):
    """
    Verificar si el JWT actual tiene el rol especificado
    
    Args:
        role: Rol a verificar (UserRole o string)
    """
    claims = get_jwt()
    role_value = role.value if isinstance(role, UserRole) else role
    
    return claims.get("role") == role_value

def password_change_required():
    """Verificar si el usuario debe cambiar su contraseña"""
    claims = get_jwt()
    return claims.get("password_change_required", False)