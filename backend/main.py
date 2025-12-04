"""FastAPI backend for "Joulun osaaja – Eduro".

Local development quickstart (PowerShell on Windows)::

    cd backend
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

The backend expects a `.env` file in this folder with at least:

    OPENROUTER_API_KEY=sk-or-xxxx
    GEMINI_API_KEY=your-gemini-key
    PRINT_API_TOKEN=eduro-print-secret

The frontend should POST certificate data to http://localhost:8000/api/print-certificate
using the Authorization header `Bearer <PRINT_API_TOKEN>`.
"""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from certificate_generator import generate_certificate_pdf
from models import CertificateData

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

PRINT_API_TOKEN = os.environ.get("PRINT_API_TOKEN")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

app = FastAPI(title="Joulun osaaja Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_bearer_token(authorization: Optional[str] = Header(default=None)) -> None:
    """Validate the Authorization header against PRINT_API_TOKEN."""

    if not PRINT_API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PRINT_API_TOKEN is not configured.",
        )

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = authorization.split(" ", 1)[1]
    if token != PRINT_API_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@app.get("/health")
def health() -> dict[str, str]:
    """Basic liveness probe."""

    return {"status": "ok"}


@app.post("/api/print-certificate")
def print_certificate(
    data: CertificateData,
    _: None = Depends(_require_bearer_token),
) -> dict[str, str]:
    """Generate and print a certificate based on the posted data."""

    pdf_path = generate_certificate_pdf(data)

    try:
        if hasattr(os, "startfile"):
            os.startfile(pdf_path, "print")  # type: ignore[attr-defined]
        else:
            raise RuntimeError("Printing is only supported on Windows via os.startfile.")

        # A brief pause helps Windows open the file handler before deletion.
        time.sleep(1)
    except Exception as exc:  # pragma: no cover - minimal logging is enough here
        print(f"Printing failed: {exc}")
        raise HTTPException(status_code=500, detail="Printing failed") from exc
    finally:
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except OSError:
                # If the file is locked momentarily by the print spooler, it will
                # eventually be released; we avoid masking the main error path.
                pass

    return {"status": "printed"}
