# face_presence.py
import cv2

def check_face_presence(image_path: str) -> bool:
    """
    Checks for the presence of a face in an image using Haar Cascade.

    Args:
        image_path (str): The path to the input image.

    Returns:
        bool: True if at least one face is detected, False otherwise.
    """
    try:
        # Load the pre-trained Haar Cascade model for face detection
        face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not read image from {image_path}")
            return False

        # Convert the image to grayscale (face detection works better on grayscale)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect faces in the image
        faces = face_cascade.detectMultiScale(
            gray_image,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        print(f"Found {len(faces)} faces.")
        return len(faces) > 0

    except Exception as e:
        print(f"An error occurred in face presence check: {e}")
        return False