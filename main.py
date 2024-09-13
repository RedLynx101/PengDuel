import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
app.config['DATABASE_URL'] = os.environ.get('DATABASE_URL')

# Ensure debug mode is off in production
app.config['DEBUG'] = False

# Set up CORS
CORS(app)

# Set up rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Set up logging
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/pengduel.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('PengDuel startup')

@app.route("/")
@limiter.limit("10 per minute")
def index():
    return render_template("index.html")

# Health check endpoint
@app.route("/health")
@limiter.exempt
def health_check():
    return jsonify({"status": "healthy"}), 200

# Custom error handlers
@app.errorhandler(404)
def not_found_error(error):
    app.logger.error('Not Found: %s', (error))
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('500.html'), 500

if __name__ == '__main__':
    # This block will only be entered if the script is run directly
    # It won't be used when the app is run with Gunicorn
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
