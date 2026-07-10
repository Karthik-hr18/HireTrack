# AGENT_IMPLEMENTATION_PLAN.md — HireTrack

A checkpoint-annotated version of `MILESTONES.md`, written for the agent doing the actual build. Each
day has: the goal, what to build, what to explicitly ask the user before/during that day, and a
definition of done before moving on. The agent should not proceed to the next day until the current
day's definition of done is met and confirmed by the user.

---

### Day 1 — Foundation
**Goal:** A deployed hello-world and a working auth skeleton.
**Build:** Repo init (npm workspaces: `client/`, `server/`, `packages/shared/`), TypeScript strict
config both sides, Mongoose schemas from `DATA_MODEL.md`, shared Zod schemas in `packages/shared/`,
JWT auth (register/login for Candidate), RBAC middleware, seed script for the initial Admin.
**Ask before starting:** `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
**Ask during:** nothing else expected — this day is fully specified by `DATA_MODEL.md` + `API_SPEC.md`
Auth section.
**Definition of done:** hello-world live on Vercel + Render; Candidate can register/login against the
deployed backend; `npm run db:seed` creates the Admin; TypeScript strict passes with zero errors.

### Day 2 — Job Management
**Build:** Recruiter/Admin job CRUD (`POST/PATCH/DELETE /jobs`), public careers page (`GET /jobs`,
`GET /jobs/:id`), soft-delete behavior on `DELETE`.
**Ask during:** nothing credential-related. If job status transitions (open→closed) aren't fully clear
from `PRD.md`, ask rather than assume.
**Definition of done:** Recruiter can create/edit/soft-delete a job; public careers page shows only
`open`, non-deleted jobs; loading/empty/error states present.

### Day 3 — Candidate Application Flow
**Build:** Candidate registration/profile, apply flow with resume upload (`POST /applications`,
server-mediated to Cloudinary per `SYSTEM_DESIGN.md` Section 5), `GET /applications/me`.
**Ask before starting:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
**Definition of done:** Candidate can apply with a PDF resume (rejects non-PDF/oversized files
server-side before hitting Cloudinary); one active application per job enforced; application starts at
`applied` stage with a required `source`.

### Day 4 — Pipeline Core
**Build:** Recruiter pipeline view (`GET /applications`, grouped by stage), `/advance` and `/reject`
action endpoints, ActivityLog writes on every transition.
**Ask during:** if the exact ActivityLog `action`/`metadata` shape feels underspecified for a given
transition, ask for confirmation rather than inventing a shape that won't match later dashboard queries.
**Definition of done:** Recruiter can view candidates grouped by stage, advance a candidate one stage
forward, reject with a predefined reason, and see the resulting timeline entry.

### Day 5 — Search, Notes, Manual Add
**Build:** Server-side search/filter/pagination on `GET /applications`, manual candidate add with
required source, notes (embedded array per `DATA_MODEL.md`), candidate profile page assembling
resume + notes + timeline.
**Definition of done:** search is debounced and server-side (not client-array-filtering); notes append
correctly; candidate profile shows resume preview inline (not a forced download).

### Day 6 — Interview Scheduling
**Build:** `POST /interviews` (Recruiter schedules, assigns an Admin), `GET /interviews/mine` (Admin's
assigned list), auto-transition of Application to `interview_scheduled`.
**Ask during:** confirm the `interviewerId` validation (must resolve to a `role: admin` user) rejects
cleanly with a clear error if a Recruiter is mistakenly selected.
**Definition of done:** Recruiter can schedule an interview only against an Admin; Admin sees it in
their assigned list.

### Day 7 — Scorecards + Admin Decisions
**Build:** `POST /interviews/:id/scorecard` (auto-sets `Interview.status = completed` and advances the
Application to `interview_completed` in the same action), `/mark-hired` (Admin only, from
`final_review`), Recruiter read-only scorecard view.
**Definition of done:** a candidate cannot reach `final_review` without a submitted scorecard; only the
assigned interviewer can submit it; `mark-hired` is unreachable for any role but Admin.

### Day 8 — Dashboards
**Build:** `GET /dashboard/candidate|recruiter|admin` — live aggregation per `SYSTEM_DESIGN.md` Section
8, including the 3-day "needs attention" staleness flag on the Recruiter dashboard. Admin
Recruiter-account management (`POST/PATCH /users`).
**Definition of done:** each dashboard matches its spec in `API_SPEC.md`; staleness flag correctly
excludes terminal-stage applications.

### Day 9 — Polish, States, Accessibility, SEO, (stretch: Forgot Password)
**Build:** sweep every screen for loading/empty/error/success states; accessibility pass (contrast,
keyboard nav, focus rings, 320px+ responsive); meta tags, OG image, `sitemap.xml`, `robots.txt`;
Lighthouse pass. **If ahead of schedule:** build Forgot/Reset Password using Resend.
**Ask before starting the stretch item:** `RESEND_API_KEY`, and confirm there's actually schedule slack
before starting it — per `MILESTONES.md`, Should Have items are the first thing to cut if behind.
**Definition of done:** zero console errors/warnings anywhere in the app; Lighthouse ≥ 90 across all
four categories.

### Day 10 — Deployment, Documentation, Submission
**Build:** final production deploy verification, README (handbook template), CONTRIBUTING/CHANGELOG/
LICENSE, tagged `v1.0.0` release, keep-alive ping setup.
**Ask during:** walk the user through the deployment checklist in the kickoff prompt step by step,
confirming each platform step before moving to the next — do not assume Vercel/Render accounts already
exist.
**Definition of done:** live URL passes a fresh incognito run of the full core flow; no leaked secrets
in the client bundle; demo video recorded; case study written.

---

## Standing Rules (apply every day)

- Never advance to the next day's checklist until the current day's Definition of Done is met and the
  user has confirmed it.
- Any product-level ambiguity (not implementation detail) gets kicked back to the user with the
  relevant section of `PRD.md`/`SYSTEM_DESIGN.md` cited — don't silently resolve it by picking whichever
  interpretation is easiest to build.
- If a day is going to run over, cut Should/Nice-to-Have scope first (`FEATURE_LIST.md`), never cut a
  state-coverage or accessibility item to protect a feature — the handbook's rubric weights those higher.
