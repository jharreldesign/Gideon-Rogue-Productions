from flask import Blueprint, jsonify, request, g
from db_helpers import get_db_connection
import psycopg2, psycopg2.extras
from auth_middleware import token_required
from datetime import datetime, date
from flask_cors import CORS

# Define shows_blueprint first
shows_blueprint = Blueprint('shows_blueprint', __name__)

# Enable CORS for this blueprint
CORS(shows_blueprint)

def format_show_dates(show):
    try:
        # Format showdate and showtime
        if isinstance(show['showdate'], (datetime, date)):
            show['showdate'] = show['showdate'].strftime('%Y-%m-%d')
        else:
            show['showdate'] = datetime.strptime(show['showdate'], '%a, %d %b %Y %H:%M:%S GMT').strftime('%Y-%m-%d')
        
        if isinstance(show['showtime'], (datetime, date)):
            show['showtime'] = show['showtime'].strftime('%H:%M:%S')
        else:
            show['showtime'] = datetime.strptime(show['showtime'], '%a, %d %b %Y %H:%M:%S GMT').strftime('%H:%M:%S')
    except Exception as e:
        print(f"Error formatting dates: {e}")
        show['showdate'] = None
        show['showtime'] = None
    return show


# GET route to fetch all shows
@shows_blueprint.route('/shows', methods=['GET'])
def shows_index():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("SELECT * FROM shows ORDER BY showdate, showtime")
        shows = cursor.fetchall()

        if not shows:
            return jsonify({"error": "No shows found"}), 404

        shows = [format_show_dates(show) for show in shows]

        connection.close()
        return jsonify({"shows": shows}), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500

# POST route to create a new show
@shows_blueprint.route('/shows', methods=['POST'])
@token_required
def create_show():
    try:
        new_show = request.json

        # Format showtime if it's a string or set default value if not provided
        if isinstance(new_show['showtime'], str):
            showtime = new_show['showtime']
        else:
            showtime = str(new_show['showtime']) if new_show['showtime'] else '1970-01-01 00:00:00'

        # Connect to the DB and insert the show
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute("""
            INSERT INTO shows (showdate, showdescription, showtime, location, bandsplaying, ticketprice, user_id, tourposter)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            new_show['showdate'], 
            new_show['showdescription'], 
            showtime,  
            new_show['location'], 
            new_show['bandsplaying'],  
            new_show['ticketprice'],
            g.user['id'],
            new_show['tourposter'],
        ))

        created_show = cursor.fetchone()
        connection.commit()
        connection.close()

        created_show = format_show_dates(created_show)

        return jsonify({"show": created_show}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500

# GET route to fetch a single show by its ID
@shows_blueprint.route('/shows/<show_id>', methods=['GET'])
def show_show(show_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT * FROM shows WHERE id = %s
        """, (show_id,))

        show = cursor.fetchone()

        if show:
            show = format_show_dates(show)

        connection.close()

        if show:
            return jsonify({"show": show}), 200
        else:
            return jsonify({"error": "Show not found"}), 404
    except Exception as error:
        return jsonify({"error": str(error)}), 500

# PUT route to update a show
@shows_blueprint.route('/shows/<show_id>', methods=['PUT'])
@token_required  # Ensures only authenticated users can update the show
def update_show(show_id):
    try:
        updated_show = request.json
        
        # Format showtime if it's a string or set default value if not provided
        if isinstance(updated_show['showtime'], str):
            showtime = updated_show['showtime']
        else:
            showtime = str(updated_show['showtime']) if updated_show['showtime'] else '1970-01-01 00:00:00'

        # Connect to the DB and update the show
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cursor.execute("""
            UPDATE shows
            SET showdate = %s, showdescription = %s, showtime = %s, location = %s, bandsplaying = %s, ticketprice = %s, tourposter = %s
            WHERE id = %s AND user_id = %s
            RETURNING *
        """, (
            updated_show['showdate'],
            updated_show['showdescription'],
            showtime,
            updated_show['location'],
            updated_show['bandsplaying'],
            updated_show['ticketprice'],
            updated_show['tourposter'],
            show_id,
            g.user['id']  # Ensuring only the user who created the show can update it
        ))

        updated_show_data = cursor.fetchone()
        connection.commit()
        connection.close()

        if updated_show_data:
            updated_show_data = format_show_dates(updated_show_data)
            return jsonify({"show": updated_show_data}), 200
        else:
            return jsonify({"error": "You are not authorized to update this show."}), 403
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# DELETE route to remove a show
@shows_blueprint.route('/shows/<show_id>', methods=['DELETE'])
@token_required
def delete_show(show_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get the show to be deleted
        cursor.execute("SELECT * FROM shows WHERE id = %s", (show_id,))
        show_to_delete = cursor.fetchone()

        if show_to_delete is None:
            return jsonify({"error": "Show not found"}), 404

        # The authorization check is now removed, anyone logged in can delete the show
        # If you want to track who deleted the show, you could optionally log g.user['id'] here.

        # Delete the show
        cursor.execute("DELETE FROM shows WHERE id = %s", (show_id,))
        connection.commit()

        # Log successful deletion
        print(f"Successfully deleted show with id: {show_id}")
        
        connection.close()
        return jsonify({"message": "Show deleted successfully"}), 200

    except Exception as error:
        print(f"Error deleting show: {error}")
        return jsonify({"error": str(error)}), 500
