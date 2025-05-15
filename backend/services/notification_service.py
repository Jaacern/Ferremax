from flask import current_app
from flask_sse import sse
import json
from datetime import datetime

class NotificationService:
    """Servicio para enviar notificaciones en tiempo real mediante SSE"""
    
    @staticmethod
    def send_stock_alert(product_id, product_name, branch_id, branch_name, current_stock, min_stock=None):
        """
        Enviar alerta de stock bajo
        
        Args:
            product_id: ID del producto
            product_name: Nombre del producto
            branch_id: ID de la sucursal
            branch_name: Nombre de la sucursal
            current_stock: Cantidad actual en stock
            min_stock: Stock mínimo (opcional)
        """
        message = f"Stock bajo en {product_name}"
        if min_stock is not None:
            message += f" ({current_stock}/{min_stock})"
        message += f" en sucursal {branch_name}"
        
        data = {
            "type": "stock_alert",
            "product_id": product_id,
            "product_name": product_name,
            "branch_id": branch_id,
            "branch_name": branch_name,
            "current_stock": current_stock,
            "min_stock": min_stock,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        sse.publish(data, type='stock_alert')
        return data
    
    @staticmethod
    def send_order_notification(order_id, order_number, status, message, user_id=None, branch_id=None):
        """
        Enviar notificación sobre cambio de estado de orden
        
        Args:
            order_id: ID de la orden
            order_number: Número de orden
            status: Estado nuevo de la orden
            message: Mensaje descriptivo
            user_id: ID del usuario (opcional, para notificaciones específicas)
            branch_id: ID de la sucursal (opcional, para notificaciones específicas)
        """
        data = {
            "type": "order_notification",
            "order_id": order_id,
            "order_number": order_number,
            "status": status,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Canales a los que se enviará la notificación
        channels = ['order_notifications']
        
        # Agregar canales específicos si se proporcionan IDs
        if user_id:
            channels.append(f'user_{user_id}')
        
        if branch_id:
            channels.append(f'branch_{branch_id}')
        
        # Publicar en cada canal
        for channel in channels:
            sse.publish(data, type=channel)
        
        return data
    
    @staticmethod
    def send_payment_notification(payment_id, order_id, status, message, user_id=None):
        """
        Enviar notificación sobre cambio de estado de pago
        
        Args:
            payment_id: ID del pago
            order_id: ID de la orden
            status: Estado del pago
            message: Mensaje descriptivo
            user_id: ID del usuario (opcional, para notificaciones específicas)
        """
        data = {
            "type": "payment_notification",
            "payment_id": payment_id,
            "order_id": order_id,
            "status": status,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Canales a los que se enviará la notificación
        channels = ['payment_notifications']
        
        # Agregar canal específico si se proporciona ID de usuario
        if user_id:
            channels.append(f'user_{user_id}')
        
        # Publicar en cada canal
        for channel in channels:
            sse.publish(data, type=channel)
        
        return data
    
    @staticmethod
    def send_system_notification(title, message, level="info", roles=None):
        """
        Enviar notificación del sistema a todos o a roles específicos
        
        Args:
            title: Título de la notificación
            message: Mensaje detallado
            level: Nivel de importancia (info, warning, error)
            roles: Lista de roles a notificar (None para todos)
        """
        data = {
            "type": "system_notification",
            "title": title,
            "message": message,
            "level": level,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Canal principal
        channel = 'system_notifications'
        
        # Publicar en el canal principal
        sse.publish(data, type=channel)
        
        # Si se especifican roles, publicar en canales específicos
        if roles:
            for role in roles:
                sse.publish(data, type=f'role_{role}')
        
        return data
    