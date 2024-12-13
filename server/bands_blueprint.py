from flask import Blueprint, jsonify, request, g
from db_helpers import get_db_connection
import psycopg2, psycopg2.extras
from auth_middleware import token_required

bands_blueprint = Blueprint('bands_blueprint', __name__)

# GET route to fetch all bands
@bands_blueprint.route('/bands', methods=['GET'])
def bands_index():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("SELECT * FROM bands ORDER BY bandname")
        bands = cursor.fetchall()

        connection.close()
        return jsonify({"bands": bands}), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


# POST route to create a new band
@bands_blueprint.route('/bands', methods=['POST'])
@token_required  # Ensure token is validated
def create_band():
    try:
        new_band = request.json

        # Include 'banddescription' in the INSERT statement
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute("""
            INSERT INTO bands (bandname, hometown, genre, yearstarted, membernames, bandphoto, banddescription)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            new_band['bandname'], 
            new_band['hometown'], 
            new_band['genre'], 
            new_band['yearstarted'], 
            new_band['membernames'],
            new_band['bandphoto'],  
            new_band['banddescription']  # Add the description to the insert query
        ))

        created_band = cursor.fetchone()
        connection.commit()
        connection.close()

        return jsonify({"band": created_band}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500



# GET route to fetch a single band by its ID
@bands_blueprint.route('/bands/<band_id>', methods=['GET'])
def band_show(band_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT * FROM bands WHERE id = %s
        """, (band_id,))

        band = cursor.fetchone()

        connection.close()

        if band:
            return jsonify({"band": band}), 200
        else:
            return jsonify({"error": "Band not found"}), 404
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# PUT route to update a band
@bands_blueprint.route('/bands/<band_id>', methods=['PUT'])
@token_required
def update_band(band_id):
    try:
        updated_band_data = request.json  # Get the data from the request body
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Check if the band exists
        cursor.execute("SELECT * FROM bands WHERE id = %s", (band_id,))
        band_to_update = cursor.fetchone()

        if band_to_update is None:
            return jsonify({"error": "Band not found"}), 404

        # Check if the current user has the 'admin' role
        if g.user["role"] != "admin":
            return jsonify({"error": "Unauthorized: Admin role required"}), 401

        # Ensure that the updated fields are properly handled, using .get() to retain existing values if not provided
        cursor.execute("""
            UPDATE bands 
            SET bandname = %s, hometown = %s, genre = %s, yearstarted = %s, 
                membernames = %s, bandphoto = %s, banddescription = %s  -- Include banddescription in the update
            WHERE id = %s
            RETURNING *
        """, (
            updated_band_data.get('bandname', band_to_update['bandname']),
            updated_band_data.get('hometown', band_to_update['hometown']),
            updated_band_data.get('genre', band_to_update['genre']),
            updated_band_data.get('yearstarted', band_to_update['yearstarted']),
            updated_band_data.get('membernames', band_to_update['membernames']),
            updated_band_data.get('bandphoto', band_to_update['bandphoto']),
            updated_band_data.get('banddescription', band_to_update['banddescription']),  # Update description
            band_id
        ))

        # Fetch the updated band details and commit the changes
        updated_band = cursor.fetchone()
        connection.commit()
        connection.close()

        return jsonify({"band": updated_band}), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500




# DELETE route to delete a band
@bands_blueprint.route('/bands/<band_id>', methods=['DELETE'])
@token_required
def delete_band(band_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM bands WHERE id = %s", (band_id,))
        band_to_delete = cursor.fetchone()
        if band_to_delete is None:
            return jsonify({"error": "Band not found"}), 404

        # Check if the user is an admin or if they are the owner of the band
        if g.user['role'] != 'admin' and band_to_delete["user_id"] != g.user["id"]:
            return jsonify({"error": "Unauthorized"}), 401

        cursor.execute("DELETE FROM bands WHERE id = %s", (band_id,))
        connection.commit()
        connection.close()

        return jsonify({"message": "Band deleted successfully"}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500
