from flask import Blueprint, jsonify, request
from flask_sse import sse
import json
from datetime import datetime

sse_bp = Blueprint('sse_bp', __name__)

@sse_bp.route('/api/sse/test')
def test_emit():
    """Ruta de prueba para enviar notificación del sistema"""
    sse.publish({"message": "notificación de prueba"}, type='system_notification')
    return jsonify({"status": "notificación enviada"})

@sse_bp.route('/api/sse/test-stock')
def test_stock_alert():
    """Ruta de prueba para enviar alerta de stock"""
    data = {
        "type": "stock_alert",
        "product_id": 1,
        "product_name": "Producto de prueba",
        "branch_id": 1,
        "branch_name": "Sucursal Central",
        "current_stock": 5,
        "min_stock": 10,
        "message": "Stock bajo en Producto de prueba (5/10) en sucursal Sucursal Central",
        "timestamp": datetime.utcnow().isoformat()
    }
    sse.publish(data, type='stock_alert')
    return jsonify({"status": "alerta de stock enviada", "data": data})

@sse_bp.route('/api/sse/test-order')
def test_order_notification():
    """Ruta de prueba para enviar notificación de orden"""
    data = {
        "type": "order_notification",
        "order_id": 1,
        "order_number": "ORD-001",
        "status": "approved",
        "message": "Orden ORD-001 ha sido aprobada",
        "timestamp": datetime.utcnow().isoformat()
    }
    sse.publish(data, type='order_notification')
    return jsonify({"status": "notificación de orden enviada", "data": data})

@sse_bp.route('/api/sse/status')
def sse_status():
    """Ruta para verificar el estado de SSE"""
    try:
        # Verificar conexión a Redis
        redis_client = sse.redis
        redis_client.ping()
        return jsonify({
            "status": "ok",
            "redis": "connected",
            "message": "SSE service is running"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "redis": "disconnected",
            "message": str(e)
        }), 500