from functools import wraps
from flask import request, jsonify, g
import jwt
import os

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Retrieve the Authorization header
        authorization_header = request.headers.get('Authorization')
        if authorization_header is None:
            return jsonify({"error": "Unauthorized - No token provided"}), 401
        
        try:
            # Extract token from the header (bearer token format)
            token = authorization_header.split(' ')[1]
            
            # Decode the token and verify its validity
            token_data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
            
            # Store decoded token data in g.user for later access in route handlers
            g.user = token_data
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Unauthorized - Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized - Invalid token"}), 401
        except Exception as error:
            # For other exceptions, return a general error message
            return jsonify({"error": f"Unauthorized - {str(error)}"}), 401
        
        # Continue to the route handler
        return f(*args, **kwargs)
    
    return decorated_function
