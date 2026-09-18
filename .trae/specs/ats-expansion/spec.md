# ATS Resume Optimizer — Product Expansion Specification

## Problem

The current ATS Resume Optimizer is a single-screen tool: signed-out users see a landing page, signed-in users see a two-panel (Upload + Result) dashboard. There is no way to revisit previous analyses, view resume versions, browse keyword details, build a resume via a structured editor, navigate between views, use keyboard shortcuts, or manage appearance/account settings. Users lack a sense of progress or career productivity and the UX cannot scale to a larger feature set.

## Users

- Signed-in job seekers using ATS Optimizer Pro to improve their resume against real job descriptions.
- Signed-out visitors who land on the marketing page and need to be routed to Clerk sign-in.

## Goals

1. Expand the existing analyzer into a cohesive, navigable career productivity app while preserving existing flows and backend contracts.
2. Introduce 10+ new modules (Dashboard, Resume Analyzer, Job Matcher, Keyword Analysis, Resume Viewer split-view, Resume Builder, Resume Versions, Analysis History, Command Palette, Settings, Toasts).
3. Use real Neon/Flask data wherever available (Resumes, Scans, scores, keywords, edits) and isolate mock data in a clearly-flagged layer for dashboard aggregations, history listing, and versioning until backend endpoints ship.
4. Build a premium dark-first UI matching the existing `#0a0a0b` / `#141416` / `#5b8def` system: no gradients, no glassmorphism, solid colors only.
5. Add polished, purposeful motion while respecting `prefers-reduced-motion`.

## Non-Goals

- No backend rewrite; only additive backend endpoints (list Resumes/Scans) if feasible.
- No new authentication provider; keep Clerk only.
- No fake user achievements / decorative empty stats / purple AI SaaS aesthetics.
- No light theme toggle until Settings actually persists a preference.
- No PDF upload in Resume Builder (build/edit only via structured sections).
- No payment / pricing / multi-user organization features.

---

## Functional Requirements

### FR-01 Application Shell & Routing

