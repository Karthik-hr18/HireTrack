# HireTrack

HireTrack is a modern, enterprise-grade B2B Applicant Tracking System (ATS) designed to streamline talent acquisition for growing organizations. It unifies public candidate sourcing, multi-stage pipeline management, interview scheduling, evaluator scorecards, and hiring analytics into a single responsive control tower.

---

## Features

### Candidate
- **Public Careers Portal:** Clean, searchable job board with real-time department, location, experience, and employment type filtering.
- **Fast Application Process:** Submit resume attachments, portfolio URLs, current employment details, and referral notes in seconds.
- **Candidate Portal & Tracking:** Real-time visibility into application stage progress, scheduled interviews, and offer updates.
- **Instant Search:** 300ms debounced search bar querying indexed job postings instantly.

### Recruiter
- **Pipeline Kanban & Table View:** Move candidates seamlessly across recruitment stages (`Applied`, `Screening`, `Interview Scheduled`, `Offer`, `Hired`, `Rejected`).
- **Interview Scheduler:** Schedule technical and HR panel interviews with automated notification dispatches.
- **Structured Scorecards:** Capture multi-evaluator feedback, ratings, and collapsed hiring recommendations.
- **Rejection Tracking:** Standardized rejection reason categorizations with structured feedback notes.

### Authentication
- **Secure Sessions:** `httpOnly`, `Secure`, `SameSite=Lax` cookie session management with JWT bearer header fallback.
- **Email Verification:** Account verification pipeline for self-registered candidate accounts.
- **Password Reset:** Single-use SHA-256 hashed password reset token workflow with automatic expiration.

### Analytics
- **Executive Dashboard:** Live metrics for total active job requisitions, total inbound applications, active candidate pipelines, and offer acceptance rates.
- **Recruitment Funnel:** Stage-by-stage conversion and drop-off analytics.
- **Department Insights:** Aggregated requisitions, candidate volume, and hiring health per business unit.
- **Sourcing Channels:** Breakdown of applicant acquisition sources.

### Security
- **Strict Role-Based Access Control (RBAC):** Access control enforcing route authorization across `candidate`, `recruiter`, and `admin` roles.
- **Row-Level IDOR Protection:** Object ownership verification ensuring non-admin recruiters can only modify their own job requisitions.
- **HTTP Header Hardening:** `helmet()` integration for `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`.
- **API Rate Limiting:** Brute-force protection on authentication endpoints.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, React Helmet Async, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (`strict: true`)
- **Database:** MongoDB Atlas, Mongoose ODM with compound `$text` search indexes
- **Authentication:** JWT, Cookie-Parser, Bcrypt (cost factor 12)
- **Validation:** Zod schemas shared across client and server workspaces (`@hiretrack/shared`)
- **Testing:** Vitest, Supertest
- **Security:** Helmet, Express Rate Limit

---

## Architecture

HireTrack is built as an `npm workspaces` monorepo containing three core packages:

```
                      ┌─────────────────────────┐
                      │    @hiretrack/shared    │
                      │ (Zod Schemas & Types)   │
                      └────────────┬────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │   hiretrack-client   │ ────── HTTP ───► │   hiretrack-server   │
   │    (Vite / React)    │                  │   (Node / Express)   │
   └──────────────────────┘                  └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │    MongoDB Atlas     │
                                             └──────────────────────┘
```

The `@hiretrack/shared` package serves as the single source of truth for validation schemas and TypeScript interfaces, guaranteeing end-to-end type safety between client forms and Express API handlers.

---

## Folder Structure

