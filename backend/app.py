from flask import Flask, request, jsonify
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer
from pymongo import MongoClient # [Added] Import PyMongo
import datetime
import os
import sys
from werkzeug.utils import secure_filename
import smtplib
from email.message import EmailMessage
import random
import time

# --- Add parent path for AI modules ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ai_module.face_presence import extract_main_face
from ai_module.ocr_extractor import extract_text_from_image
from ai_module.face_matcher import verify_faces
from ai_module.tamper_detector import check_pasted_photo_edges, check_text_background_consistency

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Secret Keys and Upload Folder ---
app.config['SECRET_KEY'] = 'your-super-secret-key'
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- [ADDED] MongoDB Connection ---
client = MongoClient('mongodb://localhost:27017/')
db = client['securekyc_db']
users_collection = db['users']

# --- Email Credentials ---
EMAIL_ADDRESS = "mitsuhaperl@gmail.com"
EMAIL_PASSWORD = "kbtl qtft tbmc ohmd"

# ==================== ADMIN / TOKEN ROUTES ====================

@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    # You can also move admin credentials to MongoDB if needed
    if data.get('username') == 'admin' and data.get('password') == 'admin@123':
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/generate-token', methods=['POST'])
def generate_token():
    token = s.dumps({'purpose': 'user-verification'})
    return jsonify({"token": token}), 200

@app.route('/get-verified-users', methods=['GET'])
def get_verified_users():
    # [Updated] Fetch all users from MongoDB excluding the internal _id
    users = list(users_collection.find({}, {'_id': 0}))
    return jsonify(users), 200

@app.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.get_json().get('token')
    try:
        s.loads(token, max_age=3600)
        return jsonify({"message": "Token is valid"}), 200
    except:
        return jsonify({"message": "Invalid or expired link"}), 400

# ==================== ID VERIFICATION ROUTE ====================

@app.route('/verify-id-card', methods=['POST'])
def verify_id_card():
    if 'id_card_photo' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['id_card_photo']
    id_type = request.form.get('id_type', 'pan')
    # [Added] Get userId to link this upload to the specific user record
    user_id = request.form.get('userId') 

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Define different settings for each ID type
    ID_SETTINGS = {
        'pan': {'photo_roi': (30, 80, 150, 200)},
        'aadhar': {'photo_roi': (35, 90, 140, 180)}
    }
    settings = ID_SETTINGS.get(id_type, ID_SETTINGS['pan'])

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    results, saved_face_path, ocr_data = [], None, {}

    try:
        # --- NEW VERIFICATION FLOW ---
        saved_face_path = extract_main_face(filepath, app.config['UPLOAD_FOLDER'])
        if saved_face_path:
            results.append({"step": "Face Presence Check", "status": "success", "message": "Face detected on ID."})
        else:
            results.append({"step": "Face Presence Check", "status": "failed", "message": "No face detected on the ID."})
            raise ValueError("Face Presence Failed")

        ocr_data = extract_text_from_image(filepath)
        if ocr_data and ocr_data.get('id_number'):
            results.append({"step": "Information Extraction (OCR)", "status": "success",
                            "message": f"Extracted ID: {ocr_data['id_number']}"})
        else:
            results.append({"step": "Information Extraction (OCR)", "status": "failed",
                            "message": "Could not extract ID number."})
            raise ValueError("OCR Failed")

        tamper_passed = True
        edge_result = check_pasted_photo_edges(filepath, settings['photo_roi'])
        if edge_result.get("tampering_detected"):
            results.append({"step": "Photo Edge Check", "status": "failed", "message": edge_result.get("reason")})
            tamper_passed = False

        if 'name_bbox' in ocr_data and ocr_data['name_bbox']:
            background_result = check_text_background_consistency(filepath, ocr_data['name_bbox'])
            if background_result.get("tampering_detected"):
                results.append({"step": "Text Background Check", "status": "failed",
                                "message": background_result.get("reason")})
                tamper_passed = False
        else:
            results.append({"step": "Text Background Check", "status": "pending",
                            "message": "Name location not found for check."})

        if tamper_passed:
            results.append({"step": "Tamper Checks", "status": "success", "message": "ID card appears authentic."})
        else:
            raise ValueError("Tamper Check Failed")

        face_filename = os.path.basename(saved_face_path)
        
        # [Updated] Store OCR data in MongoDB for this User ID instead of memory
        if user_id:
            users_collection.update_one(
                {"userId": user_id}, 
                {"$set": {
                    "temp_ocr_data": ocr_data, 
                    "id_face_filename": face_filename
                }}
            )

        os.remove(filepath)
        # Return results and face filename for the frontend to use in next step
        return jsonify({"overall_status": "passed", "results": results, "id_face_filename": face_filename})

    except ValueError as e:
        os.remove(filepath)
        if saved_face_path and os.path.exists(saved_face_path):
            os.remove(saved_face_path)
        return jsonify({"overall_status": "failed", "results": results})

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        if saved_face_path and os.path.exists(saved_face_path):
            os.remove(saved_face_path)
        return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500

