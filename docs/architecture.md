# HireTrack — System Architecture & Technical Specifications

**Author**: Karthik H R  
**Project**: HireTrack — B2B Applicant Tracking System (MERN Monorepo)  
**Version**: 1.0.0 (Release Candidate)  

---

## 🏗️ 1. Architecture Overview

HireTrack is designed as a modular, type-safe MERN monorepo structured into three isolated packages:

```text
HireTrack Monorepo
├── packages/shared/     # Shared Zod validation schemas & TypeScript interfaces
├── server/              # Node.js + Express + TypeScript API server
└── client/              # React 18 + Vite + TypeScript frontend application
```

### Data Layer Architecture
- **Database**: MongoDB Atlas / local MongoDB instance managed via **Mongoose 8 ODM**.
- **Indexing Strategy**:
  - Compound `$text` search index on `Job` collection (`title`, `description`, `department`, `location`).
  - Compound unique relational index on `Application` collection (`candidate` + `job`), preventing duplicate application submissions.
  - Secondary sorting on `_id` across paginated queries (`.sort({ createdAt: -1, _id: -1 })`) guaranteeing deterministic order.

---

## 🔒 2. Authentication & Authorization Security

```text
Incoming Request
      │
      ▼
1. Firebase ID Token Verification (firebase-admin)
      │
      ▼
2. MongoDB User Document Lookup & Auto-Sync
      │
      ▼
3. Server-side RBAC Middleware (authorize('recruiter', 'admin'))
      │
      ▼
4. Controller Execution & Ownership Checking (IDOR Protection)
```

- **Identity Link Integrity**:
  - Self-registration provisions candidate accounts (`role: 'candidate'`).
  - Existing user documents are mapped to immutable `firebaseUid` values.
  - Privileged accounts (Admin / Recruiter) cannot be auto-linked or hijacked via public self-registration.
- **Session Handling**: JWT bearer tokens attached via `Authorization: Bearer <token>` header with `httpOnly`, `SameSite=Lax` cookie fallbacks.
- **Password Hashing**: Passwords stored using `bcrypt` with cost factor 12. Password reset tokens use SHA-256 single-use hashes with 30-minute expiration.

---

## 📊 3. Analytics & Real-Time Aggregation Pipeline

All executive dashboard metrics and pipeline funnel graphs are computed directly from live MongoDB database collections — zero hardcoded or mocked fallback constants exist:

- **Executive Overview**: Computed via `Application.countDocuments()`, `Job.countDocuments()`, and `Interview.countDocuments()`.
- **Hiring Velocity**: Computed dynamically from the difference between `updatedAt` and `createdAt` timestamps of candidates placed in the `hired` stage.
- **Offer Acceptance Rate**: Calculated strictly as $\frac{\text{Hired}}{\text{Hired} + \text{Offers Pending}} \times 100$, evaluating to `0%` when no offers exist.

---

## 🛠️ 4. Key Architectural Trade-Offs

1. **Monorepo Shared Package vs. Duplicate Types**:
   - *Decision*: Centralized Zod schemas in `@hiretrack/shared`.
   - *Trade-off*: Requires building `@hiretrack/shared` prior to compiling server/client apps (`npm run build:shared`), but guarantees 100% schema alignment across client forms and Express route validators.

2. **Soft-Deletion vs. Hard Cascade Deletes**:
   - *Decision*: Implemented soft-deletion for job requisitions (`deletedAt = new Date()`).
   - *Trade-off*: Public job boards must explicitly filter `{ deletedAt: null }`, but existing applicant records, historical scorecards, and audit logs remain intact for analytical reporting.

3. **Signed URL Resume Streaming Proxy**:
   - *Decision*: Stream PDF files via authenticated backend endpoint (`GET /api/applications/:id/resume`).
   - *Trade-off*: Increases backend memory footprint during large file downloads, but completely shields private storage buckets and Cloudinary keys from client exposure.
