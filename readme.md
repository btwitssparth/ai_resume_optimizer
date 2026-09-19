# AI Resume Optimizer
Frontend URL-https://ai-resume-optimizer-one-tau.vercel.app/
Backend URL-https://ai-resume-optimizer-uk7h.onrender.com

An ATS-focused resume analyzer and builder. Upload a PDF resume, paste a job description, and get an ATS match score, the keywords you're missing, and concrete edit suggestions. Accept the edits you like and the app rewrites your resume, using **only facts already in your resume**. There's also a structured resume builder with PDF export.

Built as a full-stack app: **React + TypeScript** frontend, **Flask + PostgreSQL** backend, **Google Gemini** for analysis, and **Clerk** for authentication.

---

## Features

- **Resume analyzer**: upload a PDF plus a job description (with optional job title and company) and get:
  - an overall ATS score from 0 to 100
  - important job-description keywords missing from your resume
  - actionable suggested edits
- **Selective regeneration**: pick which suggested edits to apply and get a rewritten resume. Download the result as a PDF.
- **No fabrication by design**: the AI prompts forbid inventing metrics, employers, dates, skills or education. The analysis response also carries an `is_hallucinated_metric` flag.
- **Resume builder**: fill in a structured resume section by section, preview it, save it to your account, and export it to PDF (`ats-classic` template).
- **Dashboard and history**: track total scans, your average score and recent analyses over time.
- **Authenticated and per-user**: every resume, scan and builder document is scoped to the signed-in user via Clerk.
- **Hardened API**: PDF magic-byte check, 5 MB upload cap, input length limits, CORS allow-list, and consistent JSON error responses.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Framer Motion, Axios, jsPDF, Lucide |
| Backend | Python 3.12, Flask 3, Flask-SQLAlchemy, Flask-CORS, pdfplumber, Pydantic, Gunicorn |
| Database | PostgreSQL (via `psycopg2`); tests use in-memory SQLite |
| AI | Google Gemini via `google-genai` (default model `gemini-2.5-flash`) |
| Auth | Clerk (`@clerk/clerk-react` and `clerk-backend-api`) |
| CI | GitHub Actions (client lint and build, server install and compile check) |

## How it works

```
PDF + job description
        │
        ▼
  pdfplumber extracts text ──► Gemini returns structured JSON
                                (score, missing_keywords, suggested_edits)
        │                                   │
        ▼                                   ▼
  Resume + Scan saved to Postgres     Results shown in the UI
                                            │
                        user selects edits ─┘
                                │
                                ▼
                  Gemini rewrites the resume using only
                  facts already in the original text ──► PDF download
```

## Project structure

```
ai_resume_optimizer/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── components/         # UploadForm, AnalysisResults, RegeneratedResume, ui/*
│       ├── views/              # Dashboard, Analyzer, Builder, History, Settings, Landing, Login
│       ├── services/           # API client (api.ts) and history helpers
│       ├── contexts/           # App and toast context
│       └── hooks/              # useResumeOptimizer
├── server/                     # Flask backend
│   ├── app/
│   │   ├── api/routes.py       # REST endpoints
│   │   ├── services/ai_service.py  # PDF parsing and Gemini calls
│   │   ├── utils/auth.py       # Clerk auth decorator
│   │   ├── models.py           # User, Resume, Scan, BuilderResume
│   │   └── extensions.py
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- Python 3.12+
- A PostgreSQL database (a hosted one such as Neon works fine)
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- A [Clerk](https://clerk.com) application (publishable key and secret key)

### 1. Clone

```bash
git clone https://github.com/btwitssparth/ai_resume_optimizer.git
cd ai_resume_optimizer
```

### 2. Backend

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CORS_ORIGINS=http://localhost:5173
```

Run it:

```bash
python run.py
# API available at http://127.0.0.1:5000
```

Tables are created automatically on startup (`db.create_all()`).

### 3. Frontend

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Run it:

```bash
npm run dev
# App available at http://localhost:5173
```

## Environment variables

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | n/a | SQLAlchemy database URL. The app refuses to start without it. |
| `GEMINI_API_KEY` | Yes | n/a | Google Gemini API key |
| `CLERK_SECRET_KEY` | Yes | n/a | Clerk backend secret used to verify session tokens |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model used for analysis and regeneration |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed origins |
| `MAX_UPLOAD_SIZE` | No | `5242880` (5 MB) | Max request body size in bytes |
| `HOST` / `PORT` | No | `127.0.0.1` / `5000` | Dev server bind address |
| `FLASK_DEBUG` | No | `false` | Set to `true` for debug mode |
| `TRUST_PROXY` | No | `false` | Set to `true` behind a reverse proxy to enable `ProxyFix` |

### Client

| Variable | Required | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `VITE_API_BASE_URL` | Yes (local dev) | Base URL of the Flask API, without a trailing slash |

## API reference

All endpoints are prefixed with `/api`. Everything except `/health` requires an `Authorization: Bearer <Clerk session token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Multipart form: `resume` (PDF), `job_description`, optional `job_title` and `company`. Returns score, missing keywords and suggested edits. |
| `POST` | `/regenerate` | JSON: `resume_id`, `accepted_edits[]` (max 20). Returns the rewritten resume text. |
| `GET` | `/resumes` | List the user's uploaded resumes with their latest scan |
| `GET` | `/scans` | List scans (`?resume_id=` filter, `?limit=` up to 100) |
| `GET` | `/scans/<id>` | Get a single scan |
| `GET` | `/stats` | Dashboard stats (total analyzed, average score) |
| `GET` | `/builder/resumes` | List builder resumes |
| `POST` | `/builder/resumes` | Create a builder resume |
| `GET` | `/builder/resumes/<id>` | Get a builder resume |
| `PUT` | `/builder/resumes/<id>` | Update a builder resume |
| `DELETE` | `/builder/resumes/<id>` | Delete a builder resume |

**Example `/analyze` response**

```json
{
  "resume_id": 12,
  "scan_id": 34,
  "overall_score": 78,
  "missing_keywords": ["Docker", "CI/CD"],
  "suggested_edits": ["Move your projects section above education."],
  "is_hallucinated_metric": false
}
```

**Validation limits:** PDF only (checked by extension and `%PDF-` header), up to 5 MB, job description up to 30,000 characters, job title and company up to 200 characters each, and at least 50 characters of extractable text (scanned or image-only PDFs are rejected).

## Testing

```bash
cd server
pip install pytest
python -m pytest
```

The tests use an in-memory SQLite database, so they never touch your real database.

Frontend checks:

```bash
cd client
npm run lint
npm run build
```

CI runs the same lint and build for the client, and installs dependencies and compiles the server on every push to `main` and on pull requests.

## Deployment notes

The backend ships with gunicorn in its requirements. For production, run gunicorn "app:create_app()" from the server/ directory.

Set CORS_ORIGINS to your deployed frontend origin, and TRUST_PROXY=true if you're behind a proxy or load balancer.

Build the frontend with npm run build and set VITE_API_BASE_URL and VITE_CLERK_PUBLISHABLE_KEY at build time

## Roadmap

- Job description matcher across saved resumes
- Resume versions and side-by-side diff view
- Additional builder templates
- Keyword analysis view

## Author

**Parth**: [@btwitssparth](https://github.com/btwitssparth)

## License

No license has been specified yet. Add a `LICENSE` file (for example MIT) if you want others to be able to reuse the code.
