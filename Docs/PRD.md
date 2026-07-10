# PRD.md — HireTrack

**Applicant Tracking System for growing companies** · Internship Trial Submission
**Stack:** MERN (MongoDB, Express, React, Node.js), TypeScript strict · **Timeline:** 10 days

---

## 1. Vision

> HireTrack replaces the spreadsheet-and-inbox chaos small hiring teams use to track candidates with
> one clean pipeline — so a growing company can hire like a company with a real ATS, without
> enterprise complexity.

## 2. Product Category

A single-company Applicant Tracking System. Not a job marketplace (not LinkedIn/Naukri/Internshala).
Purchased/deployed by one company to manage its own hiring pipeline, regardless of where an
application originates (Careers Page, LinkedIn, Naukri, Referral, Campus, or Recruiter-added).

## 3. Target Audience

Companies with **50–250 employees** with a small but real hiring team — at minimum one Recruiter and
one Admin. Narrowed from an initial 10–250 range during discovery because the locked 3-role permission
model (Candidate / Recruiter / Admin) assumes a team hiring process, which doesn't fit solo-founder-scale
companies.

## 4. Personas

### Priya Nair — Recruiter (primary persona)
29, Talent Acquisition Specialist at a 120-person fintech startup. Sole recruiter for 4–6 open roles at
once. Currently runs everything through Gmail threads and a shared spreadsheet — loses track of
candidate status, forgets follow-ups, and gets pinged by hiring managers asking for updates she can't
give quickly. Needs speed and low-friction status updates above all else; has zero patience for slow
or cluttered UI.

### Rohan Mehta — Admin (secondary persona)
34, Head of Talent at a 200-person company. Only sees candidates at the final decision point, with no
visibility into where roles are stuck upstream. Needs a dashboard to spot stalled requisitions and a
single screen with full context (scorecard, timeline, notes) to make confident final hire/reject calls.

### Arjun — Candidate (thin profile)
Mid-career SDE applying from his phone during a commute. Wants to apply in under 5 minutes and check
status later without emailing anyone. His four touchpoints (browse, apply, upload resume, track status)
fully capture his needs.

## 5. Business Goals

1. **Fast activation** — a hiring team should move their first candidate through the pipeline in
   their very first session.
2. **Win against "doing nothing"** — the real competitor is a team deciding their spreadsheet is
   "good enough." Every screen must feel obviously better than that.
3. **Earn trust as the low-complexity option** — any hint of enterprise complexity undermines the
   "Simple Hiring" differentiator.

## 6. Product Goals

1. **Zero-context-switch pipeline management** — the pipeline is the single source of truth; no
   Slack/email/spreadsheet needed to know candidate status.
2. **Sub-5-second orientation** — a recruiter or admin logging in understands what needs attention
   today with no walkthrough.
3. **Confident, low-ambiguity final decisions** — the Admin sees everything relevant to a hire call
   (scorecard, timeline, notes) on one screen.
4. **Frictionless candidate application** — under 5 minutes, mobile-first, no account-creation tax
   before the candidate has even seen the job.

## 7. Success Metrics

### Demonstrable (proven in demo video / case study — no real usage data exists for this project)
- Full candidate journey (applied → hired) shown entirely inside the app, no external tool referenced.
- Cold login to first meaningful action, timed on camera.
- Hire-decision screen shown surfacing scorecard + timeline + notes with no scrolling required.
- Candidate apply flow timed on a mobile viewport.

### Functional
- Candidate applies successfully. Recruiter manages the hiring pipeline. Admin completes a hire.

### Technical
- JWT auth works. RBAC works. Resume upload works. Successful production deployment.

### UX
- Responsive UI. Fast navigation. Simple workflows.

## 8. User Roles & Permissions

Exactly three roles — no more, no fewer.

| Role | Can | Cannot |
|---|---|---|
| **Candidate** | Register, browse jobs, apply, upload resume, track status, update profile | Access any recruiter/admin views |
| **Recruiter** | Create/edit/delete jobs, review applications, manage early pipeline stages, add candidates, add notes, schedule interviews (assigning Admin as interviewer), search/filter, reject candidates | Conduct interviews, submit scorecards, move to Offer/Hired, manage recruiter accounts |
| **Admin** | Everything a Recruiter can, plus: conduct assigned interviews, submit scorecards, move candidates to Offer/Hired, manage Recruiter accounts, view company-wide dashboard | — (full access) |

