# face_matcher.py
import cv2
from deepface import DeepFace

def match_live_face(known_face_image_path: str) -> bool:
    """
    Captures video from the webcam and uses DeepFace to verify a live face 
    against a known face image.

    Args:
        known_face_image_path (str): Path to the image of the person to verify.

    Returns:
        bool: True if a match is found, False otherwise.
    """
    # Initialize webcam
    video_capture = cv2.VideoCapture(0)
    if not video_capture.isOpened():
        print("Error: Could not open webcam.")
        return False

    print("Opening webcam... Look at the camera. Press 'q' to quit.")
    
    match_found = False
    
    while True:
        # Grab a single frame of video
        ret, frame = video_capture.read()
        if not ret:
            print("Error: Could not read frame from webcam.")
            break

        try:
            # Use DeepFace to verify the face in the live frame against the known image
            # The frame from cv2 is in BGR format, DeepFace handles the conversion.
            # 'enforce_detection=False' prevents the function from throwing an error if no face is found.
            result = DeepFace.verify(
                img1_path=known_face_image_path, 
                img2_path=frame,
                model_name='VGG-Face', # You can change the model here
                enforce_detection=False
            )

            # Check the verification result
            if result['verified']:
                match_found = True
                display_text = "MATCH FOUND"
                color = (0, 255, 0) # Green
            else:
                display_text = "NO MATCH"
                color = (0, 0, 255) # Red

            # Add text to the frame
            cv2.putText(frame, display_text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        
        except Exception as e:
            # If DeepFace fails for any reason (e.g., no face in known_face_image_path), show an error.
            cv2.putText(frame, "ERROR", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # This can also happen if no face is detected in the frame for a moment.
            # print(f"DeepFace error: {e}") # Uncomment for debugging

        # Display the resulting image
        cv2.imshow('Video', frame)

        # If a match is found, wait 2 seconds and then exit the loop
        if match_found:
            cv2.waitKey(2000) 
            break

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release handle to the webcam
    video_capture.release()
    cv2.destroyAllWindows()
    return match_found