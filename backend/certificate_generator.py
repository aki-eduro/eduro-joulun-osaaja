"""Utilities for creating printable PDF certificates."""

from __future__ import annotations

import base64
import os
import tempfile
from datetime import date
from typing import Optional

from reportlab.lib.pagesizes import A4, A5
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfgen import canvas

from .models import CertificateData


def _save_image_from_data_url(image_data_url: Optional[str]) -> Optional[str]:
    """Decode a data URL and persist it as a temporary PNG file.

    The frontend sends the webcam capture as a data URL. This helper strips the
    prefix (``data:image/...;base64,``) if present, decodes the base64 payload,
    and writes it to a temporary file so ReportLab can embed it in the PDF.
    """

    if not image_data_url:
        return None

    encoded_part = image_data_url.split(",", 1)[-1]

    try:
        binary = base64.b64decode(encoded_part)
    except (base64.binascii.Error, ValueError) as exc:  # type: ignore[attr-defined]
        raise ValueError("Invalid image data URL") from exc

    fd, path = tempfile.mkstemp(suffix=".png")
    with os.fdopen(fd, "wb") as temp_file:
        temp_file.write(binary)

    return path


def generate_certificate_pdf(data: CertificateData) -> str:
    """Create a printable certificate PDF and return its path.

    The PDF is generated on an A5 page (portrait). A4 can be swapped in easily
    by changing ``page_size`` below if needed later.
    """

    image_path = _save_image_from_data_url(data.imageDataUrl)

    page_size = A5
    page_width, page_height = page_size
    margin = 15 * mm

    fd, pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)

    c = canvas.Canvas(pdf_path, pagesize=page_size)
    y_position = page_height - margin

    try:
        if image_path:
            image_reader = ImageReader(image_path)
            img_width, img_height = image_reader.getSize()

            max_width = page_width - 2 * margin
            draw_width = min(max_width, img_width)
            draw_height = draw_width * (img_height / img_width)

            c.drawImage(
                image_reader,
                (page_width - draw_width) / 2,
                y_position - draw_height,
                draw_width,
                draw_height,
                preserveAspectRatio=True,
                mask="auto",
            )
            y_position -= draw_height + 12

        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(page_width / 2, y_position, data.name)
        y_position -= 22

        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(page_width / 2, y_position, data.elfName)
        y_position -= 26

        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(page_width / 2, y_position, data.title)
        y_position -= 20

        c.setFont("Helvetica", 12)
        description_lines = simpleSplit(data.description, "Helvetica", 12, page_width - 2 * margin)
        for line in description_lines:
            c.drawCentredString(page_width / 2, y_position, line)
            y_position -= 16

        y_position -= 6
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(page_width / 2, y_position, data.jouluPower)

        footer_text = f"Eduro – Joulun osaaja ({date.today().isoformat()})"
        c.setFont("Helvetica", 10)
        c.drawCentredString(page_width / 2, margin, footer_text)

        c.showPage()
        c.save()
    finally:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)

    return pdf_path
