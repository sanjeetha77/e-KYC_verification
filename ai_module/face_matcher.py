from deepface import DeepFace
import logging

# Suppress unnecessary TensorFlow logging
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # or '2'
logging.getLogger('tensorflow').setLevel(logging.FATAL)


def verify_faces(img1_path: str, img2_path: str) -> dict:
    """
    Verifies if the faces in two images belong to the same person using DeepFace.

    Args:
        img1_path (str): Path to the first image (e.g., the face from the ID card).
        img2_path (str): Path to the second image (e.g., the live webcam photo).

    Returns:
        dict: A dictionary containing the verification result.
              Example success: {'verified': True, 'distance': 0.25, 'model': 'VGG-Face'}
              Example failure: {'verified': False, 'error': 'Face could not be detected in...' }
    """
    try:
        # The verify function from DeepFace handles face detection and comparison.
        # It returns a dictionary with the verification result.
        # 'VGG-Face' is a common and reliable model.
        # 'enforce_detection=True' ensures the function fails if a face isn't found.
        result = DeepFace.verify(
            img1_path=img1_path,
            img2_path=img2_path,
            model_name="VGG-Face",
            enforce_detection=True
        )
        return result

    except Exception as e:
        # This block will catch errors, such as if a face cannot be detected in one of the images.
        print(f"An error occurred during face verification: {e}")
        return {
            "verified": False,
            "error": str(e)
        }

# Example of how to use this script directly for testing
if __name__ == '__main__':
    # Create dummy placeholder files for testing if they don't exist
    if not os.path.exists("test_id.jpg"): open("test_id.jpg", 'a').close()
    if not os.path.exists("test_live.jpg"): open("test_live.jpg", 'a').close()
    
    # Replace these paths with actual images to test the function
    result = verify_faces("test_id.jpg", "test_live.jpg")
    
    print("\n--- Verification Test ---")
    if result.get("verified"):
        print("✅ SUCCESS: The faces are a match.")
    else:
        print("❌ FAILED: The faces do not match or an error occurred.")
    print(f"Details: {result}")
