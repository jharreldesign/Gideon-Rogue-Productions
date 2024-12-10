from flask import Blueprint, jsonify, request, g
from db_helpers import get_db_connection
import psycopg2, psycopg2.extras
from auth_middleware import token_required

venues_blueprint = Blueprint('venues_blueprint', __name__)

# GET route to fetch all venues
@venues_blueprint.route('/venues', methods=['GET'])
def venues_index():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("SELECT * FROM venues ORDER BY venuename")
        venues = cursor.fetchall()

        connection.close()
        return jsonify({"venues": venues}), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


# POST route to create a new venue
@venues_blueprint.route('/venues', methods=['POST'])
@token_required  
def create_venue():
    try:
        new_venue = request.json

        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute("""
            INSERT INTO venues (capacity, venuename, location, venuemanager)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            new_venue['capacity'], 
            new_venue['venuename'], 
            new_venue['location'], 
            new_venue['venuemanager']
        ))

        created_venue = cursor.fetchone()
        connection.commit()
        connection.close()

        return jsonify({"venue": created_venue}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# GET route to fetch a single venue by its ID
@venues_blueprint.route('/venues/<venue_id>', methods=['GET'])
def venue_show(venue_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT * FROM venues WHERE id = %s
        """, (venue_id,))

        venue = cursor.fetchone()

        connection.close()

        if venue:
            return jsonify({"venue": venue}), 200
        else:
            return jsonify({"error": "Venue not found"}), 404
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# PUT route to update a venue
@venues_blueprint.route('/venues/<venue_id>', methods=['PUT'])
@token_required
def update_venue(venue_id):
    try:
        updated_venue_data = request.json
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute("SELECT * FROM venues WHERE id = %s", (venue_id,))
        venue_to_update = cursor.fetchone()

        if venue_to_update is None:
            return jsonify({"error": "Venue not found"}), 404

        if venue_to_update["user_id"] != g.user["id"]:
            return jsonify({"error": "Unauthorized"}), 401

        cursor.execute("""
            UPDATE venues 
            SET capacity = %s, venuename = %s, location = %s, venuemanager = %s
            WHERE id = %s
            RETURNING *
        """, (
            updated_venue_data.get('capacity', venue_to_update['capacity']),
            updated_venue_data.get('venuename', venue_to_update['venuename']),
            updated_venue_data.get('location', venue_to_update['location']),
            updated_venue_data.get('venuemanager', venue_to_update['venuemanager']),
            venue_id
        ))

        updated_venue = cursor.fetchone()
        connection.commit()
        connection.close()

        return jsonify({"venue": updated_venue}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# DELETE route to delete a venue
@venues_blueprint.route('/venues/<venue_id>', methods=['DELETE'])
@token_required
def delete_venue(venue_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM venues WHERE id = %s", (venue_id,))
        venue_to_delete = cursor.fetchone()
        if venue_to_delete is None:
            return jsonify({"error": "Venue not found"}), 404

        if venue_to_delete["user_id"] != g.user["id"]:
            return jsonify({"error": "Unauthorized"}), 401

        cursor.execute("DELETE FROM venues WHERE id = %s", (venue_id,))
        connection.commit()
        connection.close()

        return jsonify({"message": "Venue deleted successfully"}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500
