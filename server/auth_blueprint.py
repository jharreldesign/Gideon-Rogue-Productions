import os
import jwt
import bcrypt
import psycopg2, psycopg2.extras
from flask import Blueprint, jsonify, request
from db_helpers import get_db_connection
from flask_cors import CORS  # Import CORS

authentication_blueprint = Blueprint('authentication_blueprint', __name__)

# Enable CORS for this blueprint (allows cross-origin requests)
CORS(authentication_blueprint, origins=["http://localhost:3000"], supports_credentials=True)

# Function to check if the user is a superuser
def is_superuser():
    token = request.headers.get('Authorization')
    if not token:
        return False
    try:
        token = token.split(" ")[1]  # Extract token from "Bearer <token>"
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
        return decoded_token.get("is_superuser", False)
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

# Route for signing up new users, including superuser option
@authentication_blueprint.route('/auth/signup', methods=['POST'])
def signup():
    try:
        new_user_data = request.get_json()
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if the username is already taken
        cursor.execute("SELECT * FROM users WHERE username = %s;", (new_user_data["username"],))
        existing_user = cursor.fetchone()
        if existing_user:
            cursor.close()
            return jsonify({"error": "Username already taken"}), 400

        # Hash the password
        hashed_password = bcrypt.hashpw(bytes(new_user_data["password"], 'utf-8'), bcrypt.gensalt())

        # Determine if the user should be a superuser
        is_superuser = new_user_data.get("is_superuser", False)  # Defaults to False

        # Insert the new user into the database
        cursor.execute(
            "INSERT INTO users (username, password, is_superuser) VALUES (%s, %s, %s) RETURNING id, username, is_superuser;",
            (new_user_data["username"], hashed_password.decode('utf-8'), is_superuser)
        )
        created_user = cursor.fetchone()
        connection.commit()

        # Exclude password from the response
        created_user.pop('password', None)

        # Generate a JWT token for the new user
        token = jwt.encode({
            "id": created_user["id"],
            "username": created_user["username"],
            "is_superuser": created_user["is_superuser"]
        }, os.getenv('JWT_SECRET'))

        return jsonify({"token": token, "user": created_user}), 201

    except Exception as error:
        return jsonify({"error": str(error)}), 401
    finally:
        connection.close()

# Route for signing in existing users
@authentication_blueprint.route('/auth/signin', methods=["POST"])
def signin():
    try:
        sign_in_form_data = request.get_json()
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Fetch user data by username (including the password field)
        cursor.execute("SELECT id, username, password, is_superuser FROM users WHERE username = %s;", 
                       (sign_in_form_data["username"],))
        existing_user = cursor.fetchone()

        if existing_user is None:
            return jsonify({"error": "Invalid credentials."}), 401

        # Verify the provided password
        password_is_valid = bcrypt.checkpw(bytes(sign_in_form_data["password"], 'utf-8'), existing_user["password"].encode('utf-8'))
        if not password_is_valid:
            return jsonify({"error": "Invalid credentials."}), 401

        # Generate a JWT token for the authenticated user
        token = jwt.encode({
            "id": existing_user["id"],
            "username": existing_user["username"],
            "is_superuser": existing_user["is_superuser"]
        }, os.getenv('JWT_SECRET'), algorithm="HS256")

        return jsonify({"token": token, "user": existing_user}), 201

    except Exception as error:
        return jsonify({"error": "An error occurred during login."}), 401
    finally:
        connection.close()

# Route to get the current user info based on the provided token
@authentication_blueprint.route('/auth/me', methods=['GET'])
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        token = token.split(" ")[1]  # Extract token from "Bearer <token>"
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
        user_id = decoded_token["id"]

        # Fetch user details from the database using the user_id
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, username, is_superuser FROM users WHERE id = %s;", (user_id,))
        user = cursor.fetchone()
        connection.close()

        if user:
            return jsonify(user), 200  # Include is_superuser field here
        else:
            return jsonify({"error": "User not found"}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401


# Route to view all users (accessible only for superusers)
@authentication_blueprint.route('/auth/users', methods=['GET'])
def get_all_users():
    if not is_superuser():
        return jsonify({"error": "Unauthorized"}), 403

    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Fetch all users from the database
        cursor.execute("SELECT id, username, is_superuser FROM users;")
        users = cursor.fetchall()
        connection.close()

        # Return the list of users
        return jsonify(users), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500
