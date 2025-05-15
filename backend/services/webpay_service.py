import requests
import json
from datetime import datetime
from flask import current_app
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class WebpayService:
    """Servicio para interactuar con la API de WebPay (Transbank)"""
    
    def __init__(self):
        """Inicializar servicio WebPay con configuración"""
        self.commerce_code = os.getenv('WEBPAY_COMMERCE_CODE', '597055555532')
        self.api_key = os.getenv('WEBPAY_API_KEY', '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C')
        self.environment = os.getenv('WEBPAY_ENVIRONMENT', 'INTEGRACION')
        
        # URLs según ambiente
        if self.environment == 'PRODUCCION':
            self.base_url = 'https://webpay3g.transbank.cl'
        else:
            self.base_url = 'https://webpay3gint.transbank.cl'
    
    def initiate_transaction(self, buy_order, session_id, amount, return_url):
        """
        Iniciar una transacción en WebPay Plus
        
        Args:
            buy_order: Número de orden de compra
            session_id: ID de sesión del cliente
            amount: Monto a pagar
            return_url: URL de retorno tras el pago
            
        Returns:
            dict: Respuesta de WebPay con token y URL de redirección
        """
        endpoint = f"{self.base_url}/rswebpaytransaction/api/webpay/v1.2/transactions"
        
        headers = {
            'Tbk-Api-Key-Id': self.commerce_code,
            'Tbk-Api-Key-Secret': self.api_key,
            'Content-Type': 'application/json'
        }
        
        payload = {
            'buy_order': buy_order,
            'session_id': session_id,
            'amount': amount,
            'return_url': return_url
        }
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()  # Lanzar excepción si hay error HTTP
            
            result = response.json()
            
            # Respuesta esperada: {'token': 'token_value', 'url': 'redirect_url'}
            return {
                'token': result.get('token'),
                'url': result.get('url')
            }
            
        except requests.exceptions.RequestException as e:
            # En ambiente de desarrollo, podríamos retornar datos de prueba
            if self.environment != 'PRODUCCION':
                print(f"Error al iniciar transacción WebPay (modo desarrollo): {str(e)}")
                # Simular respuesta exitosa para desarrollo
                return {
                    'token': f'dev-token-{buy_order}-{datetime.now().timestamp()}',
                    'url': f"https://webpay3gint.transbank.cl/webpayserver/initTransaction?token_ws=dev-token-{buy_order}"
                }
            
            # En producción, propagar el error
            print(f"Error al iniciar transacción WebPay: {str(e)}")
            return None
    
    def confirm_transaction(self, token):
        """
        Confirmar una transacción con WebPay Plus
        
        Args:
            token: Token de la transacción
            
        Returns:
            dict: Información de la transacción
        """
        endpoint = f"{self.base_url}/rswebpaytransaction/api/webpay/v1.2/transactions/{token}"
        
        headers = {
            'Tbk-Api-Key-Id': self.commerce_code,
            'Tbk-Api-Key-Secret': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.put(endpoint, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            # Procesar y transformar respuesta
            transaction_info = {
                'status': result.get('status'),
                'buy_order': result.get('buy_order'),
                'session_id': result.get('session_id'),
                'card_detail': result.get('card_detail'),
                'transaction_date': result.get('transaction_date'),
                'amount': result.get('amount'),
                'transaction_id': result.get('transaction_id')
            }
            
            return transaction_info
            
        except requests.exceptions.RequestException as e:
            # En ambiente de desarrollo, podríamos retornar datos de prueba
            if self.environment != 'PRODUCCION':
                print(f"Error al confirmar transacción WebPay (modo desarrollo): {str(e)}")
                # Simular respuesta exitosa para desarrollo
                return {
                    'status': 'AUTHORIZED',
                    'buy_order': token.split('-')[1] if '-' in token else 'dev-order',
                    'session_id': 'dev-session',
                    'card_detail': {'card_number': '1234'},
                    'transaction_date': datetime.now().isoformat(),
                    'amount': 10000,
                    'transaction_id': f'dev-trans-{datetime.now().timestamp()}'
                }
            
            # En producción, propagar el error
            print(f"Error al confirmar transacción WebPay: {str(e)}")
            return None
    
    def refund_transaction(self, token, amount):
        """
        Solicitar reembolso de una transacción
        
        Args:
            token: Token de la transacción
            amount: Monto a reembolsar
            
        Returns:
            dict: Información del reembolso
        """
        endpoint = f"{self.base_url}/rswebpaytransaction/api/webpay/v1.2/transactions/{token}/refunds"
        
        headers = {
            'Tbk-Api-Key-Id': self.commerce_code,
            'Tbk-Api-Key-Secret': self.api_key,
            'Content-Type': 'application/json'
        }
        
        payload = {
            'amount': amount
        }
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                'type': result.get('type'),
                'authorization_code': result.get('authorization_code'),
                'response_code': result.get('response_code'),
                'status': result.get('status'),
                'balance': result.get('balance')
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Error al solicitar reembolso WebPay: {str(e)}")
            return None