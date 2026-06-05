"""
Production-Ready OCR Microservice for Finance Platform
Enhanced with Multiple OCR Engines, Image Preprocessing, and AI Text Understanding
"""


from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import easyocr
try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
import cv2
import numpy as np
import uvicorn
import os
import tempfile
import logging
import asyncio
import hashlib
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageEnhance, ImageFilter, UnidentifiedImageError
import io
import traceback
from contextlib import contextmanager
from concurrent.futures import ThreadPoolExecutor
import pytesseract
from pathlib import Path
import sys
from dotenv import load_dotenv

# Load environment variables immediately
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Import AI analyzer
from ai_text_analyzer import FinancialDocumentAnalyzer, OLLAMA_MODEL, format_financial_data_for_display
# ------------------- CONFIG -------------------

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp", ".pdf"}
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp", "application/pdf"]
MODEL_DIR = "./models"
CACHE_DIR = "./cache"
AI_CACHE_DIR = "./ai_cache"  # Separate cache for AI results
MAX_CACHE_SIZE = 100  # Max number of cached results
ENABLE_AI_ANALYSIS = os.getenv("ENABLE_AI_ANALYSIS", "true").lower() == "true"
ENABLE_PADDLEOCR = os.getenv("ENABLE_PADDLEOCR", "true").lower() == "true"
OCR_USE_GPU = os.getenv("OCR_USE_GPU", "auto").lower()
ENABLE_LAYOUT_MODELS = os.getenv("ENABLE_LAYOUT_MODELS", "false").lower() == "true"

# AI Model Configuration
MODEL_NAME = OLLAMA_MODEL
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")  # Add this line

# ------------------- CACHE SETUP -------------------

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(AI_CACHE_DIR, exist_ok=True)

# ------------------- LOGGING -------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# File handlers
file_handler = logging.FileHandler("ocr_service.log")
file_handler.setLevel(logging.INFO)
error_handler = logging.FileHandler("ocr_errors.log")
error_handler.setLevel(logging.ERROR)

formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
error_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(error_handler)

def detect_cuda_available() -> bool:
    """Detect whether a CUDA-capable GPU is available for deep-learning OCR."""
    try:
        import torch
        return bool(torch.cuda.is_available())
    except Exception:
        return False

CUDA_AVAILABLE = detect_cuda_available()
OCR_GPU_ENABLED = OCR_USE_GPU in {"1", "true", "yes", "on"} or (OCR_USE_GPU == "auto" and CUDA_AVAILABLE)
OCR_DEVICE = "gpu" if OCR_GPU_ENABLED else "cpu"

# ------------------- APP INIT -------------------

