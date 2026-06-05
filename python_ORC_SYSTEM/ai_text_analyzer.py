"""
AI Text Analyzer for Financial Documents
Using Instructor + Qwen 2.5 for guaranteed structured extraction
Architecture: OCR → Raw Text → Instructor + Qwen 2.5 → Validated Pydantic Model → JSON Output
"""

import os
import json
import logging
import asyncio
import aiohttp
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
from pydantic import BaseModel, Field
import instructor
from openai import OpenAI
from collections import Counter
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================

# OpenRouter Configuration (Secondary/Backup)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "stepfun/step-3.5-flash")

# Ollama Configuration (Primary with Instructor)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "60"))
OLLAMA_MAX_RETRIES = int(os.getenv("OLLAMA_MAX_RETRIES", "0"))

# Provider settings
ENABLE_OLLAMA = os.getenv("ENABLE_OLLAMA", "true").lower() == "true"
ENABLE_OPENROUTER = os.getenv("ENABLE_OPENROUTER", "true").lower() == "true"
ENABLE_REGEX_FALLBACK = os.getenv("ENABLE_REGEX_FALLBACK", "true").lower() == "true"

SITE_URL = os.getenv("SITE_URL", "http://localhost:8000")
SITE_NAME = os.getenv("SITE_NAME", "Finance OCR Service")

# ==================== PYDANTIC MODELS (For Instructor) ====================

class DocumentType(str, Enum):
    """Document types"""
    BANK_RECEIPT = "bank_receipt"
    HOTEL_RECEIPT = "hotel_receipt"
    RESTAURANT_RECEIPT = "restaurant_receipt"
    RETAIL_RECEIPT = "retail_receipt"
    INVOICE = "invoice"
    UNKNOWN = "unknown"

class MerchantInfo(BaseModel):
    """Merchant/Business information"""
    name: Optional[str] = Field(None, description="Business/merchant/store name exactly as written")
    address: Optional[str] = Field(None, description="Complete address including street, city, pin code")
    phone: Optional[str] = Field(None, description="Phone number with area code")
    gst: Optional[str] = Field(None, description="GST number if present")

class TransactionInfo(BaseModel):
    """Transaction information"""
    transaction_id: Optional[str] = Field(None, description="Transaction/reference/order ID")
    invoice_number: Optional[str] = Field(None, description="Invoice/bill number")
    date: Optional[str] = Field(None, description="Transaction date in YYYY-MM-DD format")
    time: Optional[str] = Field(None, description="Transaction time in HH:MM:SS format")

class FinancialDetails(BaseModel):
    """Financial amount details"""
    subtotal: Optional[float] = Field(None, description="Amount before tax")
    tax: Optional[float] = Field(None, description="Total tax amount")
    gst: Optional[float] = Field(None, description="Total GST amount")
    cgst: Optional[float] = Field(None, description="CGST amount")
    sgst: Optional[float] = Field(None, description="SGST amount")
    igst: Optional[float] = Field(None, description="IGST amount")
    discount: Optional[float] = Field(None, description="Discount amount")
    total: Optional[float] = Field(None, description="Final total amount")
    amount_paid: Optional[float] = Field(None, description="Amount actually paid")
    currency: str = Field("INR", description="Currency code")

class PaymentInfo(BaseModel):
    """Payment information"""
    method: Optional[str] = Field(None, description="Payment method (cash, card, upi, netbanking)")
    card_last4: Optional[str] = Field(None, description="Last 4 digits of card if used")
    bank_name: Optional[str] = Field(None, description="Bank name if mentioned")
    upi_id: Optional[str] = Field(None, description="UPI ID if UPI payment used")

class HotelDetails(BaseModel):
    """Hotel-specific details"""
    room_number: Optional[str] = Field(None, description="Room number")
    guest_name: Optional[str] = Field(None, description="Guest name")
    check_in: Optional[str] = Field(None, description="Check-in date")
    check_out: Optional[str] = Field(None, description="Check-out date")
    number_of_nights: Optional[int] = Field(None, description="Number of nights")

