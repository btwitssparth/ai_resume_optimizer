import os
from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from .extensions import db

def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_SIZE", str(5 * 1024 * 1024)))
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if x.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}})
    if os.getenv("TRUST_PROXY", "").lower() == "true":
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    db.init_app(app)
    # Import models before create_all so every model is registered in SQLAlchemy metadata.
    from .models import User, Resume, Scan, BuilderResume
    with app.app_context():
        db.create_all()
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")
    @app.errorhandler(413)
    def request_too_large(_error):
        return {"error": "Uploaded file is too large."}, 413
    @app.errorhandler(500)
    def internal_error(_error):
        db.session.rollback()
        return {"error": "Internal server error."}, 500
    return app
