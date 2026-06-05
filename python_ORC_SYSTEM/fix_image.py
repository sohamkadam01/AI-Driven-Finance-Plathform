"""
Fix and test image for OCR
"""
from PIL import Image
import sys
import os

def fix_image(input_path, output_path=None):
    """Convert image to proper JPEG format"""
    
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = f"{name}_fixed.jpg"
    
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGB (removes alpha channel if present)
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save as JPEG with good quality
        img.save(output_path, 'JPEG', quality=95)
        print(f"✅ Image fixed and saved to: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_image.py <image_path>")
        print("\nExample:")
        print("  python fix_image.py receipt.jpg")
        print("  python fix_image.py C:\\Users\\Admin\\Desktop\\receipt.png")
        sys.exit(1)
    
    fix_image(sys.argv[1])