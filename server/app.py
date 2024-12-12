from flask import Flask
from dotenv import load_dotenv
from auth_blueprint import authentication_blueprint
from venuemanager_blueprint import venuemanager_blueprint
from shows_blueprint import shows_blueprint
from venues_blueprint import venues_blueprint
from bands_blueprint import bands_blueprint
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

# Allow only specific origins to access the API
CORS(app, origins=["http://localhost:3000", "http://yourfrontenddomain.com"])

# Register blueprints for various routes
app.register_blueprint(authentication_blueprint)
app.register_blueprint(venuemanager_blueprint)
app.register_blueprint(shows_blueprint)
app.register_blueprint(venues_blueprint)
app.register_blueprint(bands_blueprint)

app.run()