```
HireTrack/
├── packages/
│   └── shared/               # Shared Zod schemas & TypeScript definitions
│       ├── src/
│       │   ├── validation.ts
│       │   └── types.ts
│       └── package.json
├── server/                   # Express REST API application
│   ├── src/
│   │   ├── config/           # Database & cloud storage configurations
│   │   ├── controllers/      # Route controllers (Auth, Jobs, Applications, Analytics)
│   │   ├── middleware/       # Auth, RBAC, Rate Limiting, Error Handling
│   │   ├── models/           # Mongoose Data Schemas
│   │   ├── routes/           # Express Route Definitions
│   │   └── test/             # Vitest Integration Test Suites
│   └── package.json
├── client/                   # Vite / React Web Client
│   ├── src/
│   │   ├── components/       # UI Components & Layouts
│   │   ├── pages/            # Page Views (Careers, Candidate, Recruiter, Admin)
│   │   ├── hooks/            # Custom Hooks (useDebounce, etc.)
│   │   └── types/            # Client-specific interfaces
│   └── package.json
├── .github/                  # Issue & PR Templates
├── package.json              # Monorepo root workspace configuration
└── README.md
```

---

## Installation

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/hiretrack`) or MongoDB Atlas connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/Karthik-hr18/HireTrack.git
cd HireTrack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Shared Schemas
```bash
npm run build:shared
```

### 4. Configure Environment Variables

Create `.env` inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hiretrack
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Create `.env` inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 5. Seed Initial Database Accounts
```bash
npm run db:seed
```

---

## 🔑 Seed Accounts & Demo Credentials

When the database is seeded (`npm run db:seed`), the following pre-configured accounts are synchronized across Firebase Authentication and MongoDB:

### 🛡️ Administrator Account

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Administrator | `karthikhr676@gmail.com` | `Karthik@64` |

### 👥 Recruiter Accounts

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Recruiter** | Sarah Jenkins | `sarah.j@hiretrack.io` | `RecruiterPass123!` |
| **Recruiter** | Marcus Vance | `marcus.vance@hiretrack.io` | `RecruiterPass123!` |
| **Recruiter** | Elena Rostova | `elena.r@hiretrack.io` | `RecruiterPass123!` |

---

## API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new candidate account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue session cookie | Public |
| `POST` | `/api/auth/logout` | Clear session cookies | Authenticated |
| `GET` | `/api/jobs` | Search & filter public open job requisitions | Public |
| `POST` | `/api/jobs` | Create new job posting | Recruiter / Admin |
| `PATCH` | `/api/jobs/:id` | Update job requisition details or status | Recruiter (Owner) / Admin |
| `GET` | `/api/applications` | List applications with pagination and filters | Recruiter / Admin |
| `POST` | `/api/applications` | Submit candidate application | Candidate |
| `PATCH` | `/api/applications/:id/stage` | Transition application pipeline stage | Recruiter / Admin |
| `POST` | `/api/interviews` | Schedule candidate interview | Recruiter / Admin |
| `POST` | `/api/scorecards` | Submit evaluator scorecard | Recruiter / Admin |
| `GET` | `/api/analytics/overview` | Fetch high-level executive dashboard metrics | Recruiter / Admin |

---

## Security

- **JWT & HTTP-Only Cookies:** Tokens are set in `httpOnly`, `Secure`, `SameSite=Lax` cookies, shielding authentication state against XSS.
- **RBAC (Role-Based Access Control):** Declarative middleware verifying user roles before processing privileged endpoints.
- **Password Security:** Passwords hashed using `bcrypt` with cost factor 12.
- **Input Validation:** Incoming request bodies parsed against strict Zod schemas.
- **Rate Limiting:** IP-based rate limiting on sensitive routes to protect against brute-force attacks.
- **Password Reset Security:** Cryptographically secure 32-byte hex reset tokens stored as SHA-256 hashes with short expiration windows.

---

## Performance

- **Responsive Design:** Fluid layouts optimized for mobile, tablet, and desktop viewports using CSS custom properties.
- **Debounced Inputs:** Search inputs debounced by 300ms to reduce backend load during typing.
- **Compound Database Indexes:** MongoDB text indexes on frequently searched fields for fast query execution.
- **Loading & Empty States:** Skeleton UI indicators and fallback views across data-fetching components.

---

## Future Improvements

- Add WebSocket support for real-time Kanban board updates during panel interviews.
- Integrate automated email dispatches using Nodemailer / Resend for production environments.
- Add multi-tenant support for enterprise organization subdomains.

---

## License

This project is licensed under the [MIT License](LICENSE).
