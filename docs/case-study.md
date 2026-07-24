# Case Study — Engineering HireTrack

**Project**: HireTrack — Single-Company B2B Applicant Tracking System  
**Author**: Karthik H R  
**Tech Stack**: React 18, TypeScript, Node.js, Express, MongoDB, Mongoose, Zod, Firebase Auth, Vite  

---

## 🎯 1. Problem Statement

Modern hiring teams require an Applicant Tracking System (ATS) that balances candidate accessibility with strict recruitment governance. Common failure modes in existing applicant tracking solutions include:
- Unprotected API endpoints permitting cross-account data access (IDOR vulnerabilities).
- Static or mocked metrics in recruitment dashboards that obscure real hiring velocity.
- Inconsistent candidate application stages leading to lost applicant records.

HireTrack was built to demonstrate how an enterprise-grade ATS can be engineered from scratch with strict security boundaries, real-time database analytics, end-to-end type safety, and polished user experience.

---

## 🛠️ 2. Engineering Approach & Architecture

### A. Shared Validation & Type Safety
To eliminate type drift between frontend forms and backend API controllers, shared Zod schemas (`RegisterSchema`, `LoginSchema`, `CreateJobSchema`, `ScheduleInterviewSchema`, `SubmitScorecardSchema`) were centralized in a monorepo workspace package (`@hiretrack/shared`). Both Vite client components and Express route handlers import the same contract.

### B. Security-First Auth & RBAC
Authentication relies on Firebase ID Token verification backed by a MongoDB identity sync layer. Server-side role-based access control (`authorize('recruiter', 'admin')`) gates all mutating endpoints. Non-admin recruiters are restricted from modifying job requisitions owned by other recruiters via explicit row-level ownership checks (`job.createdBy.toString() === req.user.id`).

### C. Collapsed Hiring Recommendations
The scorecard module introduces a collapsed decision framework: when an evaluator submits an HR scorecard recommendation, the candidate's application stage automatically transitions to `offer` or `rejected` based on the score, writing an immutable event to `ActivityLog` and notifying the candidate.

---

## 📊 3. Measurable Results & Verification

- **Automated Integration Tests**: 37 Vitest integration tests passing cleanly across authentication, job management, candidate tracking, scorecard processing, and analytics aggregation.
- **Type Safety**: TypeScript strict mode enabled across all packages with zero unresolved type errors.
- **Lighthouse Performance**: 100 SEO score, 95+ Accessibility score, with full keyboard navigation and `@media (prefers-reduced-motion: reduce)` support.

---

## 💡 4. Key Engineering Lessons Learned

1. **Schema-First Design Prevents Costly Refactors**: Locking database models and shared Zod schemas prior to writing UI code eliminated contract mismatches between client components and backend endpoints.
2. **Defensive Reference Handling**: In relational MongoDB schemas with populated fields, using defensive fallbacks prevents server crashes when referenced user or job documents are archived or deleted.
3. **Data Integrity Over Mock Fallbacks**: Driving every dashboard KPI from MongoDB aggregation pipelines ensures that metrics represent true system state under all conditions.
