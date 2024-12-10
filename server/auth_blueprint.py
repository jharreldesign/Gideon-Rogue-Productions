import os
import jwt
import bcrypt
import psycopg2, psycopg2.extras
from flask import Blueprint, jsonify, request
from db_helpers import get_db_connection
from flask_cors import CORS  # Import CORS

authentication_blueprint = Blueprint('authentication_blueprint', __name__)

# Enable CORS for the entire app or blueprint
CORS(authentication_blueprint)  # This allows cross-origin requests for this blueprint

# Function to check if the user is a superuser
def is_superuser():
    token = request.headers.get('Authorization')
    if not token:
        return False
    try:
        # Decode the token to check the user's superuser status
        token = token.split(" ")[1]  # Extract the token from "Bearer <token>"
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
        return decoded_token.get("is_superuser", False)
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

# Route for signing up new users, including the ability to designate a superuser
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



# Route for creating shows (only accessible by superusers)
@authentication_blueprint.route('/shows', methods=['POST'])
def create_show():
    if not is_superuser():  # Check if the user is a superuser
        return jsonify({"error": "Sorry you can not create this show. Please speak with your manager if you have any questions."}), 403

    try:
        show_data = request.get_json()
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Insert the show into the database
        cursor.execute("INSERT INTO shows (showdate, showdescription) VALUES (%s, %s) RETURNING id, showdate, showdescription;",
                       (show_data["showdate"], show_data["showdescription"]))
        created_show = cursor.fetchone()
        connection.commit()

        return jsonify({"show": created_show}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 400
    finally:
        connection.close()


# Route for creating venues (only accessible by superusers)
@authentication_blueprint.route('/venues', methods=['POST'])
def create_venue():
    if not is_superuser():  # Check if the user is a superuser
        return jsonify({"error": "Sorry you can not create this show. Please speak with your manager if you have any questions."}), 403

    try:
        venue_data = request.get_json()
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Insert the venue into the database, including all columns (id, capacity, venuename, location, venuemanager)
        cursor.execute(
            "INSERT INTO venues (capacity, venuename, location, venuemanager) "
            "VALUES (%s, %s, %s, %s) "
            "RETURNING id, capacity, venuename, location, venuemanager;",
            (venue_data["capacity"], venue_data["venuename"], venue_data["location"], venue_data["venuemanager"])
        )
        created_venue = cursor.fetchone()
        connection.commit()

        return jsonify({"venue": created_venue}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 400
    finally:
        connection.close()
