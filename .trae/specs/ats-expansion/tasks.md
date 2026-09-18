# ATS Resume Optimizer — Product Expansion Task Plan

Derived from [spec.md](file:///c:/Users/pj391/OneDrive/Desktop/ats-resume-optimizer/.trae/specs/ats-expansion/spec.md).
Coverage: AC-01 … AC-20 (rules + rubrics).

---

## Task 1: Architecture, Routing, Navigation Shell (Sidebar + Mobile Drawer + Bottom Nav)

**Status:** pending
**Priority:** high
**Depends:** none
**Acceptance Criteria mapped:** AC-01, AC-13, AC-14, AC-15, AC-19

### Description

Refactor the app shell so signed-in users have route-based navigation rather than a single Dashboard view. Add hash-free client routing (use a tiny internal `useHashRoute` utility or lightweight state-based router — no new dep).

**Files to touch:**
- `client/src/App.tsx` — add shell layout; import {AppShell} wrapper; branch SignedIn→AppShell; routes table.
- `client/src/AppRoutes.tsx` (new) — route config + RouteView switch.
- `client/src/components/AppShell.tsx` (new) — sidebar, topbar, mobile drawer, bottom nav, AnimatePresence page transitions.
- `client/src/components/Sidebar.tsx` (new) — desktop/collapsible sidebar.
- `client/src/components/MobileNav.tsx` (new) — bottom tab nav for mobile + drawer for overflow.
- `client/src/contexts/AppContext.tsx` (new) — sidebar collapse, density, motion intensity, density class.
- `client/src/index.css` — density CSS variables, bottom nav safe areas.

### Test Requirements (TR)
- **Rule TR-1.1:** Six routes navigable: `/app/dashboard`, `/app/resume/analyzer`, `/app/resume/builder`, `/app/resume/versions`, `/app/matcher`, `/app/history`, `/app/settings`. Back button works. Evidence: manual URL + back-button check.
- **Rule TR-1.2:** Sidebar on lg+, drawer/bottom-nav on ≤md. No horizontal overflow at 360px viewport. Evidence: DevTools device 360×760.
- **Rule TR-1.3:** Sidebar collapse toggle works, state persists in localStorage. Evidence: reload → collapse state preserved.
- **Rubric TR-1.4 (Shell visual quality 0–2, ≥1):** Sizing, icons, active state, typography spacing. 2 = clean crisp shell. Evidence: screenshot.

---

## Task 2: Backend-Extended Service Layer + Mock Isolation + Backend List Endpoints

**Status:** pending
**Priority:** high
**Depends:** none
**Acceptance Criteria mapped:** AC-03, AC-04, AC-09

### Description

Add backend routes to `/api/resumes` and `/api/scans` (Flask) returning Neon rows for current user), then frontend services with mock fallback. Extend `useResumeOptimizer` to optionally hydrate results from a selected scan.

**Files to touch:**
- `server/app/api/routes.py` — add `@login_required GET /resumes` and `/scans` returning user-scoped.
- `client/src/services/api.ts` — `listResumes()`, `listScans()`, `getScanById(id)`; axios; graceful fallback on 404/network err.
- `client/src/services/mock/mockHistoryStore.ts` (new) — clearly-named mock adapter; 5 generated demo rows with timestamps.
- `client/src/services/historyService.ts` (new) — orchestrator: try real API, on fail use mock + exposes `isMock: boolean` flag for banner.
- `client/src/hooks/useResumeOptimizer.ts` — extend to accept optional `scanId` preload, integrate toast events.

### Test Requirements
- **Rule TR-2.1:** If backend endpoints return user's own rows with Neon Resume/Scan. Evidence: curl `/api/resumes` returns array with `file_name`, `created_at`, scan joins.
- **Rule TR-2.2:** Frontend displays "Showing demo data" banner when adapter falls back. No silent fake. Evidence: banner present when server offline.
- **Rule TR-2.3:** Existing upload/analyze/regenerate untouched in hook. Evidence: compare call signatures unchanged.

---

## Task 3: Toast / Notification System

**Status:** pending
**Priority:** high
**Depends:** Task 1 (AppContext optional but can be independent)
**Acceptance Criteria mapped:** AC-11

### Description

Implement a simple, dependency-free toast store with success/info/error variants + top-right stack / mobile bottom-center + auto-dismiss + close button.