class ReceiptData(BaseModel):
    """Complete receipt data - Main model for Instructor"""
    document_type: DocumentType = Field(DocumentType.UNKNOWN, description="Type of document")
    merchant: MerchantInfo = Field(default_factory=MerchantInfo)
    transaction: TransactionInfo = Field(default_factory=TransactionInfo)
    financial: FinancialDetails = Field(default_factory=FinancialDetails)
    payment: PaymentInfo = Field(default_factory=PaymentInfo)
    hotel_details: Optional[HotelDetails] = Field(None, description="Hotel specific details")
    confidence_score: float = Field(0.0, description="Overall confidence score 0-100")

# ==================== LEGACY FINANCIAL DATA (For backward compatibility) ====================

@dataclass
class FinancialData:
    """Structured financial data extracted from document (Legacy format)"""
    document_type: str = "unknown"
    merchant_name: Optional[str] = None
    merchant_address: Optional[str] = None
    merchant_phone: Optional[str] = None
    merchant_gst: Optional[str] = None
    transaction_id: Optional[str] = None
    invoice_number: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    room_number: Optional[str] = None
    guest_name: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total_amount: Optional[float] = None
    amount_paid: Optional[float] = None
    balance_due: Optional[float] = None
    currency: str = "INR"
    payment_method: Optional[str] = None
    card_number_last4: Optional[str] = None
    bank_name: Optional[str] = None
    customer_name: Optional[str] = None
    items: List[Dict] = None
    raw_text: str = ""
    confidence_score: float = 0.0
    provider_used: str = "none"
    
    def __post_init__(self):
        if self.items is None:
            self.items = []

@dataclass
class AIAnalysisResult:
    success: bool
    extracted_data: Optional[FinancialData]
    raw_response: str
    processing_time: float
    provider: str
    error: Optional[str] = None

# ==================== INSTRUCTOR + OLLAMA PROVIDER ====================

