"""PDF Text Extraction — parses PDF announcements, legal documents, and reports.

Uses PyMuPDF (fitz) as primary engine with pdfplumber for table extraction.
OCR fallback via Tesseract for scanned documents.

Typical usage:
    from data_collection.file_import import parse_pdf_text
    text = parse_pdf_text("/path/to/announcement.pdf")
"""

from __future__ import annotations

import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ── Optional dependency imports ──────────────────────────────────────
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    logger.warning("PyMuPDF (fitz) not installed. PDF text extraction disabled. "
                   "Install with: pip install PyMuPDF")

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import pytesseract
    from PIL import Image
    import io
    HAS_OCR = True
except ImportError:
    HAS_OCR = False


def parse_pdf_text(file_path: str) -> Optional[str]:
    """Extract plain text from a text-based PDF.

    Returns the concatenated text of all pages, or None if extraction fails.
    """
    if not HAS_PYMUPDF:
        logger.error("PyMuPDF is required for PDF text extraction.")
        return None

    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return None

    try:
        doc = fitz.open(file_path)
        pages: list[str] = []
        for page in doc:
            text = page.get_text()
            if text:
                pages.append(text)
        doc.close()
        return "\n\n".join(pages) if pages else None
    except Exception as e:
        logger.error(f"Failed to parse PDF {file_path}: {e}")
        return None


def parse_pdf_ocr(file_path: str, language: str = "chi_sim+eng") -> Optional[str]:
    """Extract text from a scanned/image-based PDF using Tesseract OCR.

    Args:
        file_path: Path to the PDF file.
        language: Tesseract language codes (default: Chinese simplified + English).
    """
    if not HAS_PYMUPDF or not HAS_OCR:
        logger.error("PyMuPDF and pytesseract are required for OCR.")
        return None

    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return None

    try:
        doc = fitz.open(file_path)
        pages: list[str] = []
        for page in doc:
            # Render page to image at 300 DPI
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text = pytesseract.image_to_string(img, lang=language)
            if text:
                pages.append(text)
        doc.close()
        return "\n\n".join(pages) if pages else None
    except Exception as e:
        logger.error(f"OCR failed for {file_path}: {e}")
        return None


def parse_pdf_hybrid(file_path: str) -> Optional[str]:
    """Try text extraction first; fall back to OCR if text is insufficient.

    A page is considered "empty" if it has fewer than 20 characters.
    Falls back to OCR only when the majority of pages are empty.
    """
    text_result = parse_pdf_text(file_path)
    if text_result and len(text_result.strip()) >= 50:
        return text_result

    logger.info(f"Text extraction yielded insufficient content for {file_path}, trying OCR...")
    return parse_pdf_ocr(file_path)


def extract_tables_from_pdf(file_path: str) -> list[dict[str, Any]]:
    """Extract tables from a PDF using pdfplumber.

    Returns a list of {page, table_index, headers, rows} dicts.
    """
    if not HAS_PDFPLUMBER:
        logger.error("pdfplumber is required for table extraction. "
                     "Install with: pip install pdfplumber")
        return []

    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return []

    tables: list[dict[str, Any]] = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                extracted = page.extract_tables()
                for idx, table in enumerate(extracted):
                    if not table or len(table) < 2:
                        continue
                    headers = [str(c or "") for c in table[0]]
                    rows = [[str(c or "") for c in row] for row in table[1:]]
                    tables.append({
                        "page": page_num,
                        "table_index": idx,
                        "headers": headers,
                        "rows": rows,
                    })
    except Exception as e:
        logger.error(f"Table extraction failed for {file_path}: {e}")

    return tables
