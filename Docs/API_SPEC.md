# API_SPEC.md — HireTrack

All routes prefixed `/api`. Auth via `Authorization: Bearer <JWT>` header (24-hour expiry, no refresh
token). Every protected route runs `authenticate` → `authorize(...roles)` → route-specific row-level
checks, in that order. Every mutation returns the updated record so the client never needs a follow-up
GET.

---

## Auth

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | public | `{ name, email, password }` | Candidate only — Recruiters/Admins cannot self-register (BR1) |
| POST | `/auth/login` | public | `{ email, password }` | Returns `{ token, user }` |
| POST | `/auth/forgot-password` | public | `{ email }` | Always returns 200 regardless of whether the email exists, to avoid account enumeration |
| POST | `/auth/reset-password` | public | `{ token, newPassword }` | Token hashed + compared server-side; single-use, 15–30 min TTL |

## Users (Admin manages Recruiters)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/users` | Admin | `{ name, email, password }` | Creates a Recruiter account |
| GET | `/users?role=recruiter` | Admin | — | List all Recruiters |
| PATCH | `/users/:id` | Admin | `{ isActive }` | Activate/deactivate — never hard-deleted |

## Jobs

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/jobs` | Recruiter, Admin | `{ title, description, requirements, location, minExperience, maxExperience }` | `status` defaults `open` |
| GET | `/jobs` | public | query: `page, limit` | `status: open, deletedAt: null` only — careers page |
| GET | `/jobs/manage` | Recruiter, Admin | query: `status, page, limit` | includes closed jobs, excludes soft-deleted |
| GET | `/jobs/:id` | public | — | 404 if closed/deleted for public callers |
| PATCH | `/jobs/:id` | Recruiter, Admin | any editable field | |
| DELETE | `/jobs/:id` | Recruiter, Admin | — | soft delete — sets `deletedAt`, never removes the document |

## Applications

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/applications` | Candidate | `multipart/form-data`: `jobId`, `source`, `phone`, `country`, `address`, `experience`, `linkedinUrl`, `githubUrl?`, `portfolioUrl?`, `coverLetter?`, `currentCompany?`, `currentTitle?`, `termsAccepted`, `resume` file | validates PDF + size before Cloudinary upload; checks experience matches job requirements; rejects if an active application already exists for that job |
| GET | `/applications/me` | Candidate | query: `page, limit` | own applications only |
| GET | `/applications` | Recruiter, Admin | query: `search, stage, source, jobId, page, limit` | debounced server-side search |
| GET | `/applications/:id` | Recruiter, Admin | — | full profile: resume, notes, interviews, scorecard, timeline |
| POST | `/applications/:id/notes` | Recruiter, Admin | `{ text }` | appends to embedded `notes` array |
| POST | `/applications/:id/advance` | Recruiter, Admin (rule-dependent per stage) | — | moves to the *next* stage in the fixed sequence only — no target stage accepted from client |
| POST | `/applications/:id/reject` | Recruiter, Admin | `{ rejectionReason, rejectionNote? }` | valid from any non-terminal stage |
| POST | `/applications/:id/mark-hired` | Admin only | — | valid only from `final_review`; collapses Offer+Hired into one action |

## Interviews & Scorecards

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/interviews` | Recruiter | `{ applicationId, interviewerId, scheduledAt }` | `interviewerId` must resolve to a `role: admin` user; auto-moves Application to `interview_scheduled` |
| GET | `/interviews/mine` | Admin | query: `status` | interviews where `interviewer === req.user.id` |
| POST | `/interviews/:id/scorecard` | Admin (must be the assigned interviewer) | `{ recommendation, comments, ratings? }` | sets `Interview.status = completed`, auto-advances Application to `interview_completed` — one action does both |
| GET | `/interviews/:id/scorecard` | Recruiter, Admin | — | read-only for Recruiter |

## Dashboards

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/dashboard/candidate` | Candidate | applied jobs, status, upcoming interview, recent activity |
| GET | `/dashboard/recruiter` | Recruiter | open jobs, new applications, candidates by stage, scheduled interviews, "needs attention" (3-day stale) |
| GET | `/dashboard/admin` | Admin | everything Recruiter sees + candidates by source, company-wide hiring activity |

## Health (for the keep-alive ping)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | public | `{ status: 'ok' }` — pinged every ~10 min by an external cron to prevent Render cold starts |

---

## Standard Error Shape

```json
{ "message": "Human-readable, actionable message", "code": "OPTIONAL_MACHINE_CODE" }
```

No stack traces or internal error details are ever included in the response body — those go to
server-side logs only (see SYSTEM_DESIGN.md, Error Handling).