**Files to touch:**
- `client/src/contexts/ToastContext.tsx` (new) — reducer-based store + `<ToastViewport/>`.
- `client/src/components/ui/Toast.tsx` (new) — single toast row component + animations.
- `client/src/App.tsx` — mount viewport inside ClerkProvider.
- Hook into existing calls in UploadForm/AnalysisResults/RegeneratedResume/Builder/Settings to actually toasts (6 meaningful events only (per spec).

### Test Requirements
- **Rule TR-3.1:** 6 scenarios fire toasts: upload success, analysis complete, builder saved, PDF downloaded, upload failure, analysis failure — and no toasts for checkbox toggles etc. Evidence: trigger count.
- **Rule TR-3.2:** Error toasts show specific message from error object + retry button where possible. Evidence: trigger error case.
- **Rule TR-3.3:** 4s auto-dismiss + close-button + stack order correct. Evidence: interaction.

---

## Task 4: Dashboard View (`/app/dashboard`)

**Status:** pending
**Priority:** high
**Depends:** Task 1, Task 2, Task 3
**Acceptance Criteria mapped:** AC-04, AC-12, AC-18, AC-19

### Description

Hero score card (animated count-up + solid ring), Recent Analyses list, Score progress mini-chart (no gradients), Quick-actions row.

**Files to touch:**
- `client/src/views/Dashboard.tsx` — rewrite from 2-panel analyzer to Dashboard; move old analyze+results to dedicated Analyzer view.
- `client/src/views/dashboard/*` (Dashboard folders, new) - keep in single file unless over ~ 300 lines keep one file or split.
- `client/src/components/ui/ScoreCard.tsx` (new) — reusable score card + ring.
- `client/src/components/ui/Sparkline.tsx` (new) — minimal sparkline without gradients, solid accent polyline, svg.
- `client/src/components/ui/Skeleton.tsx` (new) — skeletons for dashboard cards + lists.

### Test Requirements
- **Rule TR-4.1:** Hero card shows latest score, with count-up + solid ring, quartile color, "No analyses yet" empty state.
- **Rule TR-4.2:** Recent analyses list ≤ 6 items with name date score; click routes to analyzer.
- **Rule TR-4.3:** Quick actions → navigate.
- **Rule TR-4.4:** Loading skeletons shown while `historyService.loading`.

---

## Task 5: Resume Analyzer View + Split-view + Keyword Analysis (Replaces current Dashboard's two-panel)

**Status:** pending
**Priority:** high
**Depends:** Task 1, Task 2, Task 3
**Acceptance Criteria mapped:** AC-03, AC-05, AC-06, AC-07

### Description

New route `/app/resume/analyzer`. Contains existing upload form, results, regenerate viewer, split view, scan animation, keyword section, sections chips, interactive keyword detail panel, AI caution banner.

**Files to touch:**
- `client/src/views/ResumeAnalyzer.tsx` (new) — layout; import UploadForm + new SplitViewer with LEFT resume preview RIGHT results.
- `client/src/components/SplitViewer.tsx` (new) — LEFT panel + section chips highlight.
- `client/src/components/KeywordPanel.tsx` (new) — interactive keyword section with Matched/Missing interactive chips with click→ side panel counts/context.
- `client/src/utils/keywords.ts` (new) — pure keyword extract utility.
- Update UploadForm.tsx: replace alert with toasts; integrate multi-step analysis progress state; drag/drop kept.
- AnalysisResults.tsx: add weak recommendations integrate KeywordPanel/ScoreCard reuse.
- RegeneratedResume.tsx: toast on download; keep existing.

### Test Requirements
- **Rule TR-5.1:** Upload → multi-step progress shows 4 state chips (Uploading / Parsing / Analyzing / Complete) during request lifecycle.
- **Rule TR-5.2:** Scanning animation horizontal sweep on resume preview while loading.
- **Rule TR-5.3:** Click keyword opens context panel.
- **Rule TR-5.4:** Click recommendation highlights section chip.
- **Rule TR-5.5:** AI caution banner always present when suggestions present.
- **Rule TR-5.6:** Existing flow unchanged — upload → results → select edits → regenerate → download PDF.

---

## Task 6: Job Description Matcher (`/app/matcher`)

**Status:** pending
**Priority:** high
**Depends:** Task 1, Task 2
**Acceptance Criteria mapped:** AC-06

### Description

Standalone matcher: select resume (dropdown resume list) OR upload new, paste JD, run same analyze endpoint, then match breakdown + keywords section.

**Files to touch:**
- `client/src/views/JobMatcher.tsx` (new) — upload OR select resume dropdown, paste JD, submit.
- `client/src/components/MatchBreakdown.tsx` (new — three breakdown cards with animated progress bars solid accent.
- `client/src/utils/breakdown.ts` (new — computeBreakdowns pure utility, documented math + tooltip content.

### Test Requirements
- **Rule TR-6.1:** Can run with both resumes.
- **Rule TR-6.2:** Overall score uses real breakdowns real computation + non-invented. Each breakdown shown in tooltip.

---

## Task 7: Resume Builder (`/app/resume/builder`)

**Status:** pending
**Priority:** medium
**Depends:** Task 1, Task 3
**Acceptance Criteria mapped:** AC-08, AC-12

### Description

Structured sections: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications. Add/edit/delete/reorder. Live preview. Save/Export.

**Files to touch:**
- `client/src/views/ResumeBuilder.tsx` (new) — tab switch tabs /  Builder Layout with left editor/preview
- `client/src/contexts/BuilderContext.tsx` (new — sections state localStorage, reorder functions)
- `client/src/components/builder/*SectionEditor.tsx' (new) - inline edit sections list items with drag handles + section-specific fields.
- `client/src/components/builder/ResumePreview.tsx` (new — render preview layout.
- `client/src/utils/builderExport.ts` (new — exportTXT + exportPDF via jsPDF.

### Test Requirements
- **Rule TR-7.1:** Seven sections add, add/edit/delete/reorder.
- **Rule TR-7.2:** Preview live updates. Save → localStorage populated + toast.
- **Rule TR-7.3:** Export Text/PDF export.
- **Rule TR-7.4:** Preview looks resume-like professional clean resume (tight typography layout.

---

## Task 8: Resume Versions (`/app/resume/versions`)

**Status:** pending
**Priority:** medium
**Depends:** Task 1, Task 2, Task 3
**Acceptance Criteria mapped:** AC-09, AC-12

### Description

List/table versions rows.

**Files to touch:**
- `client/src/views/ResumeVersions.tsx` (new — information-dense.

### Test Requirements
- **Rule TR-8.1:** Rows resume name, date, ATS score, job match n/a badge, open link, mock banner.
- **Rule TR-8.2:** empty state present, skeletons while loading, error retry.

---

## Task 9: Analysis History (`/app/history`)

**Status:** pending
**Priority:** medium
**Depends:** Task 1, Task 2, Task 3
**Acceptance Criteria mapped:** AC-10, AC-12

### Description

Compact table/sortable by date DESC. Score quartile chips.

**Files to touch:**
- `client/src/views/AnalysisHistory.tsx` (new — info-dense.

### Test Requirements
- **Rule TR-9.1:** 5 columns: resume, job analyzed, date, score, result.
- **Rule TR-9.2:** Row click opens analyzer hydrated.

---

## Task 10: Command Palette (Ctrl/Cmd + K)

**Status:** pending
**Priority:** medium
**Depends:** Task 1, Task 7-9 views exist.
**Acceptance Criteria mapped:** AC-02

### Description

Searchable modal, 9 commands, keyboard-nav, open focus trap.

**Files to touch:**
- `client/src/components/CommandPalette.tsx` (new) — modal, search, list, hotkeys.
- `client/src/hooks/useHotkeys.ts` (new — ctrl/cmd+K + Esc hook.
- `client/src/AppShell.tsx — mount palette.

### Test Requirements
- **Rule TR-10.1:** Opens on Ctrl/Cmd+K, closes Esc.
- **Rule TR-10.2:** Exactly 9 commands, each performs real action.
- **Rule TR-10.3:** Searching filters list; ↑/↓/Enter keyboard nav works.

---

## Task 11: Settings (`/app/settings`)

**Status:** pending
**Priority:** medium
**Depends:** Task 1, Task 3
**Acceptance Criteria mapped:** AC-10 (wait mapped

### Description

Account / Appearance / Preferences tabs. Every toggle functional.

**Files to touch:**
- `client/src/views/Settings.tsx` (new) — 3 tabs, functional toggles wired to AppContext.
- Wire appearance: Sidebar position, Motion intensity, Density.
- Wire preferences: Default matcher resume dropdown, Auto-apply edits toggle in useResumeOptimizer hook context read actually.

### Test Requirements
- **Rule TR-11.1:** 3 tabs, all settings functional (sidebar collapse, density class change, motion disabled, default resume stored & matcher.
- **Rule TR-11.2:** Account tab embeds Clerk UserButton + email + sign-out works via Clerk.

---

## Task 12: Motion Polish, Responsive Pass, Accessibility, Gradient/Glassmorphism Audit, Final Build

**Status:** pending
**Priority:** high
**Depends:** all tasks 1-11
**Acceptance Criteria mapped:** AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20

### Description

Full pass: reduced motion media query integration, final scan for gradient/glass keywords, a11y focus rings, 360px mobile sweep, lint+build, small visual polish items.

**Files to touch:** touch all for a11y / motion; add `prefers-reduced-motion` read in AppContext; audit.

### Test Requirements
- **Rule TR-12.1:** `grep` for `linear-gradient|radial-gradient|conic-gradient|backdrop-filter` over `client/src/` = 0 hits (exclude index.css comments? no hits.
- **Rule TR-12.2:** Settings Motion = Reduced OR system reduced motion = no scale/count/stagger animations.
- **Rule TR-12.3:** `npm run build` exit code 0.
- **Rule TR-12.4:** No diagnostics.
- **Rubric TR-12.5 (overall visual hierarchy 0-2 ≥ 1.
- **Rubric TR-12.6 (animation 0–2 ≥1.
- **Rubric TR-12.7 (engineering modularity 0–2 ≥1.