- Signed-out renders [LandingPage](file:///c:/Users/pj391/OneDrive/Desktop/ats-resume-optimizer/client/src/views/LandingPage.tsx).
- Signed-in renders a persistent **sidebar** + header shell with client-side route-based views.
- Route table:
  - `/app/dashboard` — Dashboard (default after sign-in)
  - `/app/resume/analyzer` — Resume Analyzer (existing analyze flow)
  - `/app/resume/builder` — Resume Builder
  - `/app/resume/versions` — Resume Versions
  - `/app/matcher` — Job Description Matcher
  - `/app/history` — Analysis History
  - `/app/settings` — Settings
- Mobile shell: collapsible bottom-tab primary navigation + slide-in drawer for deep links.
- All route transitions use AnimatePresence page fade/slide (≤ 400ms).
- Back button and deep links work for every view.

### FR-02 Sidebar + Navigation

- Desktop sidebar with icon + label entries for: Dashboard, Resume (group with Analyzer / Builder / Versions sub-links), Job Matcher, History, Settings.
- Hover micro-interaction, active-state solid accent bar on left edge.
- Sidebar collapse state persisted (localStorage).
- Mobile: bottom navigation bar with 5 primary tabs (Dashboard, Analyzer, Matcher, History, More). "More" opens drawer with Builder, Versions, Settings.

### FR-03 Dashboard (`/app/dashboard`)

- Hero card showing **Current ATS Score** (pull latest real `scans.overall_score` via list endpoint; falls back to clearly-labeled mock adapter).
- Animated number count-up + solid circular progress ring.
- **Recent Analyses** list (≤ 6 items): resume file name, date, ATS score, accent chip color by score quartile. Click opens `/app/resume/analyzer?id=scanId` (or rehydrates latest result state).
- **Resume Improvement History** sparkline-style chart area using the last N real scan scores (or mock series) — no gradients.
- **Quick Actions**: Upload Resume, Open Resume Builder, New Job Match.
- If no scans exist: polished empty-state prompting user to run first analysis with a CTA to Analyzer.
- Data layer: service method `historyService.listScans()` swaps between real `/api/scans` and a `mockHistoryStore` adapter (clearly documented).

### FR-04 Resume Analyzer (`/app/resume/analyzer`)

- Reuses existing UploadForm + AnalysisResults + RegeneratedResume components but inside its own route.
- **Split viewer**: LEFT resume preview (raw extracted text inside a framed PDF-like card with section markers) / RIGHT results column when a result exists.
- Upload progress: visual multi-stage indicator (Uploading → Parsing → Analyzing → Complete) mapped to request lifecycle.
- Scanning animation during analysis: horizontal scan-line sweep on resume preview panel.
- ATS score with count-up + solid circular ring (reuses `AnimatedScore` + `ScoreRing`).
- **Weaknesses section**: missing keywords + severity hints (derived from returned list ordering).
- **Recommendations**: suggested_edits with selectability preserved.
- Regeneration & PDF download flow preserved exactly as-is.

### FR-05 Job Description Matcher (`/app/matcher`)

- Inputs: (a) select a previously uploaded resume (from list endpoint) OR upload new one, (b) paste job description.
- Result view:
  - **Overall Match** = returned `overall_score` (count-up + ring).
  - **Breakdown**:
    - **Keyword Match**: derived from `(total_desc_keywords - missing_keywords.length) / total_desc_keywords` using a local keyword extractor (basic regex/stopwords).
    - **Skills Match**: same math but filtered to skills lexicon heuristics.
    - **Experience Match**: falls back to `overall_score` unless backend adds it (shown as "Overall Alignment").
  - Each breakdown metric gets a compact animated progress bar (solid accent color).
  - Do **not** invent metrics — every breakdown must have a clear computation + caveat tooltip.

### FR-06 Keyword Analysis (integrated into Analyzer/Matcher)

- Two sections: **Matched Keywords** and **Missing Keywords**.
- Keywords come from the analysis payload. "Matched" is derived by extracting tokens from resume text that appear in the job description and are NOT in missing_keywords. Computation happens client-side in a pure utility; shown with a caveat label "Inferred from resume text".
- Keyword chips are interactive (clickable):
  - Click a matched keyword → sidebar panel shows: keyword, count in resume, count in job description, 1-sentence note (generic — no AI hallucination).
  - Click a missing keyword → panel shows: keyword, occurrence count in job description, and reminder to verify context.
- Keywords reveal sequentially (stagger 40ms).

### FR-07 Resume Viewer Split-view (Analyzer)

- LEFT: Resume preview with "Experience / Education / Skills / Summary" section chips derived from basic heading parsing.
- RIGHT: Recommendations list.
- Selecting a recommendation highlights the most likely section chip on the left (heuristic match by keyword presence; show "Potential section" badge).
- Show a **caution banner**: "AI suggestions may be inaccurate — verify every statement, metric, and technology before finalizing your resume."

### FR-08 Resume Builder (`/app/resume/builder`)

- Structured sections: Personal Information, Summary, Experience, Education, Skills, Projects, Certifications.
- Each section supports: add item, edit inline, delete, reorder (handle + keyboard reorder).
- Live preview panel right-side (desktop) or "Preview" tab (mobile).
- Preview mimics a real professional resume: tight typography, clear section dividers, monospace for dates, accent-free.
- Editor state stored in localStorage; explicit **Save** button triggers toast "Changes saved locally"; explicit **Export Text** downloads a plain `.txt`; **Export PDF** uses jsPDF to render the structured sections.
- Empty state prompts user to add a section with iconographic CTAs.

### FR-09 Resume Versions (`/app/resume/versions`)

- Table/list showing: Resume name (from backend `resumes.file_name` when available), Date (backend `created_at`), Associated ATS Score (linked scan score), Job Match label (if scan exists — "N/A" otherwise).
- "Open" action per row → routes to Analyzer with that resume context pre-selected (fallback: shows resume raw_text preview).
- If backend list endpoint is not wired, fallback adapter uses `mockVersionStore` with a `DEMO` badge per row and banner "Connected to local demo data — backend /api/resumes coming soon".
- Empty state: "You haven't saved any resume versions yet." + CTA to Analyzer + Builder.

### FR-10 Analysis History (`/app/history`)

- Compact, information-dense table: Resume, Job Analyzed (truncated hash/snippet of job description not available — label "—" if absent), Date, ATS Score, Result (chip: "Weak Match" / "Fair Match" / "Strong Match").
- Click row opens the Analyzer rehydrated with that scan (result state + resume text).
- Pagination/skeleton loading state + error retry banner.

### FR-11 Command Palette

- Opens on `Ctrl+K` (Windows/Linux) and `Cmd+K` (macOS). Esc closes.
- Overlay dims background, centered searchable modal, keyboard-navigable list (↑/↓/Enter).
- Commands (only for views/actions that exist):
  - `Open Dashboard` → `/app/dashboard`
  - `Upload Resume` → `/app/resume/analyzer` + focus upload input
  - `Analyze Resume` → `/app/resume/analyzer`
  - `Open Resume Builder` → `/app/resume/builder`
  - `Open Resume Versions` → `/app/resume/versions`
  - `New Job Match` → `/app/matcher`
  - `Open History` → `/app/history`
  - `Open Settings` → `/app/settings`
  - `Toggle Sidebar` → collapse/expand
- Animated scale-in, search highlight.

### FR-12 Settings (`/app/settings`)

Tabs: Account · Appearance · Preferences.

- **Account**: Clerk UserButton embedded, email from Clerk `useUser()`, sign-out link.
- **Appearance**:
  - Sidebar position (Left / Collapsed) — functional, persists to localStorage.
  - Motion intensity (Full / Reduced) — when set to Reduced, globally forces `transition: { duration: 0 }` via a context. Actually works.
  - Density (Comfortable / Compact) — toggles a class on the root that changes spacing scale. Functional.
- **Preferences**:
  - Default Job Matcher resume (dropdown populated from `historyService.listResumes()`; persists in localStorage; functional).
  - Auto-apply edits on regeneration (boolean checkbox; actually changes the `acceptedEdits` pre-selection behavior in hook; functional).
- All settings have real behavior — no fake toggles.

### FR-13 Notifications / Toasts

- Central `ToastStore` (context + reducer, no external lib) with `success`, `info`, `error` variants.
- Fired for:
  - `Resume uploaded successfully` (after analyze request resolves — actual event)
  - `Analysis complete` (after result set)
  - `Changes saved` (Builder save, Settings save)
  - `PDF downloaded` (after jsPDF save)
  - Errors: `Upload failed`, `Analysis failed`, with actionable hint (retry or check file).
- Toast styles: solid surface, subtle border, 4s auto-dismiss, manual close button, top-right stack (mobile: bottom center).
- No spamming — no toast on every checkbox toggle.

### FR-14 Empty / Loading / Error States

- **Loading**: skeleton cards matching page layout (Dashboard cards, History table rows, Builder section rows).
- **Progress**: analyze shows multi-step chip trail + percentage on upload.
- **Error**: structured panel with title, specific error text (from caught axios message + http status if available), primary "Retry" button and secondary "Go to Dashboard".
- Every major route has its own empty state with guidance + CTA, not a generic message.

---

## Non-Functional Requirements

### NFR-01 Visual System

- Strictly **zero gradients** anywhere (backgrounds, text, borders, glows, progress indicators).
- No glassmorphism, no translucent blur panels. Solid surfaces: `#0a0a0b`, `#101013`, `#141416`, borders `#1f1f26` / `#23232a`.
- Single accent: `#5b8def` (hover `#4f7df6`). Semantic: success `#4ade80`, warn `#fbbf24`, error `#f87171`. Used sparingly.
- Typography: Inter + JetBrains Mono only. Consistent scale.
- 4/8 px spacing rhythm, border-radius 8/12/16/24 only.

### NFR-02 Motion

- Framer Motion, 150–500ms durations, cubic-bezier easing.
- Page transitions, staggered card entrance, score count-up, analysis progress, keyword reveal, modal/command palette scale-in, tab slide, sidebar expand/collapse, button hover/press micro-interactions, list stagger.
- Every motion-using component respects a global `motionEnabled` from Settings context.
- `prefers-reduced-motion` media query auto-disables motion unless user explicitly overrides.

### NFR-03 Data Isolation

- All API calls in `src/services/api.ts` (existing pattern). Add: `listResumes()`, `listScans()` — they attempt real `/api/resumes`, `/api/scans`; on 404 or "endpoint missing" the service falls back to **explicitly named** mock adapters in `src/services/mock/*`.
- A visible banner appears in the affected views when mock data is active: "Showing local demo data — backend endpoint not connected." No silent fakes.

### NFR-04 Responsive

- Breakpoints: `sm: ≥ 640`, `md: ≥ 768`, `lg: ≥ 1024`, `xl: ≥ 1280`.
- Builder & Analyzer split views collapse to stacked tabs on ≤ lg.
- Sidebar collapses into drawer on ≤ md.
- All primary actions ≥ 44px touch target on mobile.
- Resume text zoomed to ≥ 13px body in mobile viewers.

### NFR-05 Accessibility

- Focus outlines (accent ring) on every interactive element.
- Keyboard-only navigation through sidebar, tabs, dialogs, and command palette.
- ARIA labels for icon-only controls.
- Color-contrast: body text ≥ WCAG AA on surfaces; score ring never the only status indicator (also label + quartile chip).

### NFR-06 Performance

- No route-sized bundle re-renders; React.memo on pure list items.
- Skeletons + Suspense-free rendering (React 19 allowed).
- Animations limited to `opacity` + `transform` only; never animate layout properties.
- Build succeeds with `tsc -b && vite build`. ESLint warnings allowed only for pre-existing `no-explicit-any` at two known locations.

---

## Constraints & Dependencies

- **Clerk** is the only auth provider.
- **Framer Motion**, **Lucide React**, **jsPDF**, **axios** are already installed — no new runtime deps.
- Backend is Flask/Neon with existing `Resume`/`Scan` models; can add minimal list endpoints if needed but frontend must degrade gracefully without them.
- Preserve existing `/api/analyze` and `/api/regenerate` contracts and the `useResumeOptimizer` hook behavior exactly, while extending hook surface with scan-list hydration.

## Assumptions

- Users reach `/app/*` only after sign-in; Clerk guards prevent unauthenticated access.
- Backend Neon DB may be empty for new users; history views degrade to empty states (not errors).
- Keyword "matched vs missing" computation without a true NLP backend is inferential and labeled as such in the UI.

## Open Questions

None for the user at this stage. Data-fallback behavior is explicitly defined (visible mock banner).

---

## Acceptance Criteria

### Rule AC-01
Signed-in app shell exposes sidebar with Dashboard/Resume(Analyzer/Builder/Versions)/Job Matcher/History/Settings; client-side routing correctly navigates all six routes without page reload. Evidence: manual navigation check + DevTools network no document reload.

### Rule AC-02
Command Palette opens on both `Ctrl+K` and `Cmd+K`, lists exactly 9 authorized commands, each navigates or triggers the described real action, closes on `Esc`. Evidence: keyboard smoke test + no-ops command not present.

### Rule AC-03
All existing analyzer flows preserved: PDF upload → analyze request → ATS score, missing_keywords, suggested_edits → select edits → regenerate → PDF download. Evidence: trace through `useResumeOptimizer` unchanged behavior plus UI smoke test.

### Rule AC-04
Dashboard view renders (1) latest ATS score with animation, (2) recent analyses list, (3) improvement progress, (4) quick actions. If backend list endpoints are unreachable, a clearly visible "Showing demo data" banner displays. Evidence: screenshot + banner presence when `/api/scans` is not hit.

### Rule AC-05
Resume Analyzer split-view shows LEFT resume preview, RIGHT results. Selection of recommendation highlights a section chip. Caution banner about AI accuracy always visible when suggestions present. Evidence: manual interaction + DOM check.

### Rule AC-06
Job Description Matcher displays Overall Match plus at most three breakdown cards (Keyword Match, Skills Match, Experience Match / Overall Alignment). Each breakdown's computation shown in tooltip — no invented metrics. Evidence: code review of `computeBreakdowns()` + UI tooltip.

### Rule AC-07
Keyword Analysis sections exist in Analyzer/Matcher results. Clicking a keyword opens a side panel with counts/context. No invented match data. Evidence: manual test + source review of keyword extract utility.

### Rule AC-08
Resume Builder has 7 sections, supports add/edit/delete/reorder of items, live preview matches professional resume layout, save/download buttons actually persist/export. Evidence: localStorage key populated after Save + exported files match structure.

### Rule AC-09
Resume Versions + Analysis History render information-dense tables with real fields (name, date, score, job/resume) and actionable "Open" links. Fallback to clearly-badged demo data when backend list endpoint missing. Evidence: data layer review + banner presence check.

### Rule AC-10
Settings has three tabs. Each toggle/setting actually changes behavior (sidebar collapse, motion intensity, density, default resume, auto-apply edits). No inert toggles. Evidence: toggle each + observe real UI change.

### Rule AC-11
Toast system fires on the 6 specified meaningful events only; errors show specific text + recovery action. Evidence: event review + error case smoke test.

### Rule AC-12
Every major route/state has Empty + Loading + Error states. Loading uses skeleton shapes matching content. Evidence: walkthrough each of 6 routes + simulate loading/error.

### Rule AC-13
Zero gradients anywhere in CSS/inlined styles (grep for `gradient`, `conic`, `linear-gradient`, `radial-gradient` returns 0 hits in src files). Evidence: `grep` scan.

### Rule AC-14
No glassmorphism: no `backdrop-filter: blur`, no alpha surfaces with blur, no `glow` shadow gradients. Evidence: `grep` for `backdrop-filter` + visual inspection.

### Rule AC-15
Full responsive layouts: ≥lg desktop split views, ≥md sidebar, <md drawer/bottom nav. No horizontal overflow at 360px. Evidence: DevTools device emulation.

### Rule AC-16
Animations honor prefers-reduced-motion and Settings Motion intensity toggle: when either is Reduced, no count-up/stagger/scale motion beyond instant transitions. Evidence: DevTools emulate reduced motion + Settings toggle.

### Rule AC-17
`npm run build` exits 0; VS Code diagnostics clean. Evidence: command output.

### Rubric AC-18 (Quality: Visual Hierarchy 0–2, threshold ≥ 1)
- 2: Strong typographic hierarchy, accent used only for primary actions + scores, spacing rhythm consistent, information density appropriate per view.
- 1: Acceptable hierarchy but a few mis-scaled headers or noisy accents.
- 0: Looks generic / noisy / decorative rather than precise. Evidence: screenshot review.

### Rubric AC-19 (Quality: Animation 0–2, threshold ≥ 1)
- 2: Purposeful, 150–500ms, cubic-bezier, reduced-motion honored; entrance/press/nav transitions feel premium.
- 1: Transitions present but occasional unnecessary spring or long duration.
- 0: No motion or excessive bouncy/flashy motion. Evidence: interaction walkthrough.

### Rubric AC-20 (Quality: Engineering 0–2, threshold ≥ 1)
- 2: Components modular, service layer isolated, routes/views/components/hooks/services separation clean, shared UI primitives, no monolith files.
- 1: Works but some duplication or borderline large components.
- 0: Unmaintainable monolith components and tight coupling. Evidence: codebase structure review.
