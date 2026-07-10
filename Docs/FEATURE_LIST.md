# FEATURE_LIST.md — HireTrack

## Must Have (MVP)

**Authentication**
- [ ] Candidate registration
- [ ] Login / logout
- [ ] JWT-based sessions
- [ ] Role-based access control (Candidate, Recruiter, Admin)

**Candidate**
- [ ] Candidate profile
- [ ] Browse careers page
- [ ] View job details
- [ ] Apply to a job
- [ ] Resume upload (PDF, via Cloudinary)
- [ ] Track application status

**Recruiter**
- [ ] Recruiter dashboard
- [ ] Create / edit / delete jobs
- [ ] View applications
- [ ] Resume preview
- [ ] Candidate profile view
- [ ] Search candidates
- [ ] Filter candidates
- [ ] Add candidate manually
- [ ] Add notes
- [ ] Schedule interview (assign Admin as interviewer)
- [ ] Move candidate through pipeline
- [ ] Reject candidate (predefined reason + optional note)

**Admin**
- [ ] Admin dashboard
- [ ] View assigned interviews
- [ ] Conduct interview
- [ ] Submit scorecard
- [ ] Final hire/reject decision
- [ ] Recruiter account management

**ATS Core**
- [ ] Activity timeline (per candidate)
- [ ] Source tracking (per application)
- [ ] Fixed hiring pipeline (Applied → Resume Screening → Interview Scheduled → Interview Completed → Final Review → Offer → Hired)
- [ ] Role-based dashboards

---

## Should Have

- [ ] Forgot password / reset password *(minimal transactional email, single-use hashed token, 15–30 min TTL — provider TBD in System Design)*
- [ ] Pagination on candidate/job lists
- [ ] Dashboard charts (visual, not just numbers)
- [ ] Advanced filters
- [ ] Resume download (in addition to in-browser preview)

## Nice to Have

- [ ] Toast notifications
- [ ] Skeleton loading states
- [ ] Dark mode
- [ ] Rich text notes
- [ ] Refined animations/transitions

## Future Scope (explicitly not built)

Google OAuth · Microsoft OAuth · Email verification · AI resume screening · AI candidate ranking ·
LinkedIn integration · Naukri integration · Calendar integration · Zoom integration · Slack integration ·
HRMS · Payroll · Employee onboarding · Panel interviews / multiple interviewers · Custom (configurable)
hiring pipelines · Talent CRM · Multi-company support · Mobile app