Registration rules (BR1): Candidates self-register. Recruiters and Admins cannot self-register —
Recruiters are created by an Admin; the initial Admin account is seeded.

## 9. Hiring Pipeline

Fixed pipeline (not user-configurable in MVP):

```
Applied → Resume Screening → Interview Scheduled → Interview Completed → Final Review → Offer → Hired
```

- A candidate may be rejected at any stage; rejection requires a predefined reason (Skills mismatch,
  Experience mismatch, Candidate withdrew, Salary expectations, Other) plus an optional free-text note.
- Every status change is logged to that candidate's Activity Timeline.
- Only Admin can move a candidate to Offer/Hired.
- Recruiters manage early pipeline stages only.

## 10. Functional Requirements

### Auth & Access
- Email+password signup (Candidates only) and login, JWT sessions, bcrypt password hashing.
- RBAC enforced server-side on every protected route — never trust a client-sent role.
- Admins create/deactivate Recruiter accounts.

### Job Management
- Recruiter/Admin: create, edit, delete job postings (title, description, requirements, location, status).
- Job deletion is a **soft delete** (`deletedAt` field) — removes the job from the careers page and
  active job lists, but preserves it for existing Applications, the Activity Timeline, and dashboard
  history, which all reference it.
- Public careers page lists only `open` jobs; candidates can view full job detail.

### Candidate & Pipeline
- Candidate applies with mandatory PDF resume upload (Cloudinary) → creates an Application with a
  required `source` field and starting stage `Applied`.
- A candidate may have only one active application per job, but may apply to multiple different jobs.
- Recruiter/Admin can manually add a candidate with a required source.
- Stage transitions are validated server-side against the fixed pipeline — no arbitrary jumps.
- Every stage change and rejection writes an entry to the candidate's Activity Timeline (this single
  feature satisfies both the Timeline user stories and the audit-trail requirement).
- Resume preview in-browser without forcing a download; each application stores the resume submitted
  at the time of that application.

### Interviews & Scorecards
- Only Recruiters schedule interviews; interviews are assigned only to an Admin.
- Only the assigned Admin conducts the interview and submits its scorecard.
- Every interview has exactly one scorecard (recommendation, comments, optional ratings); scorecards
  are permanent history and cannot be edited after submission.
- A candidate cannot advance past Interview Completed until a scorecard exists.
- Recruiters can view submitted scorecards read-only.

### Search & Finding Data
- Server-side search/filter on candidates by name, job, stage, source — debounced input.
- Server-side pagination on candidate lists (default 25/page).

### Dashboards (role-based; informational only — no automated hiring decisions)
- **Candidate:** applied jobs, application status, upcoming interview, recent activity.
- **Recruiter:** open jobs, new applications, candidates by stage, scheduled interviews, pending tasks.
- **Admin:** open jobs, total candidates, candidates by stage, candidates by source, pending interviews,
  hiring activity.

### State Coverage
Every async view (pipeline, job list, candidate profile, dashboards) explicitly handles loading, empty,
error, and success states — no blank flash, no dead ends.

## 11. Non-Functional Requirements

- **Performance:** most pages load within 2s under normal conditions; typical API responses under
  500ms; dashboards load within 2–3s; search/filtering stays responsive at startup-scale data volumes.
- **Security:** JWT auth (Authorization header, in-memory token storage on the client — chosen over
  httpOnly cookies because frontend/backend are on different domains, Vercel vs. Render), bcrypt
  password hashing (cost factor ≥ 12), server-side RBAC on every protected route, shared Zod validation
  on all API boundaries, plaintext passwords never stored, secure resume upload validation (PDF only,
  size-capped), basic login rate limiting, secrets only in environment variables. A minimal transactional
  email flow is scoped in *only* for password reset (single-use token, hashed at rest, 15–30 min TTL).
  *(Deferred: OAuth, full Email Verification gate on write access, MFA, audit logs beyond the Activity
  Timeline, Session Rotation.)*
