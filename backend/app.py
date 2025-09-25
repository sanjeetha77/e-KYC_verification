from flask import Flask, request, jsonify
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# --- Configuration & In-Memory Data ---
# In a real app, use environment variables and a database
app.config['SECRET_KEY'] = 'your-super-secret-key' 
# This key is crucial for creating secure tokens
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# In-memory "database" to store verified users
verified_users = []

# --- Admin Routes ---
@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Hardcoded credentials for the demo
    if username == 'admin' and password == 'admin@123':
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/generate-token', methods=['POST'])
def generate_token():
    # The token will be valid for 1 hour (3600 seconds)
    token = s.dumps({'purpose': 'user-verification'})
    return jsonify({"token": token}), 200

@app.route('/get-verified-users', methods=['GET'])
def get_verified_users():
    return jsonify(verified_users), 200

# --- User Verification Routes ---
@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({"message": "Token is missing"}), 400
    try:
        # Check if the token is valid and not expired (max_age is in seconds)
        s.loads(token, max_age=3600) 
        return jsonify({"message": "Token is valid"}), 200
    except SignatureExpired:
        return jsonify({"message": "Link has expired"}), 400
    except BadTimeSignature:
        return jsonify({"message": "Invalid link"}), 400

@app.route('/submit-verification', methods=['POST'])
def submit_verification():
    data = request.get_json()
    token = data.get('token')
    username = data.get('username')
    dob = data.get('dob')

    if not all([token, username, dob]):
        return jsonify({"message": "Missing data"}), 400

    # Re-verify the token before accepting the data
    try:
        s.loads(token, max_age=3600)
        # In a real app, you would also mark the token as 'used' in a database
        new_user = {"username": username, "dob": dob, "verified_at": datetime.datetime.now().isoformat()}
        verified_users.append(new_user)
        return jsonify({"message": "Verification successful!"}), 200
    except (SignatureExpired, BadTimeSignature):
        return jsonify({"message": "Invalid or expired link"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Running on port 5001 to avoid conflicts