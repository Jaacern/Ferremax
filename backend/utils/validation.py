import re
from datetime import datetime
import validators

def validate_email(email):
    """Validar formato de correo electrónico"""
    return validators.email(email)

def validate_phone(phone):
    """Validar formato de número telefónico"""
    # Formato chileno: +56 9 1234 5678 o cualquier variante
    pattern = r'^(\+?56)?(\s*|\-)?(\d{1,2})(\s*|\-)?(\d{3,4})(\s*|\-)?(\d{4})$'
    return bool(re.match(pattern, phone))

def validate_rut(rut):
    """Validar RUT chileno"""
    if not rut:
        return False
    
    # Eliminar puntos y guiones
    rut = rut.replace(".", "").replace("-", "")
    
    # Verificar formato básico
    if not re.match(r'^(\d{1,8})([0-9K])$', rut):
        return False
    
    # Separar número y dígito verificador
    body, dv = rut[:-1], rut[-1]
    
    # Convertir dígito verificador
    if dv == 'K':
        dv = 10
    else:
        try:
            dv = int(dv)
        except ValueError:
            return False
    
    # Calcular dígito verificador
    try:
        body_int = int(body)
    except ValueError:
        return False
    
    factors = [2, 3, 4, 5, 6, 7]
    sum_product = 0
    
    # Aplicar algoritmo de verificación
    body_str = str(body_int)
    for i, digit in enumerate(reversed(body_str)):
        factor = factors[i % len(factors)]
        sum_product += int(digit) * factor
    
    # Calcular dígito esperado
    expected_dv = 11 - (sum_product % 11)
    if expected_dv == 11:
        expected_dv = 0
    elif expected_dv == 10:
        expected_dv = 'K'
    
    # Convertir resultado a string para comparar
    return str(expected_dv) == str(dv)

def validate_date(date_str, format="%Y-%m-%d"):
    """Validar formato de fecha"""
    try:
        if date_str:
            datetime.strptime(date_str, format)
            return True
        return False
    except ValueError:
        return False

def validate_password_strength(password):
    """Validar fortaleza de contraseña"""
    if not password or len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    
    # Verificar complejidad
    has_upper = re.search(r'[A-Z]', password) is not None
    has_lower = re.search(r'[a-z]', password) is not None
    has_digit = re.search(r'\d', password) is not None
    has_special = re.search(r'[!@#$%^&*(),.?":{}|<>]', password) is not None
    
    missing = []
    if not has_upper:
        missing.append("mayúscula")
    if not has_lower:
        missing.append("minúscula")
    if not has_digit:
        missing.append("número")
    if not has_special:
        missing.append("caracter especial")
    
    if missing:
        return False, f"La contraseña debe incluir al menos una {', una '.join(missing[:-1])}{' y una ' if len(missing) > 1 else ''}{missing[-1] if missing else ''}"
    
    return True, "Contraseña válida"

def sanitize_string(text):
    """Sanear texto para prevenir inyección"""
    if not text:
        return ""
    
    # Eliminar caracteres potencialmente peligrosos
    return re.sub(r'[<>"\'&;]', '', text)

def validate_currency_code(code):
    """Validar código de moneda ISO 4217"""
    valid_codes = ['USD', 'EUR', 'CLP', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS', 'BRL', 'MXN']
    return code.upper() in valid_codes

def validate_product_sku(sku):
    """Validar formato de SKU de producto"""
    # Formato: FER-XXXXX o similar
    pattern = r'^[A-Z]{3}-\d{5}$'
    return bool(re.match(pattern, sku))

def validate_order_number(order_number):
    """Validar formato de número de orden"""
    # Formato: ORD-YYYYMMDD-XXXXXX
    pattern = r'^ORD-\d{8}-[A-Z0-9]{6}$'
    return bool(re.match(pattern, order_number))

def validate_price(price):
    """Validar precio (positivo y con formato correcto)"""
    try:
        price_float = float(price)
        return price_float > 0
    except (ValueError, TypeError):
        return False
    