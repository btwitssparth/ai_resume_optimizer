from flask import Blueprint

# Create the blueprint
api_bp = Blueprint('api', __name__)

# Import routes AFTER creating the blueprint to avoid circular imports
from . import routes