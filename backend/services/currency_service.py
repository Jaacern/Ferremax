import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from flask import current_app
import os
from dotenv import load_dotenv

from app import db
from models.payment import CurrencyExchangeRate, CurrencyType

# Cargar variables de entorno
load_dotenv()

class CurrencyService:
    """Servicio para obtener y convertir entre diferentes monedas"""
    
    def __init__(self):
        """Inicializar servicio de divisas"""
        self.api_url = os.getenv('BANCO_CENTRAL_API_URL', 
                                'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx')
        self.api_user = os.getenv('BANCO_CENTRAL_API_USER', 'test_user')
        self.api_pass = os.getenv('BANCO_CENTRAL_API_PASS', 'test_pass')
        
        # Mapeo de códigos de moneda a códigos del Banco Central
        self.currency_mapping = {
            CurrencyType.USD: 'dolar',
            CurrencyType.EUR: 'euro',
            CurrencyType.GBP: 'libra_esterlina',
            CurrencyType.ARS: 'peso_argentino',
            CurrencyType.BRL: 'real_brasil',
            CurrencyType.MXN: 'peso_mexicano'
        }
    
    def update_rates(self):
        """
        Actualizar tasas de cambio desde la API del Banco Central
        
        Returns:
            list: Tasas actualizadas
        """
        updated_rates = []
        
        # Fecha actual para la consulta
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Para cada moneda soportada, obtener su tasa
        for currency, bc_code in self.currency_mapping.items():
            try:
                # En un ambiente real, se haría la llamada a la API
                # XML para consulta de serie de datos
                xml_query = f"""
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://web.service.si3.bcch.cl/">
                    <soapenv:Header/>
                    <soapenv:Body>
                        <web:getSeries>
                            <user>{self.api_user}</user>
                            <password>{self.api_pass}</password>
                            <firstdate>{today}</firstdate>
                            <lastdate>{today}</lastdate>
                            <seriesIds>{bc_code}</seriesIds>
                        </web:getSeries>
                    </soapenv:Body>
                </soapenv:Envelope>
                """
                
                # En un ambiente de desarrollo, simulamos la respuesta
                # En producción, descomentar el código real
                """
                response = requests.post(self.api_url, data=xml_query, headers={
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': ''
                })
                
                if response.status_code != 200:
                    print(f"Error al obtener tasa para {currency.name}: HTTP {response.status_code}")
                    continue
                
                # Parsear respuesta XML
                root = ET.fromstring(response.content)
                # Extraer valor de tasa
                rate_value = self.extract_rate_from_xml(root, bc_code)
                """
                
                # Simulación para desarrollo
                rate_value = self._get_mock_rate(currency)
                
                if rate_value:
                    # Crear o actualizar tasa en base de datos
                    rate = CurrencyExchangeRate(
                        from_currency=CurrencyType.CLP,
                        to_currency=currency,
                        rate=1 / rate_value  # Convertir de CLP a moneda extranjera
                    )
                    
                    # También crear la tasa inversa
                    inverse_rate = CurrencyExchangeRate(
                        from_currency=currency,
                        to_currency=CurrencyType.CLP,
                        rate=rate_value
                    )
                    
                    db.session.add(rate)
                    db.session.add(inverse_rate)
                    
                    updated_rates.append({
                        'from': CurrencyType.CLP.value,
                        'to': currency.value,
                        'rate': 1 / rate_value
                    })
                    
                    updated_rates.append({
                        'from': currency.value,
                        'to': CurrencyType.CLP.value,
                        'rate': rate_value
                    })
            
            except Exception as e:
                print(f"Error al actualizar tasa para {currency.name}: {str(e)}")
        
        # Crear tasas para conversiones directas entre monedas extranjeras
        for from_currency in self.currency_mapping.keys():
            for to_currency in self.currency_mapping.keys():
                if from_currency != to_currency:
                    try:
                        # Buscar tasas hacia/desde CLP
                        from_to_clp = CurrencyExchangeRate.query.filter_by(
                            from_currency=from_currency,
                            to_currency=CurrencyType.CLP
                        ).order_by(CurrencyExchangeRate.fetched_at.desc()).first()
                        
                        clp_to_target = CurrencyExchangeRate.query.filter_by(
                            from_currency=CurrencyType.CLP,
                            to_currency=to_currency
                        ).order_by(CurrencyExchangeRate.fetched_at.desc()).first()
                        
                        if from_to_clp and clp_to_target:
                            # Calcular tasa cruzada
                            cross_rate = float(from_to_clp.rate) * float(clp_to_target.rate)
                            
                            # Crear o actualizar tasa cruzada
                            cross_rate_obj = CurrencyExchangeRate(
                                from_currency=from_currency,
                                to_currency=to_currency,
                                rate=cross_rate
                            )
                            
                            db.session.add(cross_rate_obj)
                            
                            updated_rates.append({
                                'from': from_currency.value,
                                'to': to_currency.value,
                                'rate': cross_rate
                            })
                    
                    except Exception as e:
                        print(f"Error al crear tasa cruzada {from_currency.name} a {to_currency.name}: {str(e)}")
        
        # Guardar cambios
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error al guardar tasas: {str(e)}")
        
        return updated_rates
    
    def _get_mock_rate(self, currency):
        """
        Obtener tasa simulada para desarrollo
        
        Args:
            currency: Tipo de moneda
            
        Returns:
            float: Tasa simulada
        """
        # Valores simulados de CLP a moneda extranjera
        mock_rates = {
            CurrencyType.USD: 850.50,
            CurrencyType.EUR: 930.75,
            CurrencyType.GBP: 1100.25,
            CurrencyType.ARS: 1.20,
            CurrencyType.BRL: 170.80,
            CurrencyType.MXN: 50.40
        }
        
        return mock_rates.get(currency)
    
    def extract_rate_from_xml(self, root, code):
        """
        Extraer valor de tasa desde respuesta XML
        
        Args:
            root: Elemento raíz del XML
            code: Código de moneda del Banco Central
            
        Returns:
            float: Valor de la tasa o None si no se encuentra
        """
        try:
            # La estructura del XML dependerá del formato exacto de respuesta del Banco Central
            # Este es un ejemplo, pero debe ajustarse según la respuesta real
            namespace = {'ns': 'http://web.service.si3.bcch.cl/'}
            series_element = root.find('.//ns:Series', namespace)
            
            if series_element:
                value_element = series_element.find('.//ns:value', namespace)
                if value_element is not None and value_element.text:
                    return float(value_element.text)
            
            return None
            
        except Exception as e:
            print(f"Error al extraer tasa desde XML: {str(e)}")
            return None
    
    def get_current_rate(self, from_currency, to_currency):
        """
        Obtener tasa de cambio actual entre dos monedas
        
        Args:
            from_currency: Moneda origen
            to_currency: Moneda destino
            
        Returns:
            CurrencyExchangeRate: Objeto con la tasa de cambio
            
        Raises:
            Exception: Si no se encuentra una tasa válida
        """
        # Si las monedas son iguales, la tasa es 1
        if from_currency == to_currency:
            dummy_rate = CurrencyExchangeRate(
                from_currency=from_currency,
                to_currency=to_currency,
                rate=1.0
            )
            return dummy_rate
        
        # Buscar tasa directa reciente (menos de 24 horas)
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        rate = CurrencyExchangeRate.query.filter_by(
            from_currency=from_currency,
            to_currency=to_currency
        ).filter(
            CurrencyExchangeRate.fetched_at >= yesterday
        ).order_by(
            CurrencyExchangeRate.fetched_at.desc()
        ).first()
        
        if rate:
            return rate
        
        # Si no hay tasa directa reciente, buscar sin restricción de tiempo
        rate = CurrencyExchangeRate.query.filter_by(
            from_currency=from_currency,
            to_currency=to_currency
        ).order_by(
            CurrencyExchangeRate.fetched_at.desc()
        ).first()
        
        if rate:
            return rate
        
        # Si aún no hay tasa, intentar actualizar y buscar de nuevo
        self.update_rates()
        
        rate = CurrencyExchangeRate.query.filter_by(
            from_currency=from_currency,
            to_currency=to_currency
        ).order_by(
            CurrencyExchangeRate.fetched_at.desc()
        ).first()
        
        if rate:
            return rate
        
        # Si todavía no hay tasa, intentar calcular a través de CLP
        via_clp_from = CurrencyExchangeRate.query.filter_by(
            from_currency=from_currency,
            to_currency=CurrencyType.CLP
        ).order_by(
            CurrencyExchangeRate.fetched_at.desc()
        ).first()
        
        via_clp_to = CurrencyExchangeRate.query.filter_by(
            from_currency=CurrencyType.CLP,
            to_currency=to_currency
        ).order_by(
            CurrencyExchangeRate.fetched_at.desc()
        ).first()
        
        if via_clp_from and via_clp_to:
            # Calcular tasa cruzada
            cross_rate = float(via_clp_from.rate) * float(via_clp_to.rate)
            
            # Crear nueva tasa
            new_rate = CurrencyExchangeRate(
                from_currency=from_currency,
                to_currency=to_currency,
                rate=cross_rate
            )
            
            try:
                db.session.add(new_rate)
                db.session.commit()
                return new_rate
            except:
                db.session.rollback()
                # Retornar objeto sin guardar
                return new_rate
        
        # Si no se puede calcular, lanzar excepción
        raise Exception(f"No se encontró tasa de cambio para {from_currency.value} a {to_currency.value}")
    
    def convert(self, amount, from_currency, to_currency):
        """
        Convertir un monto entre monedas
        
        Args:
            amount: Monto a convertir
            from_currency: Moneda origen
            to_currency: Moneda destino
            
        Returns:
            float: Monto convertido
            
        Raises:
            Exception: Si ocurre un error en la conversión
        """
        # Si las monedas son iguales, no hay conversión
        if from_currency == to_currency:
            return amount
        
        # Obtener tasa de cambio
        rate = self.get_current_rate(from_currency, to_currency)
        
        # Aplicar conversión
        converted_amount = float(amount) * float(rate.rate)
        
        # Redondear según la moneda destino
        if to_currency == CurrencyType.CLP:
            # Peso chileno no usa decimales
            return round(converted_amount)
        else:
            # Otras monedas usan 2 decimales
            return round(converted_amount, 2)