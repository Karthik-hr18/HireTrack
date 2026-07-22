# HireTrack — Post-Release Technical Debt & Architecture Backlog

This document outlines structural refactoring items that were identified during the pre-release engineering review but deferred under the **Release Freeze Principle** to maintain 100% stability and prevent regressions during the launch phase.

---

## Deferred Architectural & Component Refactors

### 1. Component Monolith Splitting — `CandidateDetailPanel.tsx`
- **Current State**: Monolithic component managing state, tab routing, 6 tab panel renders (*Overview*, *Resume*, *Timeline*, *Notes*, *Interviews*, *Scorecards*), inline notes, scorecard submissions, and rejection modal.
- **Proposed Post-Release Refactor**: Extract individual tab views into modular sub-components under `client/src/pages/recruiter/workspace/tabs/`:
  - `OverviewTab.tsx`
  - `ResumeTab.tsx`
  - `TimelineTab.tsx`
  - `NotesTab.tsx`
  - `InterviewsTab.tsx`
  - `ScorecardsTab.tsx`
- **Target Release**: v1.1.0 Maintenance Release

### 2. Stylesheet Modularization — `client/src/index.css`
- **Current State**: Monolithic stylesheet containing design tokens, global resets, recruiter workspace rules, public marketing page rules, and responsive media queries.
- **Proposed Post-Release Refactor**: Split into logical CSS partials:
  - `styles/tokens.css` (Design system CSS variables)
  - `styles/base.css` (Global resets & typography)
  - `styles/public.css` (Careers landing, job details & FAQs)
  - `styles/recruiter.css` (Kanban board, detail panels & modals)
- **Target Release**: v1.1.0 Maintenance Release

### 3. Centralized HTTP Client Interceptor — `apiClient.ts`
- **Current State**: `localStorage.getItem('token')` is accessed directly inside component render cycles and custom hooks.
- **Proposed Post-Release Refactor**: Migrate API requests to a central Axios/Fetch client with request/response interceptors to automatically attach Bearer tokens and handle 401 Unauthorized token expirations.
- **Target Release**: v1.1.0 Maintenance Release

---

*Documented under Pre-Release Engineering Audit — Stabilization Phase.*
