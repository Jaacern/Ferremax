# services/currency_service.py
import os
from datetime import datetime, timedelta

import zeep
import requests
from dotenv import load_dotenv

from app import db
from models.payment import CurrencyExchangeRate, CurrencyType

# ───────────────────────── Configuración ──────────────────────────
load_dotenv()

SOAP_WSDL = os.getenv(
    "DEMO_SOAP_WSDL",
    "https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL",
)

# End-point oficial de ApiLayer:
REST_URL = os.getenv(
    "EXCHANGE_REST_URL",
    "https://api.apilayer.com/exchangerates_data/latest",
)
REST_KEY = os.getenv("EXCHANGE_API_KEY")     # 👈 tu clave en .env


class CurrencyService:
    """
    1. Siempre ejecuta una llamada SOAP (demo) para evidenciar uso de Web Service.
    2. Consulta tasas CLP → {USD, EUR, GBP, ARS, BRL, MXN} vía REST (ApiLayer).
    3. Guarda paridades directas e inversas en la BD.
    """

    ISO = {
        CurrencyType.CLP: "CLP",
        CurrencyType.USD: "USD",
        CurrencyType.EUR: "EUR",
        CurrencyType.GBP: "GBP",
        CurrencyType.ARS: "ARS",
        CurrencyType.BRL: "BRL",
        CurrencyType.MXN: "MXN",
    }

    def __init__(self) -> None:
        try:
            self.soap_client = zeep.Client(wsdl=SOAP_WSDL)
        except Exception as exc:
            print(f"⚠️  No se pudo inicializar cliente SOAP: {exc}")
            self.soap_client = None

    # ───────────── SOAP demo ─────────────
    def _demo_soap_call(self) -> None:
        """Llama NumberToWords(123) sólo para dejar rastro SOAP en logs."""
        if not self.soap_client:
            return
        try:
            _ = self.soap_client.service.NumberToWords(123)
        except Exception as exc:
            print(f"⚠️  Error en demo SOAP: {exc}")

    # ───────────── REST – tasa CLP→destino ─────────────
    def _rest_rate_clp_to(self, target: CurrencyType) -> float | None:
        iso_to = self.ISO[target]
        headers = {"apikey": REST_KEY} if REST_KEY else {}
        try:
            resp = requests.get(
                REST_URL,
                headers=headers,
                params={"base": "CLP", "symbols": iso_to},
                timeout=10,
            )
            #print("🌐 exchangerate status:", resp.status_code)
            data = resp.json()
            #print("🌐 payload:", data)

            # ApiLayer devuelve {"success": False, "error": {...}} en caso de fallo
            if not data.get("success"):
                raise ValueError(data.get("error", "respuesta sin éxito"))

            return float(data["rates"][iso_to])
        except Exception as exc:
            print(f"❌  REST error CLP→{target.name}: {exc}")
            return None

    # ───────────── Actualizar BD ─────────────
    def update_rates(self) -> list[dict]:
        self._demo_soap_call()
        updated: list[dict] = []
        now = datetime.utcnow()

        for tgt in (c for c in self.ISO if c != CurrencyType.CLP):
            rate_clp_tgt = self._rest_rate_clp_to(tgt)
            if not rate_clp_tgt:
                continue

            try:
                direct = CurrencyExchangeRate(
                    from_currency=CurrencyType.CLP,
                    to_currency=tgt,
                    rate=rate_clp_tgt,
                    source="ApiLayer",
                )
                inverse = CurrencyExchangeRate(
                    from_currency=tgt,
                    to_currency=CurrencyType.CLP,
                    rate=1 / rate_clp_tgt,
                    source="ApiLayer",
                )
                # asignar timestamp manual si lo deseas
                direct.fetched_at = now
                inverse.fetched_at = now

                db.session.add_all([direct, inverse])
                updated += [
                    {"from": "CLP", "to": tgt.value, "rate": rate_clp_tgt},
                    {"from": tgt.value, "to": "CLP", "rate": 1 / rate_clp_tgt},
                ]
            except Exception as exc:
                print(f"❌  DB error {tgt.name}: {exc}")

        try:
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            print(f"❌  Rollback BD: {exc}")

        return updated

    # ───────────── Consulta de tasa & conversión ─────────────
    def get_current_rate(self, frm: CurrencyType, to: CurrencyType):
        if frm == to:
            return CurrencyExchangeRate(
                from_currency=frm, to_currency=to, rate=1.0, fetched_at=datetime.utcnow()
            )

        cutoff = datetime.utcnow() - timedelta(days=1)
        rate = (
            CurrencyExchangeRate.query.filter_by(from_currency=frm, to_currency=to)
            .filter(CurrencyExchangeRate.fetched_at >= cutoff)
            .order_by(CurrencyExchangeRate.fetched_at.desc())
            .first()
        )
        if rate:
            return rate

        # Refresca si no hay datos recientes
        self.update_rates()
        rate = (
            CurrencyExchangeRate.query.filter_by(from_currency=frm, to_currency=to)
            .order_by(CurrencyExchangeRate.fetched_at.desc())
            .first()
        )
        if rate:
            return rate

        # Cross via CLP
        if frm != CurrencyType.CLP and to != CurrencyType.CLP:
            a = self.get_current_rate(frm, CurrencyType.CLP)
            b = self.get_current_rate(CurrencyType.CLP, to)
            cross = CurrencyExchangeRate(
                from_currency=frm,
                to_currency=to,
                rate=a.rate * b.rate,
                source="cross-via-CLP",
            )
            cross.fetched_at = datetime.utcnow()
            db.session.add(cross)
            db.session.commit()
            return cross

        raise Exception(f"No se encontró tasa {frm.value}->{to.value}")

    def convert(self, amount: float, frm: CurrencyType, to: CurrencyType) -> float:
        rate = self.get_current_rate(frm, to).rate
        result = float(amount) * float(rate)
        return round(result, 0 if to == CurrencyType.CLP else 2)
