"""
Simple test script for OCR service
"""

import requests
import sys

def test_ocr(image_path):
    """Test OCR with a local image"""
    
    url = "http://localhost:8000/ocr/extract"
    
    with open(image_path, 'rb') as f:
        files = {'file': (image_path, f, 'image/jpeg')}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("=" * 50)
        print("OCR Result:")
        print("=" * 50)
        print(f"Filename: {result['filename']}")
        print(f"Text Length: {result['text_length']} chars")
        print(f"Word Count: {result['word_count']}")
        print("\nExtracted Text:")
        print("-" * 50)
        print(result['extracted_text'])
        print("-" * 50)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py <image_path>")
        sys.exit(1)
    
    test_ocr(sys.argv[1])