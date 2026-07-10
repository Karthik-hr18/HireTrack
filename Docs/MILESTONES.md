# MILESTONES.md — HireTrack 10-Day Build Plan

Ordered per the trial handbook's guidance: deploy a hello-world on day one, schema/types before
feature code, one vertical slice per turn, tests alongside implementation, review every diff.

---

### Day 1 — Foundation
- Initialize repo structure (client/server), TypeScript strict config on both.
- Deploy a hello-world to Vercel + Render immediately — confirms the pipeline works before you're
  depending on it at the finish line.
- Define core Mongoose schemas (User, Job, Application, Interview, Scorecard, ActivityLog) and shared
  TypeScript types.
- Build JWT auth (register/login for Candidate) + RBAC middleware — token delivered via Authorization
  header, stored in memory client-side (no cookies, no localStorage). Seed the initial Admin account.

### Day 2 — Job Management
- Recruiter: create/edit/delete jobs.
- Public careers page: job list (open jobs only) + job detail page.
- Empty/loading/error states for both.

### Day 3 — Candidate Application Flow
- Candidate registration/login, profile.
- Apply flow: job detail → resume upload (Cloudinary, PDF-only, size-capped) → application created
  with required source field, starting stage `Applied`.
- Candidate "track status" view.

### Day 4 — Pipeline Core
- Recruiter pipeline view: candidates grouped by stage.
- Stage transition logic (server-validated against the fixed pipeline).
- Reject flow: predefined reason enum + optional note.
- Activity Timeline writes on every stage change/rejection.

### Day 5 — Search, Notes, Manual Add
- Server-side search/filter (name, job, stage, source), debounced, paginated.
- Recruiter: add candidate manually with required source.
- Notes on candidate profile.
- Candidate profile page assembling resume + notes + timeline (interviews/scorecards added Day 6).

### Day 6 — Interview Scheduling
- Recruiter: schedule interview, assign an Admin.
- Admin: "my assigned interviews" view.
- Interview status handling (scheduled → completed).

### Day 7 — Scorecards + Admin Decisions
- Admin: submit scorecard (recommendation, comments, optional ratings) — permanent once submitted.
- Enforce "no advance past Interview Completed without a scorecard."
- Admin: move to Final Review, then Offer/Hired or Reject (Admin-only action).
- Recruiter: read-only scorecard view.

### Day 8 — Dashboards
- Candidate dashboard: applied jobs, status, upcoming interview, recent activity.
- Recruiter dashboard: open jobs, new applications, candidates by stage, scheduled interviews, pending
  tasks.
- Admin dashboard: open jobs, total candidates, candidates by stage/source, pending interviews,
  hiring activity.
- Admin: Recruiter account management (create/deactivate).

### Day 9 — Polish, States, Accessibility, SEO
- Sweep every screen for the four states (loading/empty/error/success) — no blank flashes, no dead ends.
- Accessibility pass: contrast, keyboard navigation, focus rings, responsive at 320px+.
- Meta tags, OG image, sitemap.xml, robots.txt; Lighthouse pass across all four categories.
- Console fully clean — zero errors/warnings.

### Day 10 — Deployment, Documentation, Submission
- Final production deploy check: fresh incognito run of the full core flow, hard refresh, no leaked
  secrets in the client bundle.
- README (pitch, screenshots, quick start, env table, demo login), CONTRIBUTING.md, CHANGELOG.md,
  LICENSE, tagged v1.0.0 release.
- Record 60–90s Loom demo walking the core flow.
- Write the case study (problem, approach, result, what you learned).
- Message Shreyansh Singh with all links per the handbook's submission process.

---

**Should Have slot:** if Days 1–8 finish on schedule, build Forgot/Reset Password (minimal
transactional email, single-use hashed token) on Day 9 before the polish sweep — it's the one Should
Have item with real infrastructure (an email provider), so it benefits from not being rushed on Day 10.

**Buffer note:** if a day runs over, the first things to cut are Should Have / Nice to Have items
(`FEATURE_LIST.md`) — never cut a Day 9 polish task to protect a Should Have feature. The handbook's
scoring weights UI/UX craft and reliability far above feature count.