# ==================== LIVE FACE MATCHING ROUTE ====================

@app.route('/match-face', methods=['POST'])
def match_face():
    # [Updated] Accept userId to retrieve the correct user session
    if 'live_photo' not in request.files or 'userId' not in request.form:
        print("❌ Error: Missing userId or photo in request")
        return jsonify({"error": "Missing required data (live_photo or userId)."}), 400

    live_photo_file = request.files['live_photo']
    user_id = request.form['userId']
    print(f"🔍 Processing Face Match for User ID: {user_id}")

    # [Updated] Fetch user data from MongoDB
    user_record = users_collection.find_one({"userId": user_id})
    if not user_record:
        print(f"❌ Error: User ID {user_id} not found in MongoDB") # <--- Add this
    else:
        print(f"✅ User found: {user_record.get('username', 'Unknown')}") # <--- Add this

    if not user_record or 'id_face_filename' not in user_record:
        return jsonify({"error": "Session data not found. Please start over."}), 404

    id_face_filename = user_record['id_face_filename']
    ocr_data = user_record.get('temp_ocr_data', {})

    id_face_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(id_face_filename))
    live_photo_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(live_photo_file.filename))

    if not os.path.exists(id_face_path):
         return jsonify({"error": "ID Face file missing from server."}), 404

    live_photo_file.save(live_photo_path)

    try:
        result = verify_faces(img1_path=id_face_path, img2_path=live_photo_path)
        is_match = result.get("verified", False)
        
        # Calculate a mock score (replace with actual distance logic if available)
        score = int((1 - result.get('distance', 0.2)) * 100) if 'distance' in result else 85
        if not is_match: score = 30 # Drop score if match failed

        status = "Verified" if is_match else "Invalid"

        # [Updated] Update MongoDB with final status and score
        update_result =users_collection.update_one(
            {"userId": user_id},
            {
                "$set": {
                    "username": ocr_data.get('name', user_record.get('username', 'N/A')),
                    "id_number": ocr_data.get('id_number', 'N/A'),
                    "verified_at": datetime.datetime.now().isoformat(),
                    "status": status,
                    "score": score
                },
                "$unset": {"temp_ocr_data": "", "id_face_filename": ""} # Clean up temp data
            }
        )
        print(f"💾 Database Update Count: {update_result.modified_count}")

        if is_match:
            return jsonify({"status": "success", "message": "Face match successful!", "score": score})
        else:
            return jsonify({"status": "failed", "message": "Faces do not match.", "score": score})

    except Exception as e:
        return jsonify({"error": f"An error occurred during face matching: {str(e)}"}), 500

    finally:
        if os.path.exists(id_face_path):
            os.remove(id_face_path)
        if os.path.exists(live_photo_path):
            os.remove(live_photo_path)

# ==================== EMAIL VERIFICATION LINK ROUTE ====================

@app.route("/send-verification-link", methods=["POST"])
def send_link():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    # Generate a userId if one isn't provided, or use the one from Admin
    userId = data.get("userId", str(random.randint(1000, 9999)))

    token = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=10))
    link = f"http://localhost:3000/user?token={token}&userId={userId}"

    # [Updated] Insert new user record into MongoDB with Pending status
    users_collection.update_one(
        {"userId": userId},
        {"$set": {
            "userId": userId,
            "username": username,
            "email": email,
            "mobile": data.get("mobile", "N/A"),
            "dob": data.get("dob", "N/A"),
            "status": "Pending",
            "score": None,
            "created_at": datetime.datetime.now().isoformat()
        }},
        upsert=True
    )

    # send email
    msg = EmailMessage()
    msg['Subject'] = 'SecureKYC Verification Link'
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = email
    msg.set_content(f"Hello {username},\nClick this link to verify your KYC: {link}\nLink expires in 15 minutes.")

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        return jsonify({"message": "Link sent", "link": link})
    except Exception as e:
        return jsonify({"message": "Failed", "error": str(e)}), 500

# ==================== DELETE USER ROUTE ====================

# Added strict_slashes=False so both /delete-user/123 and /delete-user/123/ work
@app.route('/delete-user/<user_id>', methods=['DELETE'], strict_slashes=False)
def delete_user(user_id):
    try:
        # Convert user_id to string to ensure it matches the MongoDB 'userId' field format
        user_id_str = str(user_id)
        
        # Perform the deletion
        result = users_collection.delete_one({"userId": user_id_str})
        
        if result.deleted_count > 0:
            print(f"🗑️ Permanent Delete: User ID {user_id_str} removed from MongoDB.")
            return jsonify({
                "status": "success",
                "message": f"User {user_id_str} deleted successfully"
            }), 200
        else:
            print(f"⚠️ Deletion Failed: User ID {user_id_str} not found.")
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404
            
    except Exception as e:
        print(f"❌ Server Error during deletion: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
# ==================== RUN SERVER ====================

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False,port=5000)