class InstructorOllamaProvider:
    """
    Primary: Instructor + Ollama with Qwen 2.5
    This guarantees structured JSON output with proper validation
    """
    
    def __init__(self):
        self.name = "instructor_ollama"
        self.client = None
        self._init_client()
    
    def _init_client(self):
        """Initialize the Instructor client with Ollama"""
        try:
            # Create OpenAI-compatible Async client for Ollama
            from openai import AsyncOpenAI
            base_client = AsyncOpenAI(
                base_url=f"{OLLAMA_BASE_URL}/v1",
                api_key="ollama",  # Required but ignored
                timeout=OLLAMA_TIMEOUT_SECONDS,
                max_retries=0
            )
            # Wrap with Instructor for structured output
            self.client = instructor.from_openai(
                base_client,
                mode=instructor.Mode.JSON
            )
            logger.info(f"Instructor + Ollama initialized with model: {OLLAMA_MODEL}")
            print(f"🤖 USING OLLAMA MODEL: {OLLAMA_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize Instructor + Ollama: {e}")
            self.client = None
    
    def _convert_to_legacy_format(self, receipt_data: ReceiptData, raw_text: str) -> FinancialData:
        """Convert Pydantic model to legacy FinancialData format"""
        result = FinancialData(
            document_type=receipt_data.document_type.value,
            raw_text=raw_text[:500],
            provider_used=self.name,
            confidence_score=receipt_data.confidence_score
        )
        
        # Merchant info
        if receipt_data.merchant:
            result.merchant_name = receipt_data.merchant.name
            result.merchant_address = receipt_data.merchant.address
            result.merchant_phone = receipt_data.merchant.phone
            result.merchant_gst = receipt_data.merchant.gst
        
        # Transaction info
        if receipt_data.transaction:
            result.transaction_id = receipt_data.transaction.transaction_id
            result.invoice_number = receipt_data.transaction.invoice_number
            result.date = receipt_data.transaction.date
            result.time = receipt_data.transaction.time
        
        # Financial details
        if receipt_data.financial:
            result.subtotal = receipt_data.financial.subtotal
            result.tax = receipt_data.financial.tax
            result.total_amount = receipt_data.financial.total
            result.amount_paid = receipt_data.financial.amount_paid
            result.currency = receipt_data.financial.currency
        
        # Payment info
        if receipt_data.payment:
            result.payment_method = receipt_data.payment.method
            result.card_number_last4 = receipt_data.payment.card_last4
            result.bank_name = receipt_data.payment.bank_name
        
        # Hotel details
        if receipt_data.hotel_details:
            result.room_number = receipt_data.hotel_details.room_number
            result.guest_name = receipt_data.hotel_details.guest_name
        
        return result
    
    async def analyze(self, text: str) -> tuple:
        """
        Analyze text using Instructor + Ollama
        Returns (response_json, error)
        """
        if not self.client:
            return None, "Instructor client not initialized"
        
        try:
            # Create the prompt for extraction
            prompt = self._create_extraction_prompt(text)
            
            # Use Instructor to force structured output with AsyncOpenAI
            response = await self.client.chat.completions.create(
                model=OLLAMA_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert financial document extractor. Extract information exactly as shown in the text. Preserve original formatting, case, and spelling."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_model=ReceiptData,  # This forces the output to match our schema
                temperature=0.0,  # Zero randomness for exact extraction
                max_retries=OLLAMA_MAX_RETRIES
            )
            
            # Convert to legacy format
            legacy_data = self._convert_to_legacy_format(response, text)
            
            # Return as JSON string for compatibility
            return json.dumps(asdict(legacy_data)), None
            
        except Exception as e:
            logger.error(f"Instructor extraction failed: {e}")
            return None, str(e)
    
    def _create_extraction_prompt(self, text: str) -> str:
        """Create the extraction prompt with OCR error correction"""
        return f"""Extract ALL available information from this financial receipt.

CRITICAL OCR ERROR CORRECTION RULES:
The OCR frequently misreads numbers. Apply these corrections:
- 'O' or 'o' or 'Ooo' = '0' (zero)
- 'l' or 'I' = '1' (one)
- 'S' = '5', 'Z' = '2', 'B' = '8', 'g' = '9'

For amounts, look for CONSISTENCY across the document:
- If multiple amounts appear, the most frequently occurring number is likely correct
- Amounts should be reasonable for the document type:
  * Hotel receipts: ₹1,000 - ₹100,000
  * Restaurant bills: ₹100 - ₹20,000
  * Bank statements: Any amount possible

CRITICAL FINANCIAL CONSTRAINT RULES:
- Never extract "1.0" or "1.00" as the total_amount or amount_paid unless it is explicitly, unmistakably the total amount of the transaction. Avoid confusing item quantities (like "x1" or "1.00 qty") with totals.
- amount_paid must equal the total_amount if only a single payment exists and there is no remaining balance.
- total_amount must be greater than or equal to subtotal.
- Preserve receipt math exactly: subtotal + tax - discount should reconcile to total_amount whenever those fields are present.
- Do not hallucinate totals from quantities, item counts, room numbers, dates, times, phone numbers, or percentages.
- If an OCR value conflicts with the surrounding labels and arithmetic, choose the amount that satisfies the receipt's financial relationship.

OCR TEXT:
{text[:8000]}

INSTRUCTIONS:
1. Prefer the most likely merchant, bank, hotel, restaurant, or store name from the header
2. For dates, convert to YYYY-MM-DD format when possible
3. For times, normalize to HH:MM:SS when possible
4. For amounts, extract numeric values even if OCR spacing is noisy
5. If information is not present, leave as null
6. Detect document type: bank_receipt, hotel_receipt, restaurant_receipt, retail_receipt, invoice, or unknown
7. If both total and amount paid appear, extract both
8. Treat labels with OCR errors as equivalent, for example DEPOSTT=DEPOSIT and AMOUNTEIPAID=AMOUNT PAID

Extract all relevant fields into the provided schema."""

# ==================== FALLBACK PROVIDERS ====================

