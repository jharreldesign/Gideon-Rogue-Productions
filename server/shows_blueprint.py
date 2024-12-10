from flask import Blueprint, jsonify, request, g
from db_helpers import get_db_connection
import psycopg2, psycopg2.extras
from auth_middleware import token_required
from datetime import datetime, date

shows_blueprint = Blueprint('shows_blueprint', __name__)

def format_show_dates(show):
    # Format showdate
    if isinstance(show['showdate'], (datetime, date)):
        show['showdate'] = show['showdate'].strftime('%Y-%m-%d')
    else:
        show['showdate'] = datetime.strptime(show['showdate'], '%a, %d %b %Y %H:%M:%S GMT').strftime('%Y-%m-%d')
    
    # Format showtime
    if isinstance(show['showtime'], (datetime, date)):
        show['showtime'] = show['showtime'].strftime('%H:%M:%S')
    else:
        show['showtime'] = datetime.strptime(show['showtime'], '%a, %d %b %Y %H:%M:%S GMT').strftime('%H:%M:%S')
    
    return show

# GET route to fetch all shows
@shows_blueprint.route('/shows', methods=['GET'])
def shows_index():
    try:
        # Establish a connection to the database
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Execute a query to get all shows, ordered by showdate and showtime
        cursor.execute("SELECT * FROM shows ORDER BY showdate, showtime")
        shows = cursor.fetchall()

        # Format the dates and times
        shows = [format_show_dates(show) for show in shows]

        # Close the connection and return the shows as a JSON response
        connection.close()
        return jsonify({"shows": shows}), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 500


# POST route to create a new show
@shows_blueprint.route('/shows', methods=['POST'])
@token_required
def create_show():
    try:
        # Get the data from the request
        new_show = request.json

        # Ensure showtime is in the correct format if provided
        if isinstance(new_show['showtime'], str):
            # If it's a string, it should already be in the 'YYYY-MM-DD HH:MM:SS' format
            showtime = new_show['showtime']
        else:
            # If not, convert it into a proper string (e.g., 'YYYY-MM-DD HH:MM:SS')
            showtime = str(new_show['showtime']) if new_show['showtime'] else '1970-01-01 00:00:00'  # Fallback if empty

        # Connect to the DB and insert the show
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute("""
            INSERT INTO shows (showdate, showdescription, showtime, location, bandsplaying, ticketprice, user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            new_show['showdate'], 
            new_show['showdescription'], 
            showtime,  # Use the formatted showtime
            new_show['location'], 
            new_show['bandsplaying'],  # List of bands can be serialized as JSON
            new_show['ticketprice'],
            g.user['id']  # Add user_id from token
        ))

        created_show = cursor.fetchone()
        connection.commit()
        connection.close()

        # Format the dates and times for the created show
        created_show = format_show_dates(created_show)

        return jsonify({"show": created_show}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# GET route to fetch a single show by its ID
@shows_blueprint.route('/shows/<show_id>', methods=['GET'])
def show_show(show_id):
    try:
        # Establish a connection to the database
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Execute a query to get the specific show by ID
        cursor.execute("""
            SELECT * FROM shows WHERE id = %s
        """, (show_id,))

        show = cursor.fetchone()

        # Format the dates and times if the show is found
        if show:
            show = format_show_dates(show)

        # Close the connection
        connection.close()

        if show:
            return jsonify({"show": show}), 200
        else:
            return jsonify({"error": "Show not found"}), 404
    except Exception as error:
        return jsonify({"error": str(error)}), 500

# PUT route to update a show
@shows_blueprint.route('/shows/<show_id>', methods=['PUT'])
@token_required
def update_show(show_id):
    try:
        updated_show_data = request.json
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("SELECT * FROM shows WHERE id = %s", (show_id,))
        show_to_update = cursor.fetchone()

        if show_to_update is None:
            return jsonify({"error": "Show not found"}), 404

        # Check if the user is authorized to update the show
        if show_to_update["user_id"] != g.user["id"]:
            return jsonify({"error": "Unauthorized"}), 401

        # Ensure that showtime is in the correct format
        showdate = updated_show_data.get('showdate', show_to_update['showdate'])
        showtime = updated_show_data.get('showtime', show_to_update['showtime'])

        if isinstance(showtime, str) and len(showtime) == 8:  # Time format 'HH:MM:SS'
            # If it's only a time string, combine it with showdate to make a full timestamp
            showtime = f"{showdate} {showtime}"

        cursor.execute("""
            UPDATE shows 
            SET showdate = %s, showdescription = %s, showtime = %s, location = %s, bandsplaying = %s, ticketprice = %s
            WHERE id = %s
            RETURNING *
        """, (
            showdate,
            updated_show_data.get('showdescription', show_to_update['showdescription']),
            showtime,  # Use the combined full timestamp
            updated_show_data.get('location', show_to_update['location']),
            updated_show_data.get('bandsplaying', show_to_update['bandsplaying']),
            updated_show_data.get('ticketprice', show_to_update['ticketprice']),
            show_id
        ))

        updated_show = cursor.fetchone()
        connection.commit()
        connection.close()

        # Format the dates and times for the updated show
        updated_show = format_show_dates(updated_show)

        return jsonify({"show": updated_show}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@shows_blueprint.route('/shows/<show_id>', methods=['DELETE'])
@token_required
def delete_show(show_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM shows WHERE shows.id = %s", (show_id,))
        show_to_delete = cursor.fetchone()
        if show_to_delete is None:
            return jsonify({"error": "Show not found"}), 404

        connection.commit()

        # Check if the user is authorized to delete the show
        if show_to_delete["user_id"] != g.user["id"]:
            return jsonify({"error": "Unauthorized"}), 401

        cursor.execute("DELETE FROM shows WHERE shows.id = %s", (show_id,))
        connection.commit()
        connection.close()

        return jsonify({"message": "Show deleted successfully"}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500
