# HireTrack — System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

HireTrack is built as an npm workspaces monorepo comprising three distinct packages:
- `@hiretrack/shared`: Shared Zod validation schemas and TypeScript type definitions.
- `hiretrack-server`: Node.js + Express REST API server written in TypeScript.
- `hiretrack-client`: React 18 SPA compiled with Vite.

```mermaid
graph TB
    subgraph Monorepo Workspaces
        Shared["@hiretrack/shared<br/>(Zod Schemas & Types)"]
        Server["hiretrack-server<br/>(Node.js + Express API)"]
        Client["hiretrack-client<br/>(React 18 + Vite SPA)"]
    end

    subgraph External Infrastructure
        Firebase["Firebase Auth Service"]
        Mongo[(MongoDB Database)]
        Cloudinary["Cloudinary Storage"]
    end

    Client -->|Imports Schemas| Shared
    Server -->|Imports Schemas| Shared
    Client -->|HTTPS REST API| Server
    Server -->|Verify Tokens| Firebase
    Server -->|Mongoose ODM| Mongo
    Server -->|Signed File Proxy| Cloudinary
```

---

## 2. Folder Structure

```text
HireTrack/
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── index.ts              # Schema exports & types
│       │   ├── schemas/              # Zod schemas (Apply, Job, Scorecard, etc.)
│       │   └── types/                # TypeScript interface definitions
│       └── package.json
├── server/
│   ├── src/
│   │   ├── config/                   # DB, Firebase, Cloudinary configurations
│   │   ├── controllers/              # API controllers (auth, job, application, etc.)
│   │   ├── middleware/               # Auth, RBAC, upload, rate-limit middleware
│   │   ├── models/                   # Mongoose schemas & interfaces
│   │   ├── routes/                   # Express route definitions
│   │   ├── scripts/                  # DB seed script
│   │   ├── test/                     # Vitest integration test suites
│   │   └── index.ts                  # Express application entrypoint
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/               # Reusable UI & layout components
│   │   ├── context/                  # React Auth & Workspace contexts
│   │   ├── hooks/                    # Custom hooks (useDebounce, searchParams, etc.)
│   │   ├── pages/                    # Views (Careers, Recruiter Workspace, Admin, etc.)
│   │   ├── types/                    # Frontend specific types
│   │   └── main.tsx                  # React entrypoint
│   ├── public/                       # Static assets (sitemap.xml, favicon)
│   └── package.json
└── package.json                      # Monorepo root configuration
```

---

## 3. Authentication & Identity Flow

Authentication combines Firebase Auth for client token issuance with server-side MongoDB identity resolution.

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client
    participant FB as Firebase Auth
    participant Middleware as Auth Middleware (auth.ts)
    participant FBA as Firebase Admin SDK
    participant DB as MongoDB (User Collection)

    Client->>FB: Authenticate (Email/Password)
    FB-->>Client: Return Firebase ID Token
    Client->>Middleware: HTTP Request + Header (Authorization: Bearer <Token>)
    Middleware->>FBA: verifyIdToken(token)
    FBA-->>Middleware: Decoded Token (uid, email, email_verified)
    Middleware->>DB: Query User by firebaseUid (Fallback: email)
    DB-->>Middleware: Return User Document
    alt Email Verified in Firebase but Not Mongo
        Middleware->>DB: Update isEmailVerified = true
    end
    Middleware->>Middleware: Attach req.user = { id, email, role, isEmailVerified }
    Middleware-->>Client: Proceed to Controller
```

---

## 4. Role-Based Access Control (RBAC) Architecture

Route protection uses a layered middleware chain: authentication verification, role checking, and row-level ownership validation.

```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> AuthCheck{Auth Middleware}
    AuthCheck -- Valid Token --> RoleCheck{Authorize Middleware}
    AuthCheck -- Invalid Token --> R401[401 Unauthorized]
    
    RoleCheck -- Role Permitted --> OwnershipCheck{Requires Ownership?}
    RoleCheck -- Role Denied --> R403[403 Forbidden]
    
    OwnershipCheck -- Admin or Author --> Execute[Execute Controller]
    OwnershipCheck -- Not Author --> R403
```

- **Role Levels**:
  - `candidate`: Can view public jobs, submit applications, and access personal candidate portal.
  - `recruiter`: Can manage requisitions, advance application stages, record candidate notes, and schedule interviews.
  - `admin`: Full administrative access, including recruiter account management, job creation, and scorecard submission.

---

## 5. Workflow Architecture

### Recruiter Workflow Architecture

```mermaid
stateDiagram-v2
    [*] --> CreateRequisition: Create Job Requisition
    CreateRequisition --> ReviewApplications: Receive Candidate Applications
    ReviewApplications --> ResumeScreening: Advance to Screening
    ResumeScreening --> TechnicalInterview: Schedule Technical Interview
    TechnicalInterview --> HRInterview: Schedule HR Interview
    HRInterview --> SubmitScorecard: Evaluator Submits Scorecard
    SubmitScorecard --> Offer: Recommendation = Hire
    SubmitScorecard --> Rejected: Recommendation = Reject
    Offer --> Hired: Offer Accepted
    Rejected --> [*]
    Hired --> [*]