class OpenRouterProvider:
    """Secondary: OpenRouter API provider (fallback if Instructor fails)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.name = "openrouter"
        
    async def analyze(self, prompt: str, session: aiohttp.ClientSession) -> tuple:
        if not self.api_key:
            return None, "No API key"
        
        try:
            payload = {
                "model": OPENROUTER_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0,
                "max_tokens": 2000
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with session.post(OPENROUTER_BASE_URL, json=payload, headers=headers, timeout=120) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    return content, None
                return None, f"HTTP {response.status}"
                    
        except Exception as e:
            return None, str(e)

def clean_amount_string(amount_str: str) -> Optional[float]:
    """Clean and convert amount string to float with robust error handling"""
    if not amount_str:
        return None
    try:
        # Remove spaces and common currency symbols
        cleaned = amount_str.replace(' ', '')
        cleaned = re.sub(r'[₹$€£\s]', '', cleaned)
        
        # Find all periods and commas
        separators = [char for char in cleaned if char in ('.', ',')]
        if len(separators) > 1:
            # Multiple separators: the last one is the decimal separator, all others are thousands separators
            last_sep_idx = max(cleaned.rfind('.'), cleaned.rfind(','))
            prefix = cleaned[:last_sep_idx]
            suffix = cleaned[last_sep_idx:]
            prefix = prefix.replace('.', '').replace(',', '')
            suffix = '.' + suffix[1:]
            cleaned = prefix + suffix
        elif len(separators) == 1:
            sep = separators[0]
            sep_idx = cleaned.find(sep)
            post_sep = cleaned[sep_idx + 1:]
            if len(post_sep) == 3 and sep == '.':
                # e.g., "4.000" -> likely four thousand, not four point zero
                cleaned = cleaned.replace('.', '')
            elif sep == ',':
                # In US/Indian formats, comma is thousands separator
                # if it's followed by exactly 2 digits at the end, it might be a decimal separator in European formats
                if len(post_sep) == 2:
                    cleaned = cleaned.replace(',', '.')
                else:
                    cleaned = cleaned.replace(',', '')
        
        return float(cleaned)
    except (ValueError, TypeError):
        return None

class RegexProvider:
    """Tertiary: Regex fallback (last resort)"""
    
    def __init__(self):
        self.name = "regex"
        
    async def analyze(self, text: str) -> tuple:
        result = self._extract_with_regex(text)
        return result, None
    
    def _extract_with_regex(self, text: str) -> str:
        data = {
            "document_type": "unknown",
            "merchant_name": None,
            "merchant_address": None,
            "merchant_phone": None,
            "transaction_id": None,
            "date": None,
            "time": None,
            "total_amount": None,
            "amount_paid": None,
            "payment_method": None,
            "bank_name": None,
            "confidence_score": 70
        }

        normalized_text = self._normalize_text_for_regex(text)

        # Detect document type
        if re.search(r'\bHOTEL|ROOM|RESERVATION|CHECK[- ]?IN|CHECK[- ]?OUT|GUEST\b', normalized_text, re.IGNORECASE):
            data["document_type"] = "hotel_receipt"
        elif re.search(r'\bBANK|ACCOUNT|ATM|DEPOSIT|WITHDRAWAL|BALANCE\b', normalized_text, re.IGNORECASE):
            data["document_type"] = "bank_receipt"
        elif re.search(r'\bRESTAURANT|DINER|CAFE|FOOD|TABLE|ORDER\b', normalized_text, re.IGNORECASE):
            data["document_type"] = "restaurant_receipt"
        elif re.search(r'\bINVOICE\b', normalized_text, re.IGNORECASE):
            data["document_type"] = "invoice"
        elif re.search(r'\bMART|STORE|SHOP|RETAIL|PURCHASE|BILL\b', normalized_text, re.IGNORECASE):
            data["document_type"] = "retail_receipt"

        # Extract merchant / bank / hotel name
        bank_match = re.search(r'(STATE BANK OF INDIA|SBI|HDFC BANK|ICICI BANK|AXIS BANK)', normalized_text, re.IGNORECASE)
        if bank_match:
            data["merchant_name"] = bank_match.group(1)
            data["bank_name"] = bank_match.group(1)
        else:
            merchant_patterns = [
                r'(HOTEL\s+[A-Z][A-Z\s&-]{2,})',
                r'([A-Z][A-Z\s&-]{3,}\s+(?:HOTEL|RESTAURANT|CAFE|MART|STORE))',
                r'([A-Z][A-Z\s&-]{4,})\s+(?:ROOM|GUEST|INVOICE|RECEIPT|BILL)'
            ]
            for pattern in merchant_patterns:
                merchant_match = re.search(pattern, normalized_text, re.IGNORECASE)
                if merchant_match:
                    data["merchant_name"] = ' '.join(merchant_match.group(1).split())
                    break

        # Extract Date
        date_match = re.search(r'DATE\s*[:\-]?\s*(\d{2})[-/\s](\d{2})[-/\s](\d{4})', normalized_text, re.IGNORECASE)
        if date_match:
            data["date"] = f"{date_match.group(3)}-{date_match.group(2)}-{date_match.group(1)}"

        # Extract Time
        time_match = re.search(r'TIME\s*[:\-]?\s*(\d{2})[:\s](\d{2})[:\s](\d{2})', normalized_text, re.IGNORECASE)
        if time_match:
            data["time"] = f"{time_match.group(1)}:{time_match.group(2)}:{time_match.group(3)}"

        # Extract Transaction ID
        ref_match = re.search(r'\b(?:REFERENCE\s*N[O0]|REFERENCE|REF\s*N[O0]|REF|TXN\s*ID|TRANSACTION\s*ID|GUEST\s*ID)\b\s*[:\-]?\s*([A-Z0-9]{6,})', normalized_text, re.IGNORECASE)
        if ref_match:
            data["transaction_id"] = ref_match.group(1)

        # Extract Amounts
        amount_patterns = [
            (r'\b(?:AMOUNT\s*PAID|AMOUNT\s*DEPOSITED|DEPOSIT\s*AMOUNT|PAYMENT\s*AMOUNT|TOTAL\s*AMOUNT\s*DEBITED|AMOUNT\s*DEBITED|TOTAL\s*AMOUNT\s*PAID)\b\s*[:\-]?\s*(\d+(?:[.,\s]\s*\d+)*)', "amount_paid"),
            (r'\b(?:TOTAL\s*AMOUNT\s*DEBITED|TOTAL\s*AMOUNT|GRAND\s*TOTAL|RESERVATION\s*TOTAL|BILL\s*TOTAL|NET\s*TOTAL|TOTAL)\b\s*[:\-]?\s*(\d+(?:[.,\s]\s*\d+)*)', "total_amount"),
            (r'\b(?:BALANCE\s*DUE|DUE)\b\s*[:\-]?\s*(\d+(?:[.,\s]\s*\d+)*)', "balance_due"),
        ]

        for pattern, field_name in amount_patterns:
            amount_match = re.search(pattern, normalized_text, re.IGNORECASE)
            if amount_match:
                amount = self._parse_amount(amount_match.group(1))
                if amount is not None:
                    if field_name == "amount_paid":
                        data["amount_paid"] = amount
                    elif field_name == "total_amount":
                        data["total_amount"] = amount

        if data["total_amount"] is None and data["amount_paid"] is not None:
            data["total_amount"] = data["amount_paid"]
        if data["amount_paid"] is None and data["total_amount"] is not None:
            data["amount_paid"] = data["total_amount"]

        # Extract payment / transaction type
        type_match = re.search(r'(?:TRANSACTION\s*TYPE|PAYMENT\s*METHOD|PAYMENT\s*TYPE|DEPOSIT\s*TYPE)\s*[:\-]?\s*([A-Z][A-Z\s/-]{2,})', normalized_text, re.IGNORECASE)
        if type_match:
            data["payment_method"] = ' '.join(type_match.group(1).split())

        # Extract Phone
        phone_match = re.search(r'(?:call|phone|reservations?\s*call)\s*[:\-]?\s*(\+?\d[\d\s-]{8,}\d)', normalized_text, re.IGNORECASE)
        if phone_match:
            data["merchant_phone"] = re.sub(r'\s+', '', phone_match.group(1))

        # Extract Address
        address_match = re.search(r'(?:LOCATION|ADDRESS)\s*[:\-]?\s*([A-Z0-9\s,-]{6,})', normalized_text, re.IGNORECASE)
        if address_match:
            data["merchant_address"] = ' '.join(address_match.group(1).split())

        return json.dumps(data)

    def _normalize_text_for_regex(self, text: str) -> str:
        normalized = text.upper()
        replacements = {
            "DEPOSTT": "DEPOSIT",
            "DEPOSIL": "DEPOSIT",
            "AMOUNTEIPAID": "AMOUNT PAID",
            "AMOUNTEIPAID": "AMOUNT PAID",
            "TRANSACTON": "TRANSACTION",
            "DETATLS": "DETAILS",
            "WTTH": "WITH",
            "RESERVATI0N": "RESERVATION",
        }
        for bad, good in replacements.items():
            normalized = normalized.replace(bad, good)
        normalized = re.sub(r'[;]', ':', normalized)
        normalized = re.sub(r'\s+', ' ', normalized)
        return normalized

    def _parse_amount(self, raw_amount: str) -> Optional[float]:
        return clean_amount_string(raw_amount)

# ==================== MAIN ANALYZER CLASS ====================

class FinancialDocumentAnalyzer:
    """
    Multi-provider analyzer with priority:
    1. Instructor + Ollama (Qwen 2.5) - Guaranteed structured output
    2. OpenRouter - Cloud fallback
    3. Regex - Last resort
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENROUTER_API_KEY
        self.session = None
        self.providers = []
        
        # 1. PRIMARY: Instructor + Ollama (Best for structured extraction)
        if ENABLE_OLLAMA:
            self.providers.append(InstructorOllamaProvider())
            logger.info(f"Primary provider: Instructor + Ollama ({OLLAMA_MODEL})")
        
        # 2. SECONDARY: OpenRouter (Cloud backup)
        if ENABLE_OPENROUTER and self.api_key:
            self.providers.append(OpenRouterProvider(self.api_key))
            logger.info("Secondary provider: OpenRouter")
        
        # 3. TERTIARY: Regex (Always works)
        if ENABLE_REGEX_FALLBACK:
            self.providers.append(RegexProvider())
            logger.info("Fallback provider: Regex")
        
        if not self.providers:
            logger.warning("No providers configured!")
    
    def validate_and_correct_amounts(self, extracted_data: FinancialData, raw_text: str) -> FinancialData:
        """Cross-validate amounts for consistency with enhanced logic and semantic validation"""
        
        if not extracted_data:
            return extracted_data
        
        logger.info(f"🔍 Validating amounts - Total: {extracted_data.total_amount}, Paid: {extracted_data.amount_paid}")
        
        # Helper to find alternative amounts from text
        raw_amounts = re.findall(r'(\d+(?:[.,\s]\s*\d+)*)', raw_text)
        all_amounts = []
        for amount_text in raw_amounts:
            amount = self._clean_amount(amount_text)
            if amount is not None:
                all_amounts.append(amount)

        valid_amounts = [amount for amount in all_amounts if amount > 1.0]
        most_common_valid = Counter(valid_amounts).most_common(1)[0][0] if valid_amounts else None

        # Semantic Rule 1: Filter out 1.0 / 1.00 quantity artifacts
        if extracted_data.total_amount == 1.0:
            logger.warning("Extracted total of 1.0 is likely a quantity/OCR artifact. Seeking alternative from text.")
            extracted_data.total_amount = most_common_valid
        if extracted_data.amount_paid == 1.0:
            logger.warning("Extracted amount_paid of 1.0 is likely a quantity/OCR artifact. Seeking alternative from text.")
            extracted_data.amount_paid = most_common_valid

        # Method 1: Look for DEPOSIT AMOUNT (most reliable field in hotel receipts)
        deposit_match = re.search(r'DEPOSIT\s*AMOUNT\s*:?\s*[A-Za-z₹]?\s*(\d+(?:[.,\s]\s*\d+)*)', raw_text, re.IGNORECASE)
        if deposit_match:
            deposit_amount = self._clean_amount(deposit_match.group(1))
            if deposit_amount and deposit_amount > 0:
                logger.info(f"✅ Found DEPOSIT AMOUNT: {deposit_amount}")
                if extracted_data.total_amount != deposit_amount:
                    logger.info(f"Correcting total from {extracted_data.total_amount} to {deposit_amount}")
                    extracted_data.total_amount = deposit_amount
                if extracted_data.amount_paid != deposit_amount:
                    logger.info(f"Correcting amount_paid from {extracted_data.amount_paid} to {deposit_amount}")
                    extracted_data.amount_paid = deposit_amount
                return extracted_data
        
        # Method 2: Find most common valid amount in raw text (if total/paid are zero/None)
        amount_candidates = valid_amounts or all_amounts
        if amount_candidates:
            most_common = Counter(amount_candidates).most_common(1)[0][0]
            logger.info(f"Most common amount in text: {most_common}")
            
            # If extracted amounts are zero or None, use most common
            if not extracted_data.total_amount or extracted_data.total_amount == 0:
                extracted_data.total_amount = most_common
            if not extracted_data.amount_paid or extracted_data.amount_paid == 0:
                extracted_data.amount_paid = most_common
        
        # Semantic Rule 2: Ensure total is not less than subtotal
        if extracted_data.subtotal and extracted_data.total_amount:
            if extracted_data.total_amount < extracted_data.subtotal:
                logger.warning(f"Semantic anomaly: Total ({extracted_data.total_amount}) is less than subtotal ({extracted_data.subtotal}). Correcting total.")
                if extracted_data.amount_paid and extracted_data.amount_paid >= extracted_data.subtotal:
                    extracted_data.total_amount = extracted_data.amount_paid
                else:
                    extracted_data.total_amount = extracted_data.subtotal

        # Method 3: Ensure consistency between total and amount_paid
        if extracted_data.total_amount and (extracted_data.balance_due is None or abs(extracted_data.balance_due) < 1):
            if not extracted_data.amount_paid or extracted_data.amount_paid == 0:
                extracted_data.amount_paid = extracted_data.total_amount

        if extracted_data.total_amount and extracted_data.amount_paid:
            # If they are close (within 1%), set them equal
            if abs(extracted_data.total_amount - extracted_data.amount_paid) / max(extracted_data.total_amount, 1) < 0.01:
                avg_amount = (extracted_data.total_amount + extracted_data.amount_paid) / 2
                extracted_data.total_amount = avg_amount
                extracted_data.amount_paid = avg_amount
                logger.info(f"Balanced amounts to: {avg_amount}")
        
        # Method 4: Fix balance_due if it's clearly wrong (should be 0 when total = paid)
        if extracted_data.total_amount and extracted_data.amount_paid:
            if abs(extracted_data.total_amount - extracted_data.amount_paid) < 1:
                extracted_data.balance_due = 0.0
        
        return extracted_data

    def _clean_amount(self, amount_str: str) -> Optional[float]:
        """Clean and convert amount string to float with better error handling"""
        return clean_amount_string(amount_str)
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def analyze_text(self, extracted_text: str) -> AIAnalysisResult:
        import time
        start_time = time.time()
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return AIAnalysisResult(
                success=False, extracted_data=None, raw_response="",
                processing_time=time.time() - start_time, provider="none",
                error="No text to analyze"
            )
        
        # Try each provider in priority order
        for provider in self.providers:
            logger.info(f"Trying: {provider.name}")
            
            try:
                # Different providers have different method signatures
                if provider.name == "instructor_ollama":
                    try:
                        response, error = await asyncio.wait_for(
                            provider.analyze(extracted_text),
                            timeout=OLLAMA_TIMEOUT_SECONDS + 5
                        )
                    except asyncio.TimeoutError:
                        logger.warning(
                            "instructor_ollama timed out after %.0fs; trying next provider",
                            OLLAMA_TIMEOUT_SECONDS
                        )
                        continue
                elif provider.name == "regex":
                    response, error = await provider.analyze(extracted_text)
                else:
                    # OpenRouter needs a prompt
                    prompt = self._create_fallback_prompt(extracted_text)
                    response, error = await provider.analyze(prompt, self.session)
                
                if response and not error:
                    # Parse the response
                    extracted_data = self._parse_response(response, extracted_text, provider.name)
                    
                    # Validate and correct amounts
                    extracted_data = self.validate_and_correct_amounts(extracted_data, extracted_text)
                    
                    # Accept partial but meaningful extraction instead of requiring a near-perfect result.
                    extracted_fields = [
                        extracted_data.transaction_id if extracted_data else None,
                        extracted_data.total_amount if extracted_data else None,
                        extracted_data.amount_paid if extracted_data else None,
                        extracted_data.merchant_name if extracted_data else None,
                        extracted_data.date if extracted_data else None,
                        extracted_data.payment_method if extracted_data else None,
                        extracted_data.bank_name if extracted_data else None,
                        extracted_data.room_number if extracted_data else None,
                    ]
                    extracted_count = sum(1 for value in extracted_fields if value not in (None, "", 0, 0.0))

                    if extracted_data and extracted_count >= 2:
                        logger.info(f"SUCCESS with {provider.name}")
                        return AIAnalysisResult(
                            success=True,
                            extracted_data=extracted_data,
                            raw_response=response,
                            processing_time=time.time() - start_time,
                            provider=provider.name
                        )
                    else:
                        logger.warning(f"{provider.name} returned insufficient data ({extracted_count} fields), trying next")
                else:
                    logger.warning(f"{provider.name} failed: {error}")
                    
            except Exception as e:
                logger.error(f"{provider.name} error: {e}")
                continue
        
        # All providers failed
        return AIAnalysisResult(
            success=False,
            extracted_data=None,
            raw_response="",
            processing_time=time.time() - start_time,
            provider="none",
            error="All providers failed"
        )
    
    def _create_fallback_prompt(self, extracted_text: str) -> str:
        """Fallback prompt for non-Instructor providers"""
        return f"""Extract from this receipt. OCR text may be noisy. Return ONLY valid JSON.
Keep amounts logically consistent:
- Never extract item quantities (like 1 or 1.0) as totals.
- amount_paid should equal total_amount if only a single payment exists.
- total_amount should be >= subtotal.
- Preserve financial relationships: subtotal + tax - discount should match total_amount when present.
- Do not convert quantities, dates, times, phone numbers, room numbers, or percentages into money amounts.
- If there is no balance_due, amount_paid must equal total_amount.

TEXT:
{extracted_text[:5000]}

Return: {{"document_type": "unknown", "merchant_name": "", "transaction_id": "", "date": "", "time": "", "subtotal": 0, "tax": 0, "total_amount": 0, "amount_paid": 0, "balance_due": 0, "payment_method": "", "bank_name": ""}}"""

    def _parse_response(self, response: str, raw_text: str, provider: str) -> FinancialData:
        """Parse response into FinancialData"""
        try:
            # Clean response
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            # If it's already a JSON string from Instructor, parse it
            data = json.loads(cleaned)
            
            result = FinancialData(
                document_type=data.get("document_type", "receipt"),
                raw_text=raw_text[:500],
                provider_used=provider
            )
            
            # Handle both nested and flat structures
            if "merchant" in data and isinstance(data["merchant"], dict):
                # Nested structure (from Instructor)
                result.merchant_name = data["merchant"].get("name")
                result.merchant_address = data["merchant"].get("address")
                result.merchant_phone = data["merchant"].get("phone")
            else:
                # Flat structure
                result.merchant_name = data.get("merchant_name")
                result.merchant_address = data.get("merchant_address")
                result.merchant_phone = data.get("merchant_phone")
            
            if "transaction" in data and isinstance(data["transaction"], dict):
                result.transaction_id = data["transaction"].get("id")
                result.date = data["transaction"].get("date")
                result.time = data["transaction"].get("time")
            else:
                result.transaction_id = data.get("transaction_id")
                result.date = data.get("date")
                result.time = data.get("time")
            
            if "financial" in data and isinstance(data["financial"], dict):
                result.subtotal = data["financial"].get("subtotal")
                result.tax = data["financial"].get("tax")
                result.total_amount = data["financial"].get("total")
                result.amount_paid = data["financial"].get("amount_paid")
                result.balance_due = data["financial"].get("balance_due")
            else:
                result.subtotal = data.get("subtotal")
                result.tax = data.get("tax")
                result.total_amount = data.get("total_amount")
                result.amount_paid = data.get("amount_paid")
                result.balance_due = data.get("balance_due")
            
            if "payment" in data and isinstance(data["payment"], dict):
                result.payment_method = data["payment"].get("method")
                result.bank_name = data["payment"].get("bank_name")
            else:
                result.payment_method = data.get("payment_method")
                result.bank_name = data.get("bank_name")
            
            if "hotel_details" in data and data["hotel_details"]:
                result.room_number = data["hotel_details"].get("room_number")
                result.guest_name = data["hotel_details"].get("guest_name")
            
            result.confidence_score = data.get("confidence_score", 70)
            
            return result
            
        except Exception as e:
            logger.error(f"Parse error: {e}")
            return FinancialData(raw_text=raw_text[:500], provider_used=provider, confidence_score=0)

# ==================== HELPER FUNCTIONS ====================

def format_financial_data_for_display(data: FinancialData) -> Dict:
    """Format FinancialData for JSON response"""
    if not data:
        return {}
    
    result = {
        "document_type": data.document_type,
        "merchant": {
            "name": data.merchant_name,
            "address": data.merchant_address,
            "phone": data.merchant_phone
        },
        "transaction": {
            "id": data.transaction_id,
            "date": data.date,
            "time": data.time
        },
        "financial": {
            "total": data.total_amount,
            "amount_paid": data.amount_paid,
            "currency": data.currency
        },
        "payment": {
            "method": data.payment_method,
            "bank_name": data.bank_name
        },
        "confidence_score": data.confidence_score,
        "provider_used": data.provider_used
    }
    
    # Add hotel details if present
    if data.room_number or data.guest_name:
        result["hotel_details"] = {
            "room_number": data.room_number,
            "guest_name": data.guest_name
        }
    
    return result
