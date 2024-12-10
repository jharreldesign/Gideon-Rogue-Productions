from flask import Flask
from dotenv import load_dotenv
from auth_blueprint import authentication_blueprint
from venuemanager_blueprint import venuemanager_blueprint
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
app.register_blueprint(authentication_blueprint)
app.register_blueprint(venuemanager_blueprint)
app.run()
