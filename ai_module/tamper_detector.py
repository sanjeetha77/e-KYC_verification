import cv2
import numpy as np

def check_pasted_photo_edges(image_path: str, photo_roi: tuple) -> dict:
    """
    Checks for suspicious straight edges within the photo area of an ID card.
    A high number of long, straight lines can indicate a pasted-on photo.
    """
    try:
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            return {"tampering_detected": True, "reason": "Could not read image for edge check."}

        # Crop to the photo area
        x, y, w, h = photo_roi
        photo_area = image[y:y+h, x:x+w]

        # Use Canny edge detection to find edges
        edges = cv2.Canny(photo_area, 50, 150, apertureSize=3)

        # Use Hough Line Transform to detect straight lines in the edge map
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50, minLineLength=w*0.6, maxLineGap=10)

        line_count = len(lines) if lines is not None else 0
        
        # A real photo printed on a card should have very few long, straight lines.
        threshold = 2 # More than 2 long straight lines is suspicious

        if line_count > threshold:
            return {
                "tampering_detected": True, 
                "reason": f"Suspicious edges found in photo area (found {line_count} straight lines)."
            }
        else:
            return {
                "tampering_detected": False,
                "reason": "Photo area edges appear normal."
            }

    except Exception as e:
        return {"tampering_detected": True, "reason": f"Error during edge detection: {e}"}


def check_text_background_consistency(image_path: str, text_bbox: tuple) -> dict:
    """
    Checks if the background texture/color above and below a text field is consistent.
    Inconsistency can indicate a pasted strip of paper over the original text.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return {"tampering_detected": True, "reason": "Could not read image for background check."}

        x, y, w, h = text_bbox
        
        # Define two small sample areas: one just above the text, one just below.
        sample_height = 10
        top_y_start = max(0, y - sample_height)
        bottom_y_start = y + h
        
        sample_x_start = x + int(w * 0.1)
        sample_width = int(w * 0.8)

        top_sample = image[top_y_start : y, sample_x_start : sample_x_start + sample_width]
        bottom_sample = image[bottom_y_start : bottom_y_start + sample_height, sample_x_start : sample_x_start + sample_width]
        
        if top_sample.size == 0 or bottom_sample.size == 0:
             return {"tampering_detected": True, "reason": "Text is too close to edge to check background."}

        # Calculate the average color and the standard deviation (texture) of each sample
        top_mean, top_stddev = cv2.meanStdDev(top_sample)
        bottom_mean, bottom_stddev = cv2.meanStdDev(bottom_sample)

        # Compare the standard deviations. A pasted paper strip will have very low texture (low stddev).
        stddev_diff = np.abs(top_stddev[0][0] - bottom_stddev[0][0])
        
        if stddev_diff > 16.3:
            return {
                "tampering_detected": True,
                "reason": f"Background texture around text is inconsistent (std dev diff: {stddev_diff:.1f})."
            }
        else:
            return {
                "tampering_detected": False,
                "reason": "Background around text appears consistent."
            }
            
    except Exception as e:
        return {"tampering_detected": True, "reason": f"Error during background consistency check: {e}"}