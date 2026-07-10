# SYSTEM_DESIGN.md — HireTrack

Consolidates all twelve System Design decisions. Schema detail lives in `DATA_MODEL.md`, endpoint
detail in `API_SPEC.md` — this document is the reasoning and the pieces that don't fit neatly in a
table.

---

## 1. Database Schema & Entity Relationships
See `DATA_MODEL.md`. Key calls: Notes embedded on Application (bounded volume, avoids a join for the
candidate profile page); ActivityLog is one shared polymorphic collection, not one per entity type;
dashboards use **live aggregation, no denormalized summary fields** — simpler, always-accurate, and
sufficient at 50–250-employee scale. Revisit only if real usage ever demands it.

## 2. Authentication & Authorization
- JWT, 24-hour expiry, no refresh token — a pragmatic middle ground between forcing frequent re-logins
  and leaving a leaked token valid for days.
- Delivered via `Authorization: Bearer` header, stored **in memory** on the client (not cookies, not
  localStorage) — chosen specifically because frontend (Vercel) and backend (Render) are on different
  domains, which makes httpOnly cross-domain cookies fragile to configure correctly under time pressure.
  This also means CSRF protection is unnecessary (no cookie to forge) — the compensating discipline is
  strict XSS hygiene (React's default escaping, never `dangerouslySetInnerHTML` on user content).
- Three-layer middleware: `authenticate` (verifies JWT) → `authorize(...roles)` (role check) →
  route-level row checks (e.g., a Scorecard submission verifies `submittedBy === interview.interviewer`).
- Password reset: single-use token, SHA-256 hashed at rest, 15–30 min TTL, invalidated on first use.
  Sent via **Resend** (chosen over SendGrid for simpler API-key setup, over Nodemailer+Gmail for
  reliable deliverability during live demos).
- Initial Admin created via a **manual seed script** (`npm run db:seed`, reads `ADMIN_EMAIL`/
  `ADMIN_PASSWORD` from env) — matches the handbook's own README Quick Start convention exactly.

## 3. Pipeline State Machine
```
applied → resume_screening → interview_scheduled → interview_completed → final_review → offer → hired
   └───────────────────────────┴──────────────────┴───────────────────┴────────────→ rejected (any stage)
```
- **Strictly forward-only, no reversal** — a rejected or advanced application cannot be moved backward.
  Keeps the model simple and matches "Simple Hiring"; corrections happen by adding the candidate again
  in the rare case they're needed, not by building undo logic.
- `interview_scheduled → interview_completed` happens **automatically** when a Scorecard is submitted —
  one action does both, which is also what structurally enforces "no advancing without a scorecard"
  (BR5) rather than relying on a separate validation check.
- `final_review → offer → hired` is a **single Admin action** (`mark-hired`). `offer` still exists as a
  real stage value for history/dashboard accuracy, but there's no separate "extend offer" /
  "offer declined" flow — not covered by any locked user story, so not built.
- Stage changes are exposed as **specific action endpoints** (`/advance`, `/reject`, `/mark-hired`), not
  a generic `PATCH` accepting a target stage — the server always knows what "advance" means next, so no
  client input ever specifies a destination stage. This makes "never trust a state sent from the
  client" structural, not just validated.

## 4. API Endpoint Specification
See `API_SPEC.md` for the full table.

## 5. File Upload Architecture (Resumes)
**Server-mediated upload** — client sends the PDF as `multipart/form-data` to Express, which validates
MIME type (`application/pdf`, checked on file bytes) and size (5MB cap) *before* calling Cloudinary
with the server-side API secret. Rejected direct-to-Cloudinary signed uploads as unnecessary complexity
for small PDF resumes at startup scale — that pattern solves a scaling problem this product doesn't have.

## 6. Validation Strategy
**npm workspaces**, with a `packages/shared/` package holding Zod schemas and their derived TypeScript
types (`z.infer<...>`). Both `client/` and `server/` import from the same file — the handbook's "one
shared schema so browser and API reject the exact same bad input" requirement, made structurally
impossible to violate rather than enforced by developer discipline.

## 7. Frontend Architecture
- React Router v6, a single `<ProtectedRoute role={...}>` wrapper gating every role-specific route.
- **React Query** for all data fetching — chosen specifically because it gives consistent
  loading/error/success/empty handling across ~15+ screens almost for free, which directly serves the
  handbook's heavily-weighted "every async view resolves to one of four states" requirement.
- Folder structure: `pages/{auth,candidate,recruiter,admin}`, `components/{ui,candidate,recruiter,admin}`,
  `lib/` (api client, auth context), `types/` (re-exports from `packages/shared` where possible).

## 8. Dashboard & Analytics Queries
Live MongoDB aggregation per dashboard (see Section 1). The one defined business rule: an application
is flagged "needs attention" on the Recruiter dashboard if `updatedAt` is more than **3 calendar days**
old and it's not in a terminal stage (`hired`/`rejected`) — simple, explainable, and delivers on Product
Goal 2 ("sub-5-second orientation") without business-day calendar logic or new settings scope.

## 9. Error Handling, Logging & Rate Limiting
- Centralized Express error-handling middleware — every route forwards to `next(err)`; full errors are
  logged server-side, sanitized `{ message, code }` returned to the client. Never a raw stack trace in
  a response body.
- `morgan` for request logging to stdout (Render captures this natively — no separate log service
  needed for a 10-day trial).
- `express-rate-limit`, **simple per-IP keying** (not the handbook's literal IP+account combo) on
  `/login`, `/register`, `/forgot-password`, `/reset-password` — a deliberate, documented scope
  reduction; IP+account combo keying is listed as a Day-9 stretch item if time allows.

## 10. Email Service Integration
**Resend**, API-key based. Used *only* for password reset — the one scoped exception to "no email
infrastructure in MVP" (Email Verification itself remains deferred to Future Scope).

## 11. Deployment & Environment Configuration
- **Vite** (not CRA) for the frontend build.
- Monorepo (single GitHub repo) — required by the npm workspaces decision in Section 6; Vercel's root
  directory points to `client/`, Render's points to `server/`.
- CORS: single allowed origin (the Vercel production URL), no `credentials: true` needed since auth is
  header-based, not cookie-based.
- CI: GitHub Actions running lint + typecheck + test on every push, per the handbook's repo structure.
- **Render free-tier cold starts** (15-min inactivity spin-down, ~30–50s wake time) are mitigated with a
  **free external keep-alive ping** (e.g., cron-job.org hitting `GET /health` every ~10 min) rather than
  paying for an always-on tier or just documenting the delay and hoping a reviewer reads the README first.

## 12. Repository & Folder Structure
See `plan.md` (updated) for the finalized tree — `packages/shared/`, `client/`, `server/`, `.github/`,
`docs/`, all under one root `package.json` with npm workspaces configured.

---

## Cross-Cutting Notes for Implementation

- Every mutation endpoint returns the updated record (handbook Data & CRUD requirement) — never make
  the client re-fetch after a write.
- Row-level authorization checks live in controllers/services, not middleware — middleware only checks
  *role*, controllers check *relationship to the resource* (e.g., "is this Admin the assigned
  interviewer for this scorecard").
- The ActivityLog write and the stage-transition write should happen in the same operation (ideally a
  Mongo transaction, or at minimum sequential with error handling that doesn't leave one written
  without the other) — a stage change with no corresponding timeline entry breaks the audit trail this
  entire feature exists to provide.
