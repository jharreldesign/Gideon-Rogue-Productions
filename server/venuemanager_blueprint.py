from flask import Blueprint, jsonify, request, g
from db_helpers import get_db_connection
import psycopg2, psycopg2.extras
from auth_middleware import token_required

venuemanager_blueprint = Blueprint('venuemanager_blueprint', __name__)

@venuemanager_blueprint.route('/', methods=['GET'])
def venuemanager_index():
    return jsonify({"message": "Hello there"})

