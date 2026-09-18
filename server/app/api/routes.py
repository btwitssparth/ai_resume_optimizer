import json
import os
from flask import jsonify, request
from sqlalchemy import func
from . import api_bp
from ..extensions import db
from ..models import BuilderResume, Resume, Scan
from ..services.ai_service import analyze_resume_with_gemini, extract_text_from_pdf, regenerate_resume_with_gemini
from ..utils.auth import login_required

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_JOB_DESCRIPTION_LENGTH = 30_000
MAX_EDIT_LENGTH = 2_000
ALLOWED_EXTENSIONS = {".pdf"}

def _error(message, status=400):
    return jsonify({"error": message}), status

def _validate_pdf(file):
    filename = (file.filename or "").strip()
    if not filename:
        return "A PDF resume is required."
    if os.path.splitext(filename.lower())[1] not in ALLOWED_EXTENSIONS:
        return "Only PDF resumes are supported."
    return None

@api_bp.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@api_bp.post("/analyze")
@login_required
def analyze():
    file = request.files.get("resume")
    if file is None:
        return _error("No resume file provided.")
    error = _validate_pdf(file)
    if error:
        return _error(error)
    job_description = (request.form.get("job_description") or "").strip()
    job_title = (request.form.get("job_title") or "Target Role").strip()
    company = (request.form.get("company") or "").strip()
    if not job_description:
        return _error("Job description is required.")
    if len(job_description) > MAX_JOB_DESCRIPTION_LENGTH:
        return _error("Job description is too long.")
    if len(job_title) > 200 or len(company) > 200:
        return _error("Job title or company is too long.")
    file.stream.seek(0)
    if file.stream.read(5) != b"%PDF-":
        return _error("The uploaded file is not a valid PDF.")
    file.stream.seek(0)
    try:
        file.stream.seek(0, os.SEEK_END)
        if file.stream.tell() > MAX_FILE_SIZE:
            return _error("Resume exceeds the 5MB upload limit.")
        file.stream.seek(0)
        parsed_text = extract_text_from_pdf(file.stream)
        if len(parsed_text.strip()) < 50:
            return _error("Could not extract enough text from the PDF. Please upload a text-based resume.")
        ai_result = analyze_resume_with_gemini(parsed_text, job_description)
        resume = Resume(user_id=request.current_user.id, file_name=(file.filename or "resume.pdf")[:255], parsed_text=parsed_text)
        db.session.add(resume)
        db.session.flush()
        scan = Scan(resume_id=resume.id, job_title=job_title, company=company, job_description=job_description,
                    overall_score=max(0, min(100, ai_result.overall_score)),
                    missing_keywords=json.dumps(ai_result.missing_keywords),
                    suggested_edits=json.dumps(ai_result.suggested_edits))
        db.session.add(scan)
        db.session.commit()
        return jsonify({"resume_id": resume.id, "scan_id": scan.id, "overall_score": scan.overall_score,
                        "missing_keywords": ai_result.missing_keywords, "suggested_edits": ai_result.suggested_edits,
                        "is_hallucinated_metric": ai_result.is_hallucinated_metric}), 200
    except ValueError:
        db.session.rollback()
        return _error("The PDF could not be parsed.", 422)
    except Exception:
        db.session.rollback()
        return _error("Resume analysis failed. Please try again.", 502)

@api_bp.post("/regenerate")
@login_required
def regenerate():
    payload = request.get_json(silent=True) or {}
    resume_id = payload.get("resume_id")
    accepted_edits = payload.get("accepted_edits")
    if not isinstance(resume_id, int) or not isinstance(accepted_edits, list):
        return _error("resume_id and accepted_edits are required.")
    if len(accepted_edits) > 20:
        return _error("Too many edits selected.")
    if not all(isinstance(edit, str) and 0 < len(edit.strip()) <= MAX_EDIT_LENGTH for edit in accepted_edits):
        return _error("Invalid edit selection.")
    if not accepted_edits:
        return _error("Select at least one edit.")
    resume = Resume.query.filter_by(id=resume_id, user_id=request.current_user.id).first()
    if resume is None:
        return _error("Resume not found.", 404)
    try:
        updated_text = regenerate_resume_with_gemini(resume.parsed_text, [e.strip() for e in accepted_edits])
        return jsonify({"message": "Resume regenerated successfully.", "updated_resume_text": updated_text}), 200
    except Exception:
        return _error("Resume regeneration failed. Please try again.", 502)

@api_bp.get("/resumes")
@login_required
def list_resumes():
    resumes = Resume.query.filter_by(user_id=request.current_user.id).order_by(Resume.created_at.desc()).all()
    return jsonify([resume.to_dict() for resume in resumes]), 200

@api_bp.get("/scans")
@login_required
def list_scans():
    query = Scan.query.join(Resume).filter(Resume.user_id == request.current_user.id).order_by(Scan.created_at.desc())
    resume_id = request.args.get("resume_id", type=int)
    if resume_id is not None:
        query = query.filter(Scan.resume_id == resume_id)
    limit = min(max(request.args.get("limit", 50, type=int) or 50, 1), 100)
    return jsonify([scan.to_dict() for scan in query.limit(limit).all()]), 200

@api_bp.get("/scans/<int:scan_id>")
@login_required
def get_scan(scan_id):
    scan = Scan.query.join(Resume).filter(Scan.id == scan_id, Resume.user_id == request.current_user.id).first()
    if scan is None:
        return _error("Scan not found.", 404)
    return jsonify(scan.to_dict()), 200

@api_bp.get("/stats")
@login_required
def stats():
    base = db.session.query(Scan).join(Resume).filter(Resume.user_id == request.current_user.id)
    total = base.with_entities(func.count(Scan.id)).scalar() or 0
    average = base.with_entities(func.avg(Scan.overall_score)).scalar()
    return jsonify({"totalAnalyzed": total, "averageScore": round(float(average)) if average is not None else 0, "interviewsLanded": 0}), 200


@api_bp.post("/builder/resumes")
@login_required
def create_builder_resume():
    payload = request.get_json(silent=True) or {}
    data = payload.get("data")
    if not isinstance(data, dict):
        return _error("Resume data must be an object.")
    name = str(payload.get("name") or "Untitled Resume").strip()[:255] or "Untitled Resume"
    template = str(payload.get("template") or "ats-classic").strip()[:50] or "ats-classic"
    try:
        resume = BuilderResume(user_id=request.current_user.id, name=name, template=template,
                               data=json.dumps(data, ensure_ascii=False))
        db.session.add(resume)
        db.session.commit()
        return jsonify(resume.to_dict()), 201
    except Exception:
        db.session.rollback()
        return _error("Could not save resume. Please try again.", 500)

@api_bp.put("/builder/resumes/<int:resume_id>")
@login_required
def update_builder_resume(resume_id):
    resume = BuilderResume.query.filter_by(id=resume_id, user_id=request.current_user.id).first()
    if resume is None:
        return _error("Resume not found.", 404)
    payload = request.get_json(silent=True) or {}
    data = payload.get("data")
    if not isinstance(data, dict):
        return _error("Resume data must be an object.")
    try:
        resume.name = str(payload.get("name") or resume.name).strip()[:255] or resume.name
        resume.template = str(payload.get("template") or resume.template).strip()[:50] or resume.template
        resume.data = json.dumps(data, ensure_ascii=False)
        db.session.commit()
        return jsonify(resume.to_dict()), 200
    except Exception:
        db.session.rollback()
        return _error("Could not update resume. Please try again.", 500)

@api_bp.get("/builder/resumes")
@login_required
def list_builder_resumes():
    resumes = BuilderResume.query.filter_by(user_id=request.current_user.id).order_by(BuilderResume.updated_at.desc()).all()
    return jsonify([resume.to_dict() for resume in resumes]), 200

@api_bp.get("/builder/resumes/<int:resume_id>")
@login_required
def get_builder_resume(resume_id):
    resume = BuilderResume.query.filter_by(id=resume_id, user_id=request.current_user.id).first()
    if resume is None:
        return _error("Resume not found.", 404)
    return jsonify(resume.to_dict()), 200

@api_bp.delete("/builder/resumes/<int:resume_id>")
@login_required
def delete_builder_resume(resume_id):
    resume = BuilderResume.query.filter_by(id=resume_id, user_id=request.current_user.id).first()
    if resume is None:
        return _error("Resume not found.", 404)
    try:
        db.session.delete(resume)
        db.session.commit()
        return jsonify({"message": "Resume deleted successfully."}), 200
    except Exception:
        db.session.rollback()
        return _error("Could not delete resume. Please try again.", 500)