- **Reliability & Error Handling:** graceful error handling on frontend and backend, user-friendly
  error messages, no stack traces exposed to the client, data consistency, explicit loading/empty/error
  states, backend logging.
- **Scalability:** modular architecture, clean separation of concerns, efficient search, pagination,
  maintainable project structure. Deeper scaling detail deferred to System Design.
- **Usability & Accessibility:** responsive design, consistent design system, intuitive navigation,
  keyboard accessibility, accessible color contrast, success/error feedback, minimal clicks for common
  tasks, modern UI focused on simplicity.
- **Maintainability:** TypeScript strict (no `any`) on both frontend and backend, modular code,
  separation of concerns, consistent naming, reusable components, professional README, environment
  configuration, easy future extensibility.
- **Compatibility & Deployment:** supports Chrome, Firefox, Edge, Safari. Frontend → Vercel, backend →
  Render, database → MongoDB Atlas. Environment variables, production-ready build, deployment
  documentation.

## 12. Business Rules

- **BR1 — Registration:** Candidates self-register; Recruiters/Admins cannot. Recruiters are created
  by an Admin; the initial Admin is seeded.
- **BR2 — Applications:** One active application per candidate per job; every application belongs to
  exactly one candidate and one job, stores its source, and starts in `Applied`.
- **BR3 — Pipeline:** Fixed stages (see Section 9); rejection requires a predefined reason; all status
  changes log to the Activity Timeline; only Admin moves candidates to Offer/Hired; Recruiters manage
  early stages only.
- **BR4 — Resumes:** Upload mandatory, PDF only, stored in Cloudinary; Recruiters/Admin can preview and
  download; each application stores the resume submitted at that time; a candidate has one profile but
  may apply to multiple jobs.
- **BR5 — Interviews:** Only Recruiters schedule; interviews are assigned only to Admin; only Admin
  conducts interviews and submits scorecards; every interview has exactly one permanent scorecard; a
  candidate cannot advance without one.
- **BR6 — Dashboards:** Role-based; analytics are informational only; no automated hiring decisions.

## 13. MVP Scope

See `FEATURE_LIST.md` for the full Must/Should/Nice/Future breakdown.

## 14. Risks

Tight 10-day timeline · scope creep · deployment challenges · authentication/RBAC complexity ·
resume upload integration reliability (Cloudinary) · limited time remaining for UI polish.

## 15. Constraints

10-day timeline · MERN stack · single developer · internship assignment · must be a production-ready
MVP · single-company ATS only.

## 16. Assumptions

One company uses HireTrack · one Admin manages hiring · Recruiters manage the pipeline day-to-day ·
candidates apply via the careers page or manual entry · the Admin conducts all interviews · reliable
internet connectivity is assumed · resumes are PDF only.

## 17. Acceptance Criteria

The MVP is complete only if:

- [ ] Candidate can register and log in.
- [ ] Candidate can browse jobs and view job detail.
- [ ] Candidate can apply with a resume upload.
- [ ] Recruiter can create/edit/delete jobs.
- [ ] Recruiter can review resumes and search/filter candidates.
- [ ] Recruiter can move candidates through the hiring pipeline and reject with a reason.
- [ ] Recruiter can schedule an interview, assigning an Admin.
- [ ] Admin can view assigned interviews.
- [ ] Admin can submit a scorecard.
- [ ] Admin can make the final hire/reject decision.
- [ ] Role-based dashboards work for all three roles.
- [ ] Activity Timeline records all pipeline actions.
- [ ] Source tracking works on every application.
- [ ] JWT authentication and RBAC work end-to-end.
- [ ] Application is deployed successfully (frontend, backend, database all live).

## 18. Open Questions

1. **Initial Admin seeding.** Confirm the seed mechanism (seed script vs. one-time env-var-driven
   creation on first boot) before System Design locks the auth bootstrap flow.
2. **Transactional email provider for password reset.** A provider needs to be chosen (e.g., Nodemailer
   + SMTP relay, or a managed provider like Resend/SendGrid free tier) — this is the one piece of new
   infrastructure introduced by the password-reset decision and should be settled early in System Design
   since it involves a new external service and its own env vars/secrets.