```

### Candidate Workflow Architecture

```mermaid
flowchart LR
    A[Browse Public Careers Board] --> B[Filter by Dept / Location / Exp]
    B --> C[View Job Detail Page]
    C --> D[Submit Application + Resume PDF]
    D --> E[Check Email Verification]
    E -- Verified --> F[Application Created]
    E -- Unverified --> G[Prompt Email Verification]
    F --> H[Track Progress in Candidate Portal]
```

---

## 6. Analytics Aggregation Pipeline

Executive metrics are aggregated from MongoDB collections using single-pass pipeline queries in `analyticsController.ts`:

- **Active / Closed Requisitions**: Computed via `Job.countDocuments({ status, deletedAt: null })`.
- **Stage Distribution**: Aggregated via `$group` pipeline on `Application.stage`.
- **Offer Acceptance Rate**: Computed as $\frac{\text{Hired}}{\text{Hired} + \text{Offers Pending}} \times 100$.
- **Average Time to Hire**: Calculated by measuring the date difference ($\text{updatedAt} - \text{createdAt}$) for applications in `hired` stage.
- **Stale Application Alerts**: Queries active applications where `updatedAt` is older than 7 days.

---

## 7. Database Schema & Data Modeling

```mermaid
erDiagram
    USER ||--o{ JOB : creates
    USER ||--o{ APPLICATION : applies
    JOB ||--o{ APPLICATION : receives
    APPLICATION ||--o{ INTERVIEW : schedules
    USER ||--o{ INTERVIEW : conducts
    INTERVIEW ||--o| SCORECARD : evaluates
    APPLICATION ||--o{ ACTIVITYLOG : tracks

    USER {
        ObjectId _id
        string firebaseUid
        string name
        string email
        string role
        boolean isActive
        boolean isEmailVerified
    }

    JOB {
        ObjectId _id
        string title
        string description
        string department
        string location
        number minExperience
        number maxExperience
        string status
        ObjectId createdBy
        date deletedAt
    }

    APPLICATION {
        ObjectId _id
        ObjectId candidate
        ObjectId job
        string stage
        number experience
        string phone
        string country
        string address
        string linkedinUrl
        string resumeUrl
        boolean termsAccepted
    }

    INTERVIEW {
        ObjectId _id
        ObjectId application
        ObjectId interviewer
        string type
        date scheduledAt
        string status
    }

    SCORECARD {
        ObjectId _id
        ObjectId interview
        ObjectId interviewer
        string recommendation
        number technicalRating
        string comments
    }

    ACTIVITYLOG {
        ObjectId _id
        string entityType
        ObjectId entityId
        string action
        ObjectId actor
        object metadata
    }
```

---

## 8. API Architecture

API endpoints follow RESTful design patterns:

| Resource | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Candidate self-registration |
| | `POST` | `/api/auth/verify-email` | Authenticated | Trigger email verification |
| **Jobs** | `GET` | `/api/jobs` | Public | List open job postings |
| | `POST` | `/api/jobs` | Recruiter / Admin | Create new job requisition |
| | `PUT` | `/api/jobs/:id` | Author / Admin | Update requisition details |
| | `DELETE`| `/api/jobs/:id` | Author / Admin | Soft-delete job requisition |
| **Applications** | `POST` | `/api/applications` | Candidate | Submit job application + resume PDF |
| | `GET` | `/api/applications/manage` | Recruiter / Admin | List manage applications pipeline |
| | `POST` | `/api/applications/:id/advance` | Recruiter / Admin | Advance application stage |
| | `POST` | `/api/applications/:id/reject` | Recruiter / Admin | Reject application with reason |
| | `GET` | `/api/applications/:id/resume` | Authenticated | Stream signed resume PDF |
| **Interviews** | `POST` | `/api/interviews` | Recruiter / Admin | Schedule interview session |
| | `GET` | `/api/interviews/admin` | Admin | Get interviewer assigned queue |
| **Scorecards** | `POST` | `/api/scorecards/interview/:id` | Admin | Submit interview scorecard |
| **Analytics** | `GET` | `/api/analytics/dashboard` | Recruiter / Admin | Retrieve executive analytics |

---

## 9. Deployment Architecture

```mermaid
graph LR
    User([Web User]) --> Vercel[Vercel / Static CDN<br/>React Client SPA]
    Vercel -->|HTTPS Requests| Render[Render / Node.js Host<br/>Express API Server]
    Render --> MongoAtlas[(MongoDB Atlas Cluster)]
    Render --> CloudinaryAPI[Cloudinary Cloud Storage]
    Render --> FirebaseAPI[Firebase Auth Service]
```

- **Client Hosting**: Single Page Application static bundle served via Vercel / static CDN.
- **Server Hosting**: Node.js environment hosted on Render / Railway executing compiled TypeScript JavaScript (`dist/index.js`).
- **Database**: MongoDB Atlas cloud cluster with automated index management.

---

## 10. Security Architecture

- **Token Security**: Server-side Firebase ID token verification on every protected request.
- **Row-Level IDOR Protection**: Verification checks ensuring non-admin recruiters cannot alter requisitions authored by other recruiters.
- **Duplicate Application Guard**: Compound unique database index `{ candidate: 1, job: 1 }` preventing active duplicate applications.
- **File Upload Safety**: Multer memory buffer processing restricting file types to `application/pdf` under 5MB, preventing local disk file inclusion.
- **HTTP Header Hardening**: Helmet integration setting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and Content Security Policy headers.
