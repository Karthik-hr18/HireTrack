# IMPLEMENTATION_PLAN.md — Pre-Submission Final Milestone Plan
### HireTrack ATS — Final Release Polish

This plan addresses the remaining High and Medium priority gaps identified in `AUDIT_REPORT.md` to move the submission from **🟡 Ready with Minor Fixes** to **🟢 Ready for Submission**.

---

## Milestone 1: Password Reset & Account Recovery (High Priority)

### Objective
Implement single-use password reset token generation and password reset confirmation endpoints to satisfy Section 3.1 & 7.3 security requirements.

### Vertical Slice Sequence
1. **Schema Validation**: Add `ForgotPasswordSchema` and `ResetPasswordSchema` in `packages/shared/src/validation.ts`.
2. **Backend Controller & Route**:
   - `POST /api/auth/forgot-password`: Generates 32-byte crypto token, stores SHA-256 hash in `user.resetTokenHash`, sets 30-minute expiry in `user.resetTokenExpiresAt`.
   - `POST /api/auth/reset-password`: Verifies token hash, checks TTL, updates `passwordHash` with bcrypt (cost 12), and clears reset fields.
3. **Frontend Integration**: Add "Forgot Password?" link and reset modal in `LoginPage.tsx`.

### Files Affected
- [validation.ts](file:///c:/Users/karth/Projects/HireTrack/packages/shared/src/validation.ts)
- [authController.ts](file:///c:/Users/karth/Projects/HireTrack/server/src/controllers/authController.ts)
- [authRoutes.ts](file:///c:/Users/karth/Projects/HireTrack/server/src/routes/authRoutes.ts)
- [LoginPage.tsx](file:///c:/Users/karth/Projects/HireTrack/client/src/pages/auth/LoginPage.tsx)

### Verification & Acceptance Check
- **Spec Verification Check (Part 3.1)**: Use a reset token twice — the second use must fail with `400 BAD_REQUEST`. Wait past 30-minute TTL and confirm expired token rejection.
- **Regression Risk**: **Low** (Isolated auth routes and non-breaking user schema additions).

---

## Milestone 2: Auth Rate Limit Calibration & Security Tuning (Medium Priority)

### Objective
Tune authentication rate limiting to match spec bounds (~5 attempts per 15 min window for login endpoints).

### Vertical Slice Sequence
1. **Backend Rate Limiter Configuration**: Create a strict `loginLimiter` in `server/src/index.ts` with `windowMs: 15 * 60 * 1000` and `max: 5` applied specifically to `POST /api/auth/login` and `POST /api/auth/reset-password`.

### Files Affected
- [server/src/index.ts](file:///c:/Users/karth/Projects/HireTrack/server/src/index.ts)

### Verification & Acceptance Check
- **Spec Verification Check (Part 3.1)**: Fire 6 rapid failed login attempts via curl/Postman and confirm a `429 Too Many Requests` response with `RATE_LIMIT_EXCEEDED` message on the 6th attempt.
- **Regression Risk**: **Low** (Middleware configuration tuning).

---

## Milestone 3: Semantic Version Release Tagging & Final Artifacts (High Priority)

### Objective
Tag repository commit with `v1.0.0` release tag and prepare outreach deliverables.

### Vertical Slice Sequence
1. **Git Tagging**: Create and push annotated tag `v1.0.0` to GitHub.
2. **Outreach & Final Checklist**: Verify demo credentials and live URLs in README.

### Files Affected
- Git repository metadata
- [README.md](file:///c:/Users/karth/Projects/HireTrack/README.md)

### Verification & Acceptance Check
- **Spec Verification Check (Part 7.8 & 7.10)**: Confirm `git tag --list` displays `v1.0.0` and tag is visible on GitHub releases page.
- **Regression Risk**: **Low** (Zero code changes).
