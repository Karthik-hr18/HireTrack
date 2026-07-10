# PROJECT_SCOPE.md — HireTrack

## What HireTrack Is

HireTrack is a **single-company Applicant Tracking System (ATS)** — hiring management software a
company uses internally to run its own hiring process. It is purchased/deployed by one company for
that company's own recruiting team.

## What HireTrack Is NOT

- **Not a job marketplace** (not LinkedIn, not Naukri, not Internshala). Candidates do not browse jobs
  across multiple companies — they interact with one company's careers page.
- **Not a multi-tenant SaaS in MVP.** No support for multiple companies using one instance.
- **Not an AI recruiting platform.** The system organizes human decisions; it does not evaluate,
  score, or rank candidates automatically.

## Target Customer

Companies with **50–250 employees** — small but *real* hiring teams (at least one dedicated Recruiter
and one Admin/Head of Talent), not solo-founder scale and not enterprise. This range was deliberately
narrowed during discovery to match the complexity of the locked 3-role permission model.

## Product Philosophy

**Simple Hiring** — positioned between Greenhouse's "Structured Hiring" (feature-heavy, enterprise) and
Workable's "Automated Hiring" (automation-heavy). HireTrack's differentiator is doing the core pipeline
extremely well with minimal complexity, not doing everything.

## In Scope (MVP)

See `FEATURE_LIST.md` for the full breakdown. Summary: candidate application flow, unified hiring
pipeline with source tracking, recruiter pipeline management, admin-conducted interviews and
scorecards, admin-only final hire/reject decisions, role-based dashboards, activity timeline.

## Explicitly Out of Scope (Future Scope)

- AI Resume Screening, AI Candidate Ranking, AI Interview Summaries
- Google/Microsoft OAuth, Email Verification, MFA
- LinkedIn / Naukri / Calendar / Zoom / Slack integrations
- HRMS, Payroll, Employee Onboarding
- Panel interviews / multiple interviewers per interview
- Custom (configurable) hiring pipelines
- Talent CRM, multi-company support, mobile app

## Constraints

- 10-day timeline, single developer, internship assignment.
- Must be production-ready, not a demo/prototype.
- MERN stack (MongoDB, Express, React, Node.js), TypeScript strict on both frontend and backend.
- Deployment: Vercel (frontend) · Render (backend) · MongoDB Atlas (database).

## Assumptions

- One company uses HireTrack; one Admin manages hiring for that company.
- Recruiters are created by the Admin — they do not self-register.
- Admin conducts all interviews and submits all scorecards (no separate interviewer role).
- Resume format is PDF only, stored via Cloudinary.
- Reliable internet connectivity is assumed for all users.
