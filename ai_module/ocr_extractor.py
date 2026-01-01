import cv2
import re
import easyocr

# Initialize the EasyOCR reader. This should be done only once.
reader = easyocr.Reader(['en'], gpu=False) 

def extract_text_from_image(image_path: str) -> dict:
    """
    Extracts text and key fields from an ID card image (PAN or Aadhaar).

    Args:
        image_path (str): The path to the input image.

    Returns:
        dict: A dictionary containing extracted info, including 'name_bbox'.
    """
    try:
        results = reader.readtext(image_path)
        raw_text = " ".join([res[1] for res in results])
        
        extracted_data = {
            "id_number": None,
            "name": None,
            "name_bbox": None,
            "raw_text": raw_text
        }

        # --- Find PAN or Aadhaar Number using Regex ---
        pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
        aadhaar_pattern = r'\d{4}\s\d{4}\s\d{4}'
        
        pan_match = re.search(pan_pattern, raw_text)
        aadhaar_match = re.search(aadhaar_pattern, raw_text)

        if pan_match:
            extracted_data["id_number"] = pan_match.group(0)
        elif aadhaar_match:
            extracted_data["id_number"] = aadhaar_match.group(0)

        # --- Find Name and its Bounding Box ---
        found_name_field = False
        for i, (bbox, text, conf) in enumerate(results):
            if found_name_field:
                extracted_data["name"] = text.strip()
                top_left = bbox[0]
                bottom_right = bbox[2]
                x, y = int(top_left[0]), int(top_left[1])
                w, h = int(bottom_right[0] - x), int(bottom_right[1] - y)
                extracted_data["name_bbox"] = (x, y, w, h)
                break 

            if "name" in text.lower():
                found_name_field = True

        return extracted_data

    except Exception as e:
        print(f"An error occurred during OCR: {e}")
        return {}