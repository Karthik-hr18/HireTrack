# plan.md — HireTrack Implementation Plan

This is the pre-code plan required before any implementation begins (per the trial handbook's
"spec before a single line" workflow). System Design (detailed schema, API contracts, wireframes)
follows this document and is a separate, later step — not included here.

## 1. Product Summary

HireTrack is a single-company Applicant Tracking System for 50–250 employee companies. Three roles
(Candidate, Recruiter, Admin) move applications through a fixed pipeline. Full detail in `PRD.md`.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript (strict) |
| Styling | Tailwind CSS |
| Frontend data | Axios + React Query (or Context/hooks if time-constrained) |
| Backend | Node.js + Express + TypeScript (strict) |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (Authorization header, in-memory token on client) + bcrypt |
| Transactional email | Provider TBD (Nodemailer+SMTP or Resend/SendGrid free tier) — password reset only |
| File storage | Cloudinary (PDF resumes only) |
| Deployment | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

**Hard rule carried from the trial handbook:** TypeScript strict mode, zero `any`, on both frontend
and backend. Real database, real auth, server-side validation, secrets only in environment variables.

## 3. High-Level Architecture

```
client/                      server/
  src/                         src/
    pages/                       routes/
    components/                  controllers/
      ui/                        models/
      candidate/                 middleware/
      recruiter/                   auth.ts (JWT verify)
      admin/                       rbac.ts (role check)
    lib/                          validators.ts (shared Zod-equivalent)
      api.ts                    services/
      auth.ts                   utils/
    types/                     types/
```

Shared type definitions (Application, Job, User, Interview, Scorecard, TimelineEntry) should live in a
single source of truth and be mirrored/generated for both client and server to avoid drift — exact
mechanism (shared package vs. duplicated-but-reviewed types) decided in System Design.

## 4. Core Data Entities (high-level — full schema is a System Design deliverable)

- **User** — role: `candidate | recruiter | admin`
- **Job** — title, description, requirements, location, status (`open | closed`), createdBy,
  `deletedAt` (nullable — soft delete only; Applications and Activity Timeline reference Jobs and must
  not be orphaned by deletion)
- **Application** — candidate ref, job ref, source (enum), stage (enum), resume ref (Cloudinary URL,
  snapshotted at apply time), rejectionReason (enum, nullable), rejectionNote (nullable)
- **Interview** — application ref, interviewer (Admin user ref), scheduledAt, status
- **Scorecard** — interview ref (1:1), recommendation, comments, ratings (optional), submittedBy
- **ActivityLog** — entityType, entityId, action, actor, timestamp (powers the Candidate Timeline
  and doubles as the audit trail)

## 5. API Surface (grouped — exact routes finalized in System Design)

- **Auth:** register (candidate only), login, logout, *(Should Have, pending decision: forgot/reset password)*
- **Jobs:** CRUD (Recruiter/Admin), public list + detail (Candidate)
- **Applications:** apply, list/search/filter, move stage, reject, add note
- **Interviews:** schedule (Recruiter), list "my assigned" (Admin), mark complete
- **Scorecards:** submit (Admin only), view (Recruiter/Admin)
- **Dashboards:** role-specific summary endpoints (candidate / recruiter / admin)
- **Users:** Admin manages Recruiter accounts

## 6. Build Order

1. **Schema + types + auth skeleton** — models, JWT auth, RBAC middleware, role-gated routing shell.
2. **Job management + careers page** — Recruiter job CRUD, public candidate-facing job list/detail.
3. **Application flow + pipeline core** — apply with resume upload, pipeline view, stage transitions,
   activity timeline, source tracking.
4. **Interview + scorecard flow** — scheduling, Admin's assigned-interviews view, scorecard submission,
   the "no advance without scorecard" rule.
5. **Dashboards** — role-based summaries for all three roles.
6. **Polish, states, SEO, deploy** — loading/empty/error states everywhere, meta tags/OG image,
   Lighthouse pass, production deploy, README, demo video.

Full day-by-day sequencing is in `MILESTONES.md`.

## 7. Key Decisions Log

- Exactly 3 roles; no separate Interviewer role — Admins conduct all interviews (see PRD Section 8).
- No OAuth in MVP — email/password + JWT only.
- Rejection reasons are a fixed enum plus an optional free-text note, not open text.
- The Activity Timeline is a single feature serving both the candidate-facing timeline story and the
  audit-log non-functional requirement — do not build these as two separate systems.
- Fixed, non-configurable pipeline in MVP (custom pipelines are Future Scope).
- JWT delivered via Authorization header, stored in memory client-side (not localStorage, not cookies)
  — chosen over httpOnly cookies specifically because frontend (Vercel) and backend (Render) are on
  different domains; avoids cross-domain cookie/CORS complexity and sidesteps CSRF, at the cost of
  needing strict XSS discipline (no `dangerouslySetInnerHTML`, rely on React's default escaping).
- Password reset gets minimal transactional email support as a scoped exception to the broader
  "no email infrastructure in MVP" stance — this is the only place email sending is built.
- Job deletion is soft delete only — hard delete is never exposed, to protect referential integrity
  with Applications and the Activity Timeline.

## 8. Out of Scope

See `PROJECT_SCOPE.md` for the full list of explicitly excluded features and integrations.
