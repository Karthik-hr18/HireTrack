# Architecture Documentation — HireTrack

HireTrack is built as a single-company Applicant Tracking System (ATS). It follows a monorepo structure using **npm workspaces** to separate the frontend client, backend server, and shared validation logic.

```
                   ┌──────────────┐
                   │    Client    │ (React + TS, Vercel)
                   └──────┬───────┘
                          │ (Auth Token in Memory, Header Authentication)
                          ▼
                   ┌──────────────┐
                   │  API Server  │ (Express + TS, Render)
                   └──────┬───────┘
                          ├────────────────────────┐
                          ▼                        ▼
                 ┌─────────────────┐      ┌─────────────────┐
                 │ MongoDB (Atlas) │      │   Cloudinary    │ (PDF Resumes Only)
                 └─────────────────┘      └─────────────────┘
```

---

## 1. Data Model

The data layer uses **MongoDB** and is mapped via **Mongoose**. Key database design principles are:
* **Polymorphic Activity Logs**: A single, compound-indexed `ActivityLog` collection is shared across entity models, powering candidate audit histories and active feed feeds without requiring joins on multiple log tables.
* **Denormalization vs. Live Aggregation**: At the intended scale (50–250 employee company), live MongoDB aggregations are used for dashboard analytics, preserving simplicity and accuracy.
* **Referential Integrity**: Jobs are never hard deleted; soft delete flags (`deletedAt`) ensure applications and timelines do not have orphaned references.

### Schemas

1. **User**: Represents Candidates, Recruiters, and Administrators. Admin users deactivate Recruiters by toggling `isActive` rather than database deletion.
2. **Job**: Contains job details and status. Careers listings are filtered on `status: 'open'` and `deletedAt: null`.
3. **Application**: Represents candidate entries. Stores source track metrics, resume references, stage states, and embeds an array of recruiter comments (`notes`).
4. **Interview**: Links applications to designated Admin interviewers, tracking appointment dates and states.
5. **Scorecard**: Holds permanent feedback from interviewers in a 1:1 relation with corresponding interviews.
6. **ActivityLog**: Logs stage changes, notes additions, job posts, and scorecards for timelines.

---

## 2. Authentication & Authorization

```
Incoming Request
      │
      ▼
┌──────────────┐
│ authenticate │ ──► Reads Bearer token, checks database if User exists and isActive
└──────┬───────┘
       │ (Success)
       ▼
┌──────────────┐
│  authorize   │ ──► Checks if req.user.role satisfies required roles for the endpoint
└──────┬───────┘
       │ (Success)
       ▼
┌──────────────┐
│ Controller / │ ──► Validates row-level resource relation checks
│ Row Checks   │     (e.g., "does req.user.id equal interview.interviewer?")
└──────────────┘
```

### Authentication Flow
- Handled with JSON Web Tokens (JWT) signed with `JWT_SECRET`.
- Tokens expire in 24 hours. No refresh tokens are implemented.
- **Header Delivery**: Tokens are transmitted exclusively through the `Authorization: Bearer <token>` header.
- **Client Storage**: To bypass cross-domain CORS cookie complexities on different hosting platforms (Vercel client vs Render backend), tokens are stored **strictly in memory** in the React application. CSRF vulnerability is mitigated because credentials are not automatically sent by the browser. Strict XSS validation (default React escaping) is enforced.

### Authorization Flow
Role-Based Access Control (RBAC) is implemented server-side as two-tier middleware:
1. **`authenticate` middleware**: Extracts the token, verifies it, finds the user in MongoDB, validates that the account is active (`isActive: true`), and appends the payload session to `req.user`.
2. **`authorize(...roles)` middleware**: Confirms the logged-in user's role is in the list of allowed permissions for the route.
3. **Row-level authorization (Controller layer)**: The controller itself executes checks to ensure resource ownership (e.g., verifying that an Admin posting a scorecard is the designated interviewer).
