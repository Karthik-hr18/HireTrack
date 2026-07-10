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

Monorepo using npm workspaces (required by the shared Zod validation decision in System Design) —
see `SYSTEM_DESIGN.md` Section 6 and 12 for the full reasoning.

```
hiretrack/
├── .github/workflows/ci.yml
├── docs/
├── packages/shared/          # Zod schemas + derived TS types — imported by both client and server
├── client/                   # Vite + React + TS strict → Vercel
│   └── src/
│       ├── pages/            (auth/, candidate/, recruiter/, admin/)
│       ├── components/       (ui/, candidate/, recruiter/, admin/)
│       ├── lib/               (api client, auth context, React Query setup)
│       └── types/
├── server/                   # Express + TS strict → Render
│   └── src/
│       ├── routes/  controllers/  models/
│       ├── middleware/        (auth.ts, rbac.ts, errorHandler.ts, rateLimiter.ts)
│       ├── services/          (cloudinary.ts, email.ts, dashboardAggregations.ts)
│       └── scripts/           (seed.ts)
└── package.json               # root, workspaces config
```

## 4. Core Data Entities

Fully specified in `DATA_MODEL.md` — collections, field types, indexes, and the reasoning behind each
embed-vs-reference call (Notes embedded on Application, ActivityLog as one shared polymorphic
collection, dashboards on live aggregation with no denormalization).

## 5. API Surface

Fully specified in `API_SPEC.md` — full endpoint table with method, path, auth requirements, and
request/response shapes. Notably, pipeline stage changes are exposed as specific action endpoints
(`/advance`, `/reject`, `/mark-hired`), not a generic state-mutating PATCH — see `SYSTEM_DESIGN.md`
Section 3 for why.

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
