# qr_scanner.py
import cv2
from pyzbar.pyzbar import decode

def scan_and_verify_qr(image_path: str, ocr_details: dict) -> dict:
    """
    Scans for a QR code, decodes it, and verifies its content against OCR data.

    Args:
        image_path (str): The path to the ID card image.
        ocr_details (dict): The dictionary of details extracted by the OCR function.

    Returns:
        dict: A dictionary with QR data and a verification status.
    """
    verification_result = {
        "qr_data": None,
        "is_verified": False,
        "message": "QR code not found."
    }
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            verification_result["message"] = "Could not read image."
            return verification_result
        
        # Decode QR codes
        decoded_objects = decode(image)

        if not decoded_objects:
            return verification_result

        # Assume the first QR code is the relevant one
        qr_data = decoded_objects[0].data.decode('utf-8')
        verification_result["qr_data"] = qr_data
        print(f"QR Code Data: {qr_data}")

        # Verification logic
        id_number_from_ocr = ocr_details.get("id_number")
        if id_number_from_ocr and id_number_from_ocr in qr_data:
            verification_result["is_verified"] = True
            verification_result["message"] = "QR data matches OCR ID number."
        else:
            verification_result["message"] = "QR data does not match OCR ID number."

    except Exception as e:
        verification_result["message"] = f"An error occurred during QR scan: {e}"

    return verification_result