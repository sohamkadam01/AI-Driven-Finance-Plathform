import asyncio
import aiohttp
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from ai_text_analyzer import FinancialDocumentAnalyzer

async def test():
    analyzer = FinancialDocumentAnalyzer()
    extracted_text = "BEAUTY&MAKEUP TRANSACTION ADVICE STATE BANK OF INDIA DATE: 24-04-2026 TIME: 17:15:33 ATM ID: MKP009876 LOCATION: ELARA MALL.PIMPRI.MH TRANSACTION DETAILS - MAKEUP PURCHASE Premium foundation shade 215 custom match: 1.200.00 Limited edition eyeshadow palette 'Starry Nights': 1, 500.00 Waterproof eyeliner - Jet Black: 450.00 Hydrating lipstick - Soft Rose: 650.00 Set of 3 professiona1 makeup brushes: 200.00 SUBTOTAL: 4.000.00 Discount: [0% - Total 4000]: 0.00 TAX GST - Included): 0.00 TOTAL AMOUNT DEBITED: 4, 000.00 REFERENCE N0: MKP2404179876 *** THANK YOU FOR YOUR EXCEPTIONAL LUXURY PURCHASE *** VISIT THE PREMIUM BEAUTY BOUTIOUE For assistance cal1 +91-7000-888000"
    
    print("Running document analyzer...")
    # Initialize a session for testing
    async with aiohttp.ClientSession() as session:
        analyzer.session = session
        result = await analyzer.analyze_text(extracted_text)
        
        print("\nAnalysis Result Success:", result.success)
        print("Provider Used:", result.provider)
        if result.success and result.extracted_data:
            data = result.extracted_data
            print("\nExtracted Fields:")
            print(f"Merchant Name: {data.merchant_name}")
            print(f"Date: {data.date}")
            print(f"Time: {data.time}")
            print(f"Total Amount: {data.total_amount}")
            print(f"Amount Paid: {data.amount_paid}")
            print(f"Transaction ID: {data.transaction_id}")
            print(f"Payment Method: {data.payment_method}")
            print(f"Bank Name: {data.bank_name}")
            print(f"Address: {data.merchant_address}")
            print(f"Phone: {data.merchant_phone}")
        else:
            print("\nError:", result.error)

if __name__ == "__main__":
    asyncio.run(test())
