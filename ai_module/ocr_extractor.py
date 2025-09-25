# ocr_extractor.py (Improved Version)
import easyocr
import re

def extract_id_details(image_path: str) -> dict:
    """
    Extracts text from an ID card image using EasyOCR and searches for 
    PAN/Aadhaar numbers and names with improved accuracy.
    """
    details = {"id_number": None, "name": None, "raw_text": ""}
    try:
        # Initialize the EasyOCR reader. This is done once.
        reader = easyocr.Reader(['en'])
        result = reader.readtext(image_path)

        # Combine text for raw output and broad searching
        full_text = " ".join([text for (bbox, text, prob) in result])
        details["raw_text"] = full_text
        print(f"EasyOCR Extracted Text: {full_text}")

        # --- ID Number Extraction (No change here) ---
        pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
        aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
        pan_match = re.search(pan_pattern, full_text)
        aadhaar_match = re.search(aadhaar_pattern, full_text)

        if pan_match:
            details["id_number"] = pan_match.group(0)
            print(f"Extracted PAN number: {details['id_number']}")
        elif aadhaar_match:
            details["id_number"] = aadhaar_match.group(0).replace(" ", "")
            print(f"Extracted Aadhaar number: {details['id_number']}")
        else:
            print("No PAN or Aadhaar number found.")

        # --- Improved Name Extraction Logic ---
        # Get all text lines from the result to analyze them individually
        text_lines = [text for (bbox, text, prob) in result]
        name_found = False
        
        # First, look for a line that comes directly after a "Name" keyword
        for i, line in enumerate(text_lines):
            if 'name' in line.lower() and i + 1 < len(text_lines):
                # Assume the next line is the name
                details["name"] = text_lines[i+1].strip()
                name_found = True
                break
        
        # If no "Name" keyword was found, fall back to the old logic
        # but with more filters to ignore irrelevant lines.
        if not name_found:
            ignore_keywords = ['income', 'department', 'govt', 'india', 'account']
            for text in text_lines:
                text_lower = text.lower()
                # Check for all-caps, at least two words, and not in ignore list
                if (re.match(r'^[A-Z\s\.]+$', text.strip()) and 
                        len(text.strip().split()) >= 2 and 
                        not any(keyword in text_lower for keyword in ignore_keywords)):
                    
                    details["name"] = text.strip()
                    break # Assume the first good candidate is the name
        
        print(f"Possible name extracted: {details['name']}")

    except Exception as e:
        print(f"An error occurred during EasyOCR extraction: {e}")

    return details