app = FastAPI(
    title="Finance OCR Service with AI",
    description="Advanced OCR service for financial documents with multiple OCR engines and AI text understanding",
    version="4.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=4)

# ------------------- MODEL INIT -------------------

os.makedirs(MODEL_DIR, exist_ok=True)

logger.info(f"Loading OCR models on {OCR_DEVICE.upper()} (OCR_USE_GPU={OCR_USE_GPU}, cuda_available={CUDA_AVAILABLE})...")

# EasyOCR Reader
easyocr_reader = None
tesseract_available = False

try:
    easyocr_reader = easyocr.Reader(
        ['en'],
        model_storage_directory=MODEL_DIR,
        user_network_directory=os.path.join(MODEL_DIR, 'user_network'),
        gpu=OCR_GPU_ENABLED,
        download_enabled=True,
        recognizer='english_g2',
        detector='dbnet18'
    )
    logger.info("✅ EasyOCR model loaded successfully!")
except Exception as e:
    logger.error(f"❌ Failed to load EasyOCR: {str(e)}")

if easyocr_reader is None and OCR_GPU_ENABLED:
    try:
        logger.warning("Retrying EasyOCR on CPU fallback")
        easyocr_reader = easyocr.Reader(
            ['en'],
            model_storage_directory=MODEL_DIR,
            user_network_directory=os.path.join(MODEL_DIR, 'user_network'),
            gpu=False,
            download_enabled=True,
            recognizer='english_g2',
            detector='dbnet18'
        )
        logger.info("EasyOCR CPU fallback loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load EasyOCR CPU fallback: {str(e)}")

# Check Tesseract availability
try:
    pytesseract.get_tesseract_version()
    tesseract_available = True
    logger.info("✅ Tesseract OCR is available")
except Exception as e:
    logger.warning(f"⚠️ Tesseract not available: {str(e)}")

# Initialize optional PaddleOCR after the existing readers.
paddleocr_reader = None
if ENABLE_PADDLEOCR and PaddleOCR is not None:
    try:
        paddleocr_reader = PaddleOCR(
            use_angle_cls=True,
            lang="en",
            use_gpu=OCR_GPU_ENABLED,
            show_log=False
        )
        logger.info("PaddleOCR model loaded successfully")
    except Exception as e:
        logger.warning(f"Failed to load PaddleOCR: {str(e)}")
elif ENABLE_PADDLEOCR:
    logger.warning("PaddleOCR package is not installed; skipping PaddleOCR")

if paddleocr_reader is None and ENABLE_PADDLEOCR and PaddleOCR is not None and OCR_GPU_ENABLED:
    try:
        logger.warning("Retrying PaddleOCR on CPU fallback")
        paddleocr_reader = PaddleOCR(
            use_angle_cls=True,
            lang="en",
            use_gpu=False,
            show_log=False
        )
        logger.info("PaddleOCR CPU fallback loaded successfully")
    except Exception as e:
        logger.warning(f"Failed to load PaddleOCR CPU fallback: {str(e)}")

if ENABLE_LAYOUT_MODELS:
    logger.info("Layout model acceleration is enabled by config; future LayoutLM/Donut loaders should use OCR_DEVICE.")

# Initialize AI analyzer (will be created per request for session management)
# But we keep a global reference
ai_analyzer = None

# ------------------- CACHE MANAGEMENT -------------------

def get_cache_key(content: bytes, include_ai: bool = False) -> str:
    """Generate cache key from file content"""
    key = hashlib.md5(content).hexdigest()
    if include_ai:
        key = f"ai_{key}"
    return key

def get_cached_result(cache_key: str, cache_dir: str = CACHE_DIR) -> Optional[str]:
    """Retrieve cached OCR result"""
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Check if cache is less than 30 days old
                cache_age = datetime.now() - datetime.fromisoformat(data['timestamp'])
                if cache_age.days < 30:
                    logger.info(f"Cache hit for key: {cache_key}")
                    return data['result']
        except Exception as e:
            logger.warning(f"Cache read failed: {str(e)}")
    return None

def cache_result(cache_key: str, result: any, cache_dir: str = CACHE_DIR):
    """Cache OCR or AI result"""
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'result': result
            }, f, default=str)
        logger.info(f"Cached result for key: {cache_key}")
        
        # Clean old cache files
        cleanup_old_cache(cache_dir)
    except Exception as e:
        logger.warning(f"Cache write failed: {str(e)}")

def cleanup_old_cache(cache_dir: str):
    """Remove old cache files exceeding limit"""
    try:
        files = sorted(Path(cache_dir).glob("*.json"), key=os.path.getmtime)
        while len(files) > MAX_CACHE_SIZE:
            files[0].unlink()
            files.pop(0)
    except Exception as e:
        logger.warning(f"Cache cleanup failed: {str(e)}")

# ------------------- IMAGE PREPROCESSING -------------------

def analyze_image_quality(img_gray: np.ndarray) -> Dict[str, float]:
    """Return cheap image-quality signals used to choose OCR preprocessing."""
    height, width = img_gray.shape
    contrast = float(np.std(img_gray))
    brightness = float(np.mean(img_gray))
    blur_score = float(cv2.Laplacian(img_gray, cv2.CV_64F).var())

    return {
        "width": float(width),
        "height": float(height),
        "longest_side": float(max(width, height)),
        "contrast": contrast,
        "brightness": brightness,
        "blur_score": blur_score,
        "low_contrast": contrast < 45.0,
        "uneven_lighting": brightness < 85.0 or brightness > 210.0,
        "possibly_blurry": blur_score < 80.0,
        "small_image": max(width, height) < 1400,
    }

def resize_for_ocr(pil_img: Image.Image, min_longest_side: int = 1200, max_longest_side: int = 2200) -> Image.Image:
    """Keep receipt text readable without sending oversized images to OCR engines."""
    width, height = pil_img.size
    longest_side = max(width, height)

    if longest_side > max_longest_side:
        scale = max_longest_side / longest_side
    elif longest_side < min_longest_side:
        scale = min_longest_side / longest_side
    else:
        return pil_img

    new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
    return pil_img.resize(new_size, Image.Resampling.LANCZOS)

def preprocess_image(image_bytes: bytes) -> List[Tuple[str, np.ndarray]]:
    """
    Apply adaptive preprocessing techniques to improve OCR accuracy.
    Returns methods in the order they should be attempted by the OCR cascade.
    """
    try:
        # Convert bytes to PIL Image
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed and normalize the resolution for faster OCR.
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')
        pil_img = resize_for_ocr(pil_img)
        
        processed_images = []
        
        # Original numpy array representation
        img_original = np.array(pil_img)
        
        # 1. Grayscale (Base image)
        img_gray = cv2.cvtColor(img_original, cv2.COLOR_RGB2GRAY)
        processed_images.append(('grayscale', img_gray))

        quality = analyze_image_quality(img_gray)
        logger.info(
            "Image quality - size=%sx%s contrast=%.2f brightness=%.2f blur=%.2f",
            int(quality["width"]),
            int(quality["height"]),
            quality["contrast"],
            quality["brightness"],
            quality["blur_score"],
        )

        if quality["low_contrast"]:
            try:
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                img_clahe = clahe.apply(img_gray)
                processed_images.append(('clahe', img_clahe))
            except Exception as e:
                logger.warning(f"CLAHE preprocessing failed: {e}")
        
        if quality["uneven_lighting"]:
            try:
                img_adaptive = cv2.adaptiveThreshold(
                    img_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                    cv2.THRESH_BINARY, 11, 2
                )
                processed_images.append(('adaptive', img_adaptive))
            except Exception as e:
                logger.warning(f"Adaptive threshold preprocessing failed: {e}")
        
        if quality["small_image"]:
            height, width = img_gray.shape
            img_resized = cv2.resize(img_gray, (width * 2, height * 2), interpolation=cv2.INTER_CUBIC)
            processed_images.append(('resized', img_resized))

        if quality["possibly_blurry"] or quality["low_contrast"]:
            try:
                _, img_thresh = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
                img_morph = cv2.morphologyEx(img_thresh, cv2.MORPH_CLOSE, kernel)
                processed_images.append(('morphology', img_morph))
            except Exception as e:
                logger.warning(f"Morphology preprocessing failed: {e}")

        if len(processed_images) == 1:
            # One conservative retry path for normal-looking receipts.
            try:
                clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
                processed_images.append(('clahe', clahe.apply(img_gray)))
            except Exception as e:
                logger.warning(f"Default CLAHE preprocessing failed: {e}")
        
        return processed_images
        
    except Exception as e:
        logger.error(f"Image preprocessing failed: {str(e)}")
        return []

def pdf_to_images(pdf_bytes: bytes) -> List[Tuple[str, bytes]]:
    """
    Render each PDF page into an image so the existing OCR pipeline can
    process PDFs without changing OCR engine logic.
    """
    if fitz is None:
        raise ValueError("PDF support requires PyMuPDF to be installed")

    images: List[Tuple[str, bytes]] = []

    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf_document:
            if pdf_document.page_count == 0:
                raise ValueError("PDF has no pages")

            # Render at 2x scale to preserve small receipt text.
            matrix = fitz.Matrix(2, 2)

            for page_index in range(pdf_document.page_count):
                page = pdf_document.load_page(page_index)
                pixmap = page.get_pixmap(matrix=matrix, alpha=False)
                images.append((f"page_{page_index + 1}", pixmap.tobytes("png")))
    except Exception as e:
        raise ValueError(f"Failed to render PDF pages: {str(e)}") from e

    return images

# ------------------- OCR ENGINE SELECTION -------------------

def ocr_with_easyocr(image: np.ndarray) -> str:
    """Run EasyOCR on image"""
    try:
        if easyocr_reader is None:
            return ""
        
        # Ensure image is in correct format
        if len(image.shape) == 2:
            # Grayscale to RGB
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            # RGBA to RGB
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        
        result = easyocr_reader.readtext(image, detail=0, paragraph=True)
        return " ".join(result) if result else ""
    except Exception as e:
        logger.error(f"EasyOCR failed: {str(e)}")
        return ""

def ocr_with_paddleocr(image: np.ndarray) -> Tuple[str, float]:
    """Run PaddleOCR on image and return text plus average confidence."""
    try:
        if paddleocr_reader is None:
            return "", 0.0

        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

        result = paddleocr_reader.ocr(image, cls=True)
        if not result or not result[0]:
            return "", 0.0

        texts = []
        confidences = []
        for item in result[0]:
            if len(item) < 2:
                continue
            text, confidence = item[1]
            if text:
                texts.append(text)
                confidences.append(float(confidence))

        if not texts:
            return "", 0.0

        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        return " ".join(texts), avg_confidence
    except Exception as e:
        logger.error(f"PaddleOCR failed: {str(e)}")
        return "", 0.0

def ocr_with_tesseract(image: np.ndarray) -> str:
    """Run Tesseract OCR on image"""
    if not tesseract_available:
        return ""
    
    try:
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Tesseract configuration for better accuracy
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹.,/-: '
        text = pytesseract.image_to_string(image, config=custom_config)
        return text.strip()
    except Exception as e:
        logger.error(f"Tesseract failed: {str(e)}")
        return ""

def score_ocr_text(text: str, confidence: float = 0.0) -> float:
    """Score OCR text quality using length, structure, and optional engine confidence."""
    if not text:
        return 0.0

    compact = " ".join(text.split())
    token_count = len(compact.split())
    alpha_count = sum(1 for char in compact if char.isalpha())
    digit_count = sum(1 for char in compact if char.isdigit())

    score = len(compact) * 0.6
    score += token_count * 2.0
    score += min(alpha_count, 200) * 0.15
    score += min(digit_count, 40) * 1.2
    score += confidence * 25.0
    return score

