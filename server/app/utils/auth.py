import os
import logging
from functools import wraps
from flask import jsonify, request
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from ..extensions import db
from ..models import User

_clerk_sdk = None
logger = logging.getLogger(__name__)

def get_clerk_sdk():
    global _clerk_sdk
    if _clerk_sdk is None:
        secret_key = os.getenv("CLERK_SECRET_KEY")
        if not secret_key:
            raise RuntimeError("CLERK_SECRET_KEY is not configured")
        _clerk_sdk = Clerk(bearer_auth=secret_key)
    return _clerk_sdk

def login_required(view):
    @wraps(view)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() != "bearer" or not token.strip():
            return jsonify({"error": "Authentication required"}), 401
        try:
            state = get_clerk_sdk().authenticate_request(request, AuthenticateRequestOptions())
            if not state.is_signed_in:
                return jsonify({"error": "Authentication failed"}), 401
            payload = state.payload or {}
            clerk_id = payload.get("sub")
            email = payload.get("email") or payload.get("email_address")
            if not clerk_id:
                return jsonify({"error": "Invalid authentication payload"}), 401
            if not email:
                email = f"{clerk_id}@users.invalid"
            user = db.session.get(User, clerk_id)
            if user is None:
                user = User(id=clerk_id, email=email)
                db.session.add(user)
                db.session.commit()
            elif user.email != email and not email.endswith("@users.invalid"):
                user.email = email
                db.session.commit()
            request.current_user = user
            return view(*args, **kwargs)
        except Exception as exc:
            db.session.rollback()
            logger.exception("Authentication failed for %s %s", request.method, request.path)
            return jsonify({"error": "Authentication service unavailable"}), 503
    return decorated_function
