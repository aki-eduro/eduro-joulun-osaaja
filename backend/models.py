"""Pydantic models for the certificate printing API."""

from typing import Optional

from pydantic import BaseModel


class CertificateData(BaseModel):
    """Payload expected from the frontend when printing a certificate."""

    name: str
    elfName: str
    title: str
    description: str
    jouluPower: str
    imageDataUrl: Optional[str] = None