# ------------------- MAIN OCR FUNCTION -------------------

def is_high_quality_ocr(text: str) -> bool:
    """Helper to check if extracted text has enough markers of a valid receipt to stop processing early"""
    if not text or len(text) < 120:
        return False
    tokens = text.upper().split()
    if len(tokens) < 15:
        return False
    digits = sum(1 for c in text if c.isdigit())
    if digits < 5:
        return False
    
    # Financial indicators commonly present in receipts/bills/invoices
    keywords = ["TOTAL", "AMOUNT", "PAID", "DATE", "INR", "TAX", "GST", "CASH", "CARD", "UPI", "BILL", "RECEIPT", "INVOICE", "MERCHANT"]
    keyword_count = sum(1 for kw in keywords if kw in text.upper())
    return keyword_count >= 2

def perform_multi_engine_ocr(image_bytes: bytes) -> Dict[str, str]:
    """
    Perform OCR with a confidence-based cascade.
    PaddleOCR is primary, Tesseract verifies/falls back, and EasyOCR is last resort.
    """
    results = {}
    
    try:
        processed_images = preprocess_image(image_bytes)
        
        if not processed_images:
            return {"text": "", "confidence": "LOW", "engine": "none"}

        def update_best(text: str, engine: str, method_name: str, confidence_value: float = 0.0) -> None:
            if not text:
                return
            score = score_ocr_text(text, confidence_value)
            current_score = score_ocr_text(results.get('text', ''), results.get('ocr_confidence_value', 0.0))
            if score > current_score:
                results['text'] = text
                results['engine'] = f'{engine}_{method_name}'
                results['method'] = method_name
                results['ocr_confidence_value'] = confidence_value
                if confidence_value >= 0.88 or (confidence_value == 0.0 and len(text) > 180):
                    results['confidence'] = 'HIGH'
                elif confidence_value >= 0.70 or len(text) > 80:
                    results['confidence'] = 'MEDIUM'
                else:
                    results['confidence'] = 'LOW'

        def finalize() -> Dict[str, str]:
            if 'text' in results:
                results['text'] = post_process_text(results['text'])
                results.pop('ocr_confidence_value', None)
            return results or {"text": "", "confidence": "LOW", "engine": "none"}

        primary_method, primary_img = processed_images[0]

        # 1. PaddleOCR primary pass. Most clean receipts should stop here.
        if ENABLE_PADDLEOCR and paddleocr_reader is not None:
            text, paddle_confidence = ocr_with_paddleocr(primary_img)
            update_best(text, 'paddleocr', primary_method, paddle_confidence)

            if is_high_quality_ocr(text) and paddle_confidence >= 0.86:
                logger.info(f"Early exit after primary PaddleOCR on '{primary_method}'")
                return finalize()

            # 2. Smart retry: try only the best enhanced pass first, then one more if very weak.
            enhanced_passes = processed_images[1:2]
            if score_ocr_text(results.get('text', ''), results.get('ocr_confidence_value', 0.0)) < 120:
                enhanced_passes = processed_images[1:3]

            for method_name, img in enhanced_passes:
                text, paddle_confidence = ocr_with_paddleocr(img)
                update_best(text, 'paddleocr', method_name, paddle_confidence)

                if is_high_quality_ocr(text) and paddle_confidence >= 0.82:
                    logger.info(f"Early exit after enhanced PaddleOCR on '{method_name}'")
                    return finalize()

        if results.get('text') and is_high_quality_ocr(results['text']):
            logger.info("Skipping fallback engines because PaddleOCR result passed quality checks")
            return finalize()

        fallback_methods = processed_images[:2] if len(processed_images) > 1 else processed_images

        # 3. Tesseract fallback/verification on a small set of likely useful passes.
        if tesseract_available:
            for method_name, img in fallback_methods:
                text = ocr_with_tesseract(img)
                update_best(text, 'tesseract', method_name)

                if is_high_quality_ocr(text):
                    logger.info(f"Stopping after Tesseract fallback on '{method_name}'")
                    return finalize()

        # 4. EasyOCR is the expensive last resort, so run it only once on the best fallback image.
        if easyocr_reader is not None and not (results.get('text') and is_high_quality_ocr(results['text'])):
            method_name, img = fallback_methods[-1]
            text = ocr_with_easyocr(img)
            update_best(text, 'easyocr', method_name)
        
        # Post-process final extracted text
        return finalize()
            
    except Exception as e:
        logger.error(f"Multi-engine OCR failed: {str(e)}")
        results = {"text": "", "confidence": "LOW", "engine": "none", "error": str(e)}
    
    return results

