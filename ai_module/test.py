# main_test.py
from face_presence import check_face_presence
from ocr_extractor import extract_id_details
from qr_scanner import scan_and_verify_qr
from face_matcher import match_live_face

def run_verification_pipeline(id_card_path: str, person_photo_path: str):
    """
    Runs the full identity verification pipeline.

    Args:
        id_card_path (str): Path to the image of the ID card.
        person_photo_path (str): Path to a clear photo of the person.
    """
    print("=============================================")
    print("      STARTING IDENTITY VERIFICATION         ")
    print("=============================================\n")

    # Step 1: Check for face presence on the ID card
    print("--- Step 1: Checking for Face Presence on ID Card ---")
    if check_face_presence(id_card_path):
        print("✅ Success: Face detected on the ID card.\n")
    else:
        print("❌ Failure: No face detected on the ID card. Aborting.\n")
        return

    # Step 2: Extract details using OCR
    print("--- Step 2: Extracting Text via OCR ---")
    ocr_details = extract_id_details(id_card_path)
    if ocr_details.get("id_number"):
        print(f"✅ Success: Extracted Details -> Name: {ocr_details['name']}, ID: {ocr_details['id_number']}\n")
    else:
        print("⚠️ Warning: Could not extract a valid ID number via OCR.\n")

    # Step 3: Scan QR code and verify with OCR data
    print("--- Step 3: Scanning QR Code ---")
    qr_result = scan_and_verify_qr(id_card_path, ocr_details)
    if qr_result["is_verified"]:
        print(f"✅ Success: {qr_result['message']}\n")
    else:
        print(f"❌ Failure: {qr_result['message']}\n")
        
    # Step 4: Live face matching
    print("--- Step 4: Live Face Matching ---")
    print("Please prepare for the webcam check.")
    if match_live_face(person_photo_path):
        print("\n✅ Verification Success: Live face matches the ID photo.\n")
    else:
        print("\n❌ Verification Failure: Live face does not match the ID photo.\n")

    print("=============================================")
    print("          VERIFICATION PROCESS ENDED         ")
    print("=============================================")


if __name__ == "__main__":
    # --- CONFIGURE YOUR FILE PATHS HERE ---
    ID_CARD_IMAGE_PATH = "PANCARD.jpg"
    PERSON_PHOTO_PATH = "profile_picture.jpg" 
    
    run_verification_pipeline(ID_CARD_IMAGE_PATH, PERSON_PHOTO_PATH)