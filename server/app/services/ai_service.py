import os
from typing import List
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

class ATSResponse(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    missing_keywords: List[str] = Field(default_factory=list)
    suggested_edits: List[str] = Field(default_factory=list)
    is_hallucinated_metric: bool = False

def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

def extract_text_from_pdf(file_stream) -> str:
    import pdfplumber
    text_parts = []
    with pdfplumber.open(file_stream) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text.strip())
    return "\n\n".join(text_parts).strip()

def analyze_resume_with_gemini(resume_text: str, job_description: str) -> ATSResponse:
    client = _get_client()
    prompt = f"""You are an expert technical recruiter and ATS analysis system.
Analyze the candidate resume against the target job description.
Rules:
- Only recommend skills, facts, metrics, and experiences supported by the resume.
- Never invent experience, education, certifications, employers, dates, or metrics.
- Missing keywords must be important job-description terms absent from the resume.
- Suggested edits must be actionable and must not fabricate achievements.
- Return only the requested structured response.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}
"""
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=ATSResponse),
    )
    if not response.text:
        raise RuntimeError("AI service returned an empty response")
    return ATSResponse.model_validate_json(response.text)

def regenerate_resume_with_gemini(original_text: str, accepted_edits: list[str]) -> str:
    client = _get_client()
    edits = "\n".join(f"- {edit}" for edit in accepted_edits)
    prompt = f"""Rewrite the candidate resume using ONLY information already present in the original resume.
Accepted improvement instructions:
{edits}
Strict rules:
- Never invent metrics, technologies, employers, education, dates, responsibilities, or achievements.
- If an instruction requires a new fact, improve wording without adding that fact.
- Preserve chronology and factual claims.
- Return only the complete resume text.

ORIGINAL RESUME:
{original_text}
"""
    response = client.models.generate_content(model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"), contents=prompt)
    text = (response.text or "").strip()
    if not text:
        raise RuntimeError("AI service returned an empty response")
    return text