def get_document_ocr_inputs(filename: str, content: bytes) -> List[Tuple[str, bytes]]:
    """Normalize uploaded content into one or more image inputs for OCR."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        return pdf_to_images(content)

    return [("image", content)]

def perform_document_ocr(filename: str, content: bytes) -> Dict[str, str]:
    """
    Run OCR for a single image or for every page of a PDF, then combine
    the extracted text into one document payload for downstream AI parsing.
    """
    ocr_inputs = get_document_ocr_inputs(filename, content)
    page_results = []

    for label, item_bytes in ocr_inputs:
        result = perform_multi_engine_ocr(item_bytes)
        result["source"] = label
        page_results.append(result)

    combined_text_parts = [result.get("text", "").strip() for result in page_results if result.get("text", "").strip()]
    combined_text = "\n\n".join(combined_text_parts)

    confidence_rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}
    best_result = max(
        page_results,
        key=lambda result: (
            confidence_rank.get(result.get("confidence", "LOW"), 0),
            len(result.get("text", ""))
        ),
        default={"confidence": "LOW", "engine": "none"}
    )

    return {
        "text": combined_text,
        "confidence": best_result.get("confidence", "LOW"),
        "engine": best_result.get("engine", "none"),
        "page_count": len(ocr_inputs)
    }

def post_process_text(text: str) -> str:
    """Clean and normalize extracted text"""
    if not text:
        return ""

    # Normalize line endings first so downstream regex can still use line boundaries.
    text = text.replace('\\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

    # Remove non-printable characters while keeping newlines.
    text = ''.join(char for char in text if char.isprintable() or char == '\n')

    # Repair common OCR punctuation and spacing issues before collapsing whitespace.
    substitutions = [
        (r'[_`~"]', ' '),
        (r'[|]', 'I'),
        (r'[:;]\s*', ': '),
        (r'\s*[,]\s*', ', '),
        (r'\s*[.]\s*', '.'),
        (r'([A-Za-z])\s*[:]\s*([A-Za-z0-9])', r'\1: \2'),
        (r'([0-9])\s*[:]\s*([0-9])', r'\1:\2'),
        (r'([A-Za-z])\s*;\s*([A-Za-z0-9])', r'\1: \2'),
        (r'\bAMOUNTEIPAID\b', 'AMOUNT PAID'),
        (r'\bAMOUNTEIPAID\b', 'AMOUNT PAID'),
        (r'\bDEPOSTT\b', 'DEPOSIT'),
        (r'\bDEPOSIL\b', 'DEPOSIT'),
        (r'\bTRANSACTON\b', 'TRANSACTION'),
        (r'\bDETATLS\b', 'DETAILS'),
        (r'\bWTTH\b', 'WITH'),
        (r'\bJ0r\b', 'for'),
        (r'\bR50E\b', 'Rs'),
        # Fix common Rupee symbol hallucinations (₹ misread as r, R, 7, or 8)
        (r'(PAYMENT\)?|AMOUNT|TOTAL|PAID|DUE)\s*[:\-]?\s*[rR78]\s*(\d)', r'\1: \2'),
    ]

    for pattern, replacement in substitutions:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Collapse whitespace per line but keep line breaks for item/date extraction.
    lines = []
    for line in text.split('\n'):
        cleaned = ' '.join(line.split()).strip()
        if cleaned:
            lines.append(cleaned)

    return '\n'.join(lines).strip()

# ------------------- AI ANALYSIS FUNCTION -------------------

async def analyze_text_with_ai(extracted_text: str, cache_key: str = None) -> Dict:
    """
    Analyze extracted text using AI to get structured financial data
    """
    if not ENABLE_AI_ANALYSIS:
        return {"enabled": False, "message": "AI analysis is disabled"}
    
    if not extracted_text or len(extracted_text.strip()) < 20:
        return {
            "enabled": True,
            "success": False,
            "error": "Insufficient text for AI analysis",
            "extracted_data": None
        }
    
    # Check AI cache
    if cache_key:
        ai_cache_key = f"ai_{cache_key}"
        cached_ai_result = get_cached_result(ai_cache_key, AI_CACHE_DIR)
        if cached_ai_result:
            try:
                if isinstance(cached_ai_result, str):
                    return json.loads(cached_ai_result)
                return cached_ai_result
            except:
                pass
    
    # Perform AI analysis
    async with FinancialDocumentAnalyzer() as analyzer:
        result = await analyzer.analyze_text(extracted_text)
        
        if result.success and result.extracted_data:
            formatted_data = format_financial_data_for_display(result.extracted_data)
            response = {
                "enabled": True,
                "success": True,
                "extracted_data": formatted_data,
                "processing_time": result.processing_time,
                "confidence_score": result.extracted_data.confidence_score
            }
            
            # Cache AI result
            if cache_key:
                ai_cache_key = f"ai_{cache_key}"
                cache_result(ai_cache_key, response, AI_CACHE_DIR)
            
            return response
        else:
            return {
                "enabled": True,
                "success": False,
                "error": result.error or "Failed to analyze text",
                "extracted_data": None,
                "processing_time": result.processing_time
            }

# ------------------- HELPER FUNCTIONS -------------------

def validate_file_sync(filename: str, content: bytes) -> Dict:
    """Synchronous file validation"""
    errors = []
    
    if len(content) == 0:
        errors.append("File is empty")
    elif len(content) > MAX_FILE_SIZE:
        errors.append(f"File too large. Max size: {MAX_FILE_SIZE // 1024 // 1024}MB")
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        errors.append(f"Unsupported file extension: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    if ext == ".pdf":
        if fitz is None:
            errors.append("PDF support is unavailable because PyMuPDF is not installed")
        else:
            try:
                with fitz.open(stream=content, filetype="pdf") as pdf_document:
                    if pdf_document.page_count == 0:
                        errors.append("PDF has no pages")
            except Exception as e:
                errors.append(f"PDF validation failed: {str(e)}")
    else:
        # Try to identify image using PIL
        try:
            with Image.open(io.BytesIO(content)) as img:
                if img.size[0] < 10 or img.size[1] < 10:
                    errors.append(f"Image too small: {img.size[0]}x{img.size[1]} pixels")
                if img.size[0] > 10000 or img.size[1] > 10000:
                    errors.append(f"Image dimensions too large: {img.size[0]}x{img.size[1]} pixels")
        except UnidentifiedImageError:
            errors.append("Cannot identify image format. File may be corrupted.")
        except Exception as e:
            errors.append(f"Image validation failed: {str(e)}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "extension": ext,
        "size_bytes": len(content)
    }

# ------------------- HEALTH CHECK -------------------

@app.get("/")
async def root():
    return {
        "service": "Finance OCR Service with AI",
        "status": "running",
        "version": "4.0.0",
        "engines": {
            "easyocr": easyocr_reader is not None,
            "paddleocr": paddleocr_reader is not None,
            "tesseract": tesseract_available
        },
        "gpu": {
            "requested": OCR_USE_GPU,
            "cuda_available": CUDA_AVAILABLE,
            "enabled": OCR_GPU_ENABLED,
            "device": OCR_DEVICE,
            "layout_models_ready": ENABLE_LAYOUT_MODELS
        },
        "ai_analysis": ENABLE_AI_ANALYSIS,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if (easyocr_reader is not None or tesseract_available) else "degraded",
        "engines": {
            "easyocr": easyocr_reader is not None,
            "paddleocr": paddleocr_reader is not None,
            "tesseract": tesseract_available
        },
        "gpu": {
            "requested": OCR_USE_GPU,
            "cuda_available": CUDA_AVAILABLE,
            "enabled": OCR_GPU_ENABLED,
            "device": OCR_DEVICE,
            "layout_models_ready": ENABLE_LAYOUT_MODELS
        },
        "ai_analysis": ENABLE_AI_ANALYSIS,
        "service": "ocr-service",
        "timestamp": datetime.now().isoformat()
    }

# ------------------- MAIN OCR ENDPOINT -------------------

@app.post("/ocr/extract")
async def extract_text(
    file: UploadFile = File(...), 
    enable_ai: bool = True,
    background_tasks: BackgroundTasks = None
) -> Dict:
    """
    Extract text from uploaded image file using multiple OCR engines
    Optionally analyze with AI to extract structured financial data
    
    Args:
        file: Image file to process
        enable_ai: Whether to perform AI analysis on extracted text
    """
    request_id = hashlib.md5(f"{file.filename}{datetime.now().isoformat()}".encode()).hexdigest()[:8]
    logger.info(f"[{request_id}] 📄 Received file: {file.filename} (AI: {enable_ai})")
    
    # Check if at least one OCR engine is available
    if easyocr_reader is None and not tesseract_available:
        raise HTTPException(
            status_code=503,
            detail="No OCR engine available. Service unavailable."
        )
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"[{request_id}] Failed to read file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    
    # Check cache
    cache_key = get_cache_key(content, include_ai=False)
    cached_result = get_cached_result(cache_key)
    if cached_result:
        logger.info(f"[{request_id}] Returning cached OCR result")
        
        # If AI analysis requested, try to get cached AI result or perform analysis
        ai_result = None
        if enable_ai and ENABLE_AI_ANALYSIS:
            ai_cache_key = f"ai_{cache_key}"
            cached_ai = get_cached_result(ai_cache_key, AI_CACHE_DIR)
            if cached_ai:
                ai_result = cached_ai
            else:
                # Perform AI analysis in background
                background_tasks.add_task(
                    analyze_and_cache_ai, 
                    cached_result, 
                    cache_key
                )
        
        return {
            "success": True,
            "request_id": request_id,
            "filename": file.filename,
            "extracted_text": cached_result,
            "text_length": len(cached_result),
            "word_count": len(cached_result.split()),
            "cached": True,
            "ai_analysis": ai_result,
            "timestamp": datetime.now().isoformat()
        }
    
    # Validate file
    validation = validate_file_sync(file.filename, content)
    if not validation["valid"]:
        logger.warning(f"[{request_id}] File validation failed: {validation['errors']}")
        raise HTTPException(
            status_code=400,
            detail=f"File validation failed: {'; '.join(validation['errors'])}"
        )
    
    logger.info(f"[{request_id}] ✅ File validated: {validation['size_bytes']} bytes, type: {validation['extension']}")
    
    # Process OCR
    try:
        # Run OCR in thread pool
        loop = asyncio.get_event_loop()
        ocr_result = await loop.run_in_executor(executor, perform_document_ocr, file.filename, content)
        
        extracted_text = ocr_result.get('text', '')
        confidence = ocr_result.get('confidence', 'LOW')
        engine_used = ocr_result.get('engine', 'unknown')
        
        if not extracted_text:
            logger.warning(f"[{request_id}] No text extracted from image")
            return {
                "success": False,
                "request_id": request_id,
                "filename": file.filename,
                "extracted_text": "",
                "text_length": 0,
                "word_count": 0,
                "confidence": "LOW",
                "engine_used": engine_used,
                "error": "No text detected in the image. Try a clearer receipt image.",
                "warning": "No text detected in the image. Try a clearer image.",
                "ai_analysis": None,
                "timestamp": datetime.now().isoformat()
            }
        
        # Cache OCR result
        background_tasks.add_task(cache_result, cache_key, extracted_text, CACHE_DIR)
        
        # Perform AI analysis if enabled
        ai_result = None
        if enable_ai and ENABLE_AI_ANALYSIS:
            ai_result = await analyze_text_with_ai(extracted_text, cache_key)
        
        logger.info(f"[{request_id}] ✅ OCR successful! Engine: {engine_used}, Confidence: {confidence}, Length: {len(extracted_text)}")
        print(f"🚀 USING OCR ENGINE: {engine_used}")
        
        response = {
            "success": True,
            "request_id": request_id,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "word_count": len(extracted_text.split()),
            "confidence": confidence,
            "engine_used": engine_used,
            "page_count": ocr_result.get("page_count", 1),
            "file_size_bytes": validation["size_bytes"],
            "cached": False,
            "ai_analysis": ai_result,
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except Exception as e:
        logger.error(f"[{request_id}] OCR processing failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

async def analyze_and_cache_ai(extracted_text: str, cache_key: str):
    """Background task to analyze and cache AI results"""
    try:
        result = await analyze_text_with_ai(extracted_text, cache_key)
        logger.info(f"Background AI analysis completed for key: {cache_key}")
    except Exception as e:
        logger.error(f"Background AI analysis failed: {str(e)}")

# ------------------- BATCH OCR ENDPOINT -------------------

@app.post("/ocr/extract-batch")
async def extract_batch(files: List[UploadFile] = File(...), enable_ai: bool = False) -> Dict:
    """
    Extract text from multiple images in parallel
    AI analysis disabled for batch to improve performance
    """
    logger.info(f"📚 Received batch request with {len(files)} files (AI: {enable_ai})")
    
    results = []
    successful = 0
    failed = 0
    
    # Process files in parallel
    async def process_single_file(file: UploadFile, idx: int):
        try:
            content = await file.read()
            validation = validate_file_sync(file.filename, content)
            
            if not validation["valid"]:
                return {
                    "index": idx,
                    "filename": file.filename,
                    "success": False,
                    "error": "; ".join(validation["errors"])
                }
            
            # Run OCR without timeout for batch processing
            ocr_result = await asyncio.get_event_loop().run_in_executor(executor, perform_document_ocr, file.filename, content)
            
            extracted_text = ocr_result.get('text', '')
            
            result = {
                "index": idx,
                "filename": file.filename,
                "success": True,
                "text_length": len(extracted_text),
                "word_count": len(extracted_text.split()),
                "extracted_text": extracted_text,
                "confidence": ocr_result.get('confidence', 'LOW'),
                "engine_used": ocr_result.get('engine', 'unknown'),
                "page_count": ocr_result.get('page_count', 1)
            }
            
            # Add AI analysis if enabled (will increase processing time)
            if enable_ai and ENABLE_AI_ANALYSIS and extracted_text:
                ai_result = await analyze_text_with_ai(extracted_text)
                result["ai_analysis"] = ai_result
            
            return result
            
        except Exception as e:
            return {
                "index": idx,
                "filename": file.filename,
                "success": False,
                "error": str(e)
            }
    
    # Run all files in parallel
    tasks = [process_single_file(file, idx) for idx, file in enumerate(files)]
    batch_results = await asyncio.gather(*tasks)
    
    # Sort by index and collect results
    batch_results.sort(key=lambda x: x['index'])
    for result in batch_results:
        results.append(result)
        if result['success']:
            successful += 1
        else:
            failed += 1
    
    return {
        "success": True,
        "total_files": len(files),
        "successful": successful,
        "failed": failed,
        "ai_enabled": enable_ai,
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# ------------------- AI ONLY ENDPOINT -------------------

@app.post("/analyze/text")
async def analyze_text(text: str, background_tasks: BackgroundTasks = None) -> Dict:
    """
    Analyze pre-extracted text using AI to extract structured financial data
    Useful when you already have the text from other sources
    """
    request_id = hashlib.md5(f"{text[:100]}{datetime.now().isoformat()}".encode()).hexdigest()[:8]
    logger.info(f"[{request_id}] 📝 Received text for AI analysis (length: {len(text)})")
    
    if not ENABLE_AI_ANALYSIS:
        raise HTTPException(status_code=503, detail="AI analysis is disabled")
    
    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short for analysis")
    
    # Generate cache key from text
    cache_key = hashlib.md5(text.encode()).hexdigest()
    
    # Perform AI analysis
    result = await analyze_text_with_ai(text, cache_key)
    
    return {
        "success": result.get("success", False),
        "request_id": request_id,
        "text_length": len(text),
        "analysis": result,
        "timestamp": datetime.now().isoformat()
    }

# ------------------- STATS ENDPOINT -------------------

@app.get("/stats")
async def stats():
    """Get service statistics"""
    cache_files = list(Path(CACHE_DIR).glob("*.json"))
    ai_cache_files = list(Path(AI_CACHE_DIR).glob("*.json"))
    return {
        "model": "Multi-Engine OCR with AI",
        "languages": ["en"],
        "engines": {
            "easyocr": easyocr_reader is not None,
            "paddleocr": paddleocr_reader is not None,
            "tesseract": tesseract_available
        },
        "ai_analysis": {
            "enabled": ENABLE_AI_ANALYSIS,
            "model": MODEL_NAME,
            "cache_size": len(ai_cache_files)
        },
        "gpu": {
            "requested": OCR_USE_GPU,
            "cuda_available": CUDA_AVAILABLE,
            "enabled": OCR_GPU_ENABLED,
            "device": OCR_DEVICE,
            "accelerates": [
                "PaddleOCR text detection",
                "PaddleOCR text recognition",
                "EasyOCR fallback OCR",
                "large receipt images",
                "multi-page PDF OCR",
                "future LayoutLM/Donut inference"
            ]
        },
        "status": "active" if (easyocr_reader is not None or tesseract_available) else "inactive",
        "cache_size": len(cache_files),
        "max_file_size_mb": MAX_FILE_SIZE // 1024 // 1024,
        "allowed_formats": list(ALLOWED_EXTENSIONS),
        "timestamp": datetime.now().isoformat()
    }

# ------------------- ERROR HANDLERS -------------------

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An unexpected error occurred. Please try again.",
            "error_detail": str(exc) if os.getenv("DEBUG") == "true" else None,
            "timestamp": datetime.now().isoformat()
        }
    )

# ------------------- GRACEFUL SHUTDOWN -------------------

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down OCR service...")
    executor.shutdown(wait=True)
    logger.info("OCR service stopped")

# ------------------- ENTRY POINT -------------------

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Starting Finance OCR Service v4.0 (with AI Understanding)")
    print("=" * 70)
    print(f"📁 Model Directory: {MODEL_DIR}")
    print(f"📄 Max File Size: {MAX_FILE_SIZE // 1024 // 1024}MB")
    print(f"🎨 Supported Formats: {', '.join(ALLOWED_EXTENSIONS)}")
    print(f"💾 Cache Directory: {CACHE_DIR}")
    print(f"🤖 AI Cache Directory: {AI_CACHE_DIR}")
    print(f"⚙️  Max Cache Size: {MAX_CACHE_SIZE} files")
    print(f"🧠 AI Analysis: {'✅ Enabled' if ENABLE_AI_ANALYSIS else '❌ Disabled'}")
    print("-" * 70)
    print("🧠 OCR Engines:")
    print(f"   • EasyOCR: {'✅ Available' if easyocr_reader else '❌ Not Available'}")
    print(f"   • Tesseract: {'✅ Available' if tesseract_available else '⚠️ Not Available (optional)'}")
    if ENABLE_AI_ANALYSIS:
        print(f"   • AI Model: {MODEL_NAME}")
        print(f"   • OpenRouter API: {'✅ Configured' if OPENROUTER_API_KEY else '❌ Not Configured'}")
    print("-" * 70)
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("📊 Stats: http://localhost:8000/stats")
    print("=" * 70)
    
    uvicorn.run(
        "ocr_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
