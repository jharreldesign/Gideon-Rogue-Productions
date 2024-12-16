import os
import jwt
import bcrypt
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
from db_helpers import get_db_connection
from flask_cors import CORS

authentication_blueprint = Blueprint('authentication_blueprint', __name__)

# Enable CORS for this blueprint
CORS(authentication_blueprint, origins=["http://localhost:3000"], supports_credentials=True)

# --- Helper Function to Fetch User by Username ---
def get_user_by_username(cursor, username):
    """Fetch a user from the database by username."""
    cursor.execute("SELECT id, username, password, role FROM users WHERE username = %s;", (username,))
    return cursor.fetchone()

# --- Route: Signup ---
@authentication_blueprint.route('/auth/signup', methods=['POST'])
def signup():
    try:
        new_user_data = request.get_json()
        
        # Validate input data
        if not new_user_data or not new_user_data.get("username") or not new_user_data.get("password"):
            return jsonify({"error": "Missing username or password"}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if username is taken
        existing_user = get_user_by_username(cursor, new_user_data["username"])
        if existing_user:
            return jsonify({"error": "Username already taken"}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(new_user_data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Assign role (default to 'staff' if not provided or invalid)
        role = new_user_data.get("role", "staff")
        if role not in ["admin", "staff"]:
            role = "staff"
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (username, password, role)
            VALUES (%s, %s, %s)
            RETURNING id, username, role;
        """, (new_user_data["username"], hashed_password, role))
        
        created_user = cursor.fetchone()
        connection.commit()
        
        # Exclude password from response
        created_user.pop('password', None)
        
        # Generate JWT token
        token = jwt.encode({
            "id": created_user["id"],
            "username": created_user["username"],
            "role": created_user["role"]
        }, os.getenv('JWT_SECRET'), algorithm="HS256")
        
        return jsonify({"token": token, "user": created_user}), 201

    except Exception as error:
        print(f"Signup Error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if 'connection' in locals():
            connection.close()

# --- Route: Signin ---
@authentication_blueprint.route('/auth/signin', methods=['POST'])
def signin():
    try:
        sign_in_form_data = request.get_json()
        
        # Validate input data
        if not sign_in_form_data or not sign_in_form_data.get("username") or not sign_in_form_data.get("password"):
            return jsonify({"error": "Missing username or password"}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Fetch user by username
        existing_user = get_user_by_username(cursor, sign_in_form_data["username"])
        if not existing_user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Verify password
        password_is_valid = bcrypt.checkpw(
            sign_in_form_data["password"].encode('utf-8'), 
            existing_user["password"].encode('utf-8')
        )
        if not password_is_valid:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Generate JWT token
        token = jwt.encode({
            "id": existing_user["id"],
            "username": existing_user["username"],
            "role": existing_user["role"]
        }, os.getenv('JWT_SECRET'), algorithm="HS256")
        
        # Exclude password from response
        existing_user.pop("password", None)
        
        return jsonify({"token": token, "user": existing_user}), 200

    except Exception as error:
        print(f"Signin Error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if 'connection' in locals():
            connection.close()

# --- Route: Get Current User ---
@authentication_blueprint.route('/auth/me', methods=['GET'])
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Fetch user by ID
        cursor.execute("SELECT id, username, role FROM users WHERE id = %s;", (decoded_token["id"],))
        user = cursor.fetchone()
        connection.close()
        
        if user:
            return jsonify(user), 200
        return jsonify({"error": "User not found"}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as error:
        print(f"Get Current User Error: {error}")
        return jsonify({"error": "Internal server error"}), 500

# --- Route: Get All Users (Admin Only) ---
@authentication_blueprint.route('/auth/users', methods=['GET'])
def get_all_users():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Decode and validate the JWT token
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])

        # Check if the user is an admin
        if decoded_token.get("role") != "admin":
            return jsonify({"error": "Access denied. Admins only."}), 403

        # Fetch all users from the database
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, username, role FROM users;")
        users = cursor.fetchall()
        connection.close()

        return jsonify(users), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as error:
        print(f"Get All Users Error: {error}")
        return jsonify({"error": "Internal server error"}), 500


# #----- TESTING CODE ----------#
# import os
# import jwt
# import bcrypt
# import psycopg2, psycopg2.extras
# from flask import Blueprint, jsonify, request
# from db_helpers import get_db_connection
# from flask_cors import CORS  # Import CORS

# authentication_blueprint = Blueprint('authentication_blueprint', __name__)

# # Enable CORS for this blueprint (allows cross-origin requests)
# CORS(authentication_blueprint, origins=["http://localhost:3000"], supports_credentials=True)

# # Route for signing up new users, including superuser option
# @authentication_blueprint.route('/auth/signup', methods=['POST'])
# def signup():
#     try:
#         # Receive the new user data
#         new_user_data = request.get_json()

#         # Ensure data is received correctly
#         if not new_user_data or not new_user_data.get("username") or not new_user_data.get("password"):
#             return jsonify({"error": "Missing username or password"}), 400

#         # Connect to the database
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         # Check if the username already exists
#         cursor.execute("SELECT * FROM users WHERE username = %s;", (new_user_data["username"],))
#         existing_user = cursor.fetchone()
#         if existing_user:
#             cursor.close()
#             return jsonify({"error": "Username already taken"}), 400

#         # Hash the password
#         hashed_password = bcrypt.hashpw(bytes(new_user_data["password"], 'utf-8'), bcrypt.gensalt())

#         # Prepare the user data for insertion
#         username = new_user_data["username"]
#         password = hashed_password.decode('utf-8')
#         role = new_user_data.get("role", "staff")  # Default to 'staff' if role is not provided

#         # Insert the new user into the database
#         cursor.execute(
#             """
#             INSERT INTO users (username, password, role)
#             VALUES (%s, %s, %s)
#             RETURNING id, username, role;
#             """,
#             (username, password, role)
#         )
#         created_user = cursor.fetchone()
#         connection.commit()

#         # Exclude password from the response
#         created_user.pop('password', None)

#         # Generate a JWT token for the new user
#         token = jwt.encode({
#             "id": created_user["id"],
#             "username": created_user["username"],
#             "role": created_user["role"]
#         }, os.getenv('JWT_SECRET'))

#         return jsonify({"token": token, "user": created_user}), 201

#     except Exception as error:
#         print(f"Error during signup: {str(error)}")  # Debugging line
#         return jsonify({"error": str(error)}), 500  # Return 500 for general server errors
#     finally:
#         if 'connection' in locals():
#             connection.close()



# # Route for signing in existing users
# @authentication_blueprint.route('/auth/signin', methods=["POST"])
# def signin():
#     try:
#         sign_in_form_data = request.get_json()
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         # Fetch user data by username (including the password field)
#         cursor.execute("SELECT id, username, password, role FROM users WHERE username = %s;", 
#                        (sign_in_form_data["username"],))
#         existing_user = cursor.fetchone()

#         if existing_user is None:
#             return jsonify({"error": "Invalid credentials."}), 401

#         # Verify the provided password
#         password_is_valid = bcrypt.checkpw(bytes(sign_in_form_data["password"], 'utf-8'), existing_user["password"].encode('utf-8'))
#         if not password_is_valid:
#             return jsonify({"error": "Invalid credentials."}), 401

#         # Generate a JWT token for the authenticated user
#         token = jwt.encode({
#             "id": existing_user["id"],
#             "username": existing_user["username"],
#             "role": existing_user["role"]
#         }, os.getenv('JWT_SECRET'), algorithm="HS256")

#         return jsonify({"token": token, "user": existing_user}), 201

#     except Exception as error:
#         return jsonify({"error": "An error occurred during login."}), 401
#     finally:
#         connection.close()

# # Route to get the current user info based on the provided token
# @authentication_blueprint.route('/auth/me', methods=['GET'])
# def get_current_user():
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         token = token.split(" ")[1]
#         decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         cursor.execute("SELECT * FROM users WHERE id = %s;", (decoded_token["id"],))
#         user = cursor.fetchone()
#         connection.close()

#         if user:
#             user.pop("password", None)  # Exclude the password field
#             return jsonify(user), 200
#         else:
#             return jsonify({"error": "User not found"}), 404

#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Token has expired"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid token"}), 401
#     except Exception as e:
#         return jsonify({"error": str(e)}), 401


# # NEW CODE SECTION: Route to fetch all users (admin-only)
# @authentication_blueprint.route('/auth/users', methods=['GET'])
# def get_all_users():
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         token = token.split(" ")[1]
#         decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])

#         # Check if the user is an admin
#         if decoded_token["role"] != "admin":
#             return jsonify({"error": "Forbidden"}), 403

#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         cursor.execute("SELECT id, username, role FROM users;")
#         users = cursor.fetchall()

#         connection.close()
#         return jsonify(users), 200

#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Token has expired"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid token"}), 401
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500






#-------- WORKING CODE ---------#
# import os
# import jwt
# import bcrypt
# import psycopg2, psycopg2.extras
# from flask import Blueprint, jsonify, request
# from db_helpers import get_db_connection
# from flask_cors import CORS  # Import CORS

# authentication_blueprint = Blueprint('authentication_blueprint', __name__)

# # Enable CORS for this blueprint (allows cross-origin requests)
# CORS(authentication_blueprint, origins=["http://localhost:3000"], supports_credentials=True)

# # Route for signing up new users, including superuser option
# @authentication_blueprint.route('/auth/signup', methods=['POST'])
# def signup():
#     try:
#         new_user_data = request.get_json()
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         # Check if the username is already taken
#         cursor.execute("SELECT * FROM users WHERE username = %s;", (new_user_data["username"],))
#         existing_user = cursor.fetchone()
#         if existing_user:
#             cursor.close()
#             return jsonify({"error": "Username already taken"}), 400

#         # Hash the password
#         hashed_password = bcrypt.hashpw(bytes(new_user_data["password"], 'utf-8'), bcrypt.gensalt())

#         # Insert the new user into the database
#         cursor.execute(
#             "INSERT INTO users (username, password, role) VALUES (%s, %s, %s) RETURNING id, username, role;",
#             (new_user_data["username"], hashed_password.decode('utf-8'), new_user_data["role"])  # 'role' can be 'admin' or 'staff'
#         )
#         created_user = cursor.fetchone()
#         connection.commit()

#         # Exclude password from the response
#         created_user.pop('password', None)

#         # Generate a JWT token for the new user
#         token = jwt.encode({
#             "id": created_user["id"],
#             "username": created_user["username"],
#             "role": created_user["role"]
#         }, os.getenv('JWT_SECRET'))

#         return jsonify({"token": token, "user": created_user}), 201

#     except Exception as error:
#         return jsonify({"error": str(error)}), 401
#     finally:
#         connection.close()

# # Route for signing in existing users
# @authentication_blueprint.route('/auth/signin', methods=["POST"])
# def signin():
#     try:
#         sign_in_form_data = request.get_json()
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         # Fetch user data by username (including the password field)
#         cursor.execute("SELECT id, username, password, role FROM users WHERE username = %s;", 
#                        (sign_in_form_data["username"],))
#         existing_user = cursor.fetchone()

#         if existing_user is None:
#             return jsonify({"error": "Invalid credentials."}), 401

#         # Verify the provided password
#         password_is_valid = bcrypt.checkpw(bytes(sign_in_form_data["password"], 'utf-8'), existing_user["password"].encode('utf-8'))
#         if not password_is_valid:
#             return jsonify({"error": "Invalid credentials."}), 401

#         # Generate a JWT token for the authenticated user
#         token = jwt.encode({
#             "id": existing_user["id"],
#             "username": existing_user["username"],
#             "role": existing_user["role"]
#         }, os.getenv('JWT_SECRET'), algorithm="HS256")

#         return jsonify({"token": token, "user": existing_user}), 201

#     except Exception as error:
#         return jsonify({"error": "An error occurred during login."}), 401
#     finally:
#         connection.close()

# # Route to get the current user info based on the provided token
# @authentication_blueprint.route('/auth/me', methods=['GET'])
# def get_current_user():
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         token = token.split(" ")[1]
#         decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
#         connection = get_db_connection()
#         cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#         cursor.execute("SELECT * FROM users WHERE id = %s;", (decoded_token["id"],))
#         user = cursor.fetchone()
#         connection.close()

#         if user:
#             user.pop("password", None)  # Exclude the password field
#             return jsonify(user), 200
#         else:
#             return jsonify({"error": "User not found"}), 404

#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Token has expired"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid token"}), 401
#     except Exception as e:
#         return jsonify({"error": str(e)}), 401
