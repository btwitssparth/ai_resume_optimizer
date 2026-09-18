from datetime import datetime, timezone
import json
from .extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.String(100), primary_key=True)
    email = db.Column(db.String(320), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    resumes = db.relationship("Resume", backref="user", lazy="select", cascade="all, delete-orphan")
    builder_resumes = db.relationship("BuilderResume", backref="user", lazy="select", cascade="all, delete-orphan")

class Resume(db.Model):
    __tablename__ = "resume"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)
    parsed_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    scans = db.relationship("Scan", backref="resume", lazy="select", cascade="all, delete-orphan")

    def to_dict(self):
        latest_scan = Scan.query.filter_by(resume_id=self.id).order_by(Scan.created_at.desc()).first()
        return {"id": self.id, "file_name": self.file_name, "created_at": self.created_at.isoformat(),
                "latest_scan": latest_scan.to_dict() if latest_scan else None}

class Scan(db.Model):
    __tablename__ = "scan"
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resume.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title = db.Column(db.String(200), nullable=False, default="Target Role")
    company = db.Column(db.String(200), nullable=False, default="")
    job_description = db.Column(db.Text, nullable=False)
    overall_score = db.Column(db.Integer, nullable=False)
    missing_keywords = db.Column(db.Text, nullable=False, default="[]")
    suggested_edits = db.Column(db.Text, nullable=False, default="[]")
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    def to_dict(self):
        return {"id": self.id, "resume_id": self.resume_id, "job_title": self.job_title, "company": self.company,
                "overall_score": self.overall_score, "missing_keywords": _json_list(self.missing_keywords),
                "suggested_edits": _json_list(self.suggested_edits), "created_at": self.created_at.isoformat()}

def _json_list(value):
    if not value:
        return []
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (TypeError, json.JSONDecodeError):
        return []


class BuilderResume(db.Model):
    __tablename__ = "builder_resume"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False, default="Untitled Resume")
    template = db.Column(db.String(50), nullable=False, default="ats-classic")
    data = db.Column(db.Text, nullable=False, default="{}")
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    def to_dict(self):
        try:
            payload = json.loads(self.data)
        except (TypeError, json.JSONDecodeError):
            payload = {}
        return {"id": self.id, "name": self.name, "template": self.template, "data": payload,
                "created_at": self.created_at.isoformat(), "updated_at": self.updated_at.isoformat()}
