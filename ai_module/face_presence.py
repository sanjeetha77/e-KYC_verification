import cv2
import os

def extract_main_face(image_path: str, output_folder: str) -> str:
    """
    Finds faces in an image, crops the first and largest face, saves it, and returns the path.

    Args:
        image_path (str): The path to the input image.
        output_folder (str): The folder to save the cropped face image.

    Returns:
        str: The path to the saved face image, or None if no face is found.
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        xml_file_path = os.path.join(script_dir, 'haarcascade_frontalface_default.xml')
        face_cascade = cv2.CascadeClassifier(xml_file_path)

        image = cv2.imread(image_path)
        if image is None:
            return None

        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            return None

        # Assume the largest face is the main one
        (x, y, w, h) = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
        cropped_face = image[y:y+h, x:x+w]
        
        # Save the cropped face
        face_filename = f"face_{os.path.basename(image_path)}"
        face_filepath = os.path.join(output_folder, face_filename)
        cv2.imwrite(face_filepath, cropped_face)
        
        return face_filepath

    except Exception as e:
        print(f"An error occurred in extract_main_face: {e}")
        return None