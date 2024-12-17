from flask import Flask
from dotenv import load_dotenv
from auth_blueprint import authentication_blueprint
from venuemanager_blueprint import venuemanager_blueprint
from shows_blueprint import shows_blueprint
from venues_blueprint import venues_blueprint
from bands_blueprint import bands_blueprint
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)

# Allow only specific origins to access the API
CORS(app, origins=[
    "http://localhost:3000", 
    "https://gideon-rogue-productions.vercel.app",
    "gideon-rogue-productions-4okewasbx-jason-harrels-projects.vercel.app",
    ])

# Register blueprints for various routes
app.register_blueprint(authentication_blueprint)
app.register_blueprint(venuemanager_blueprint)
app.register_blueprint(shows_blueprint)
app.register_blueprint(venues_blueprint)
app.register_blueprint(bands_blueprint)

if __name__ == "__main__":
    # Use the PORT environment variable from Render, or default to 5000
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)