# HireTrack — Modern B2B Applicant Tracking System (ATS)
### Digital Heroes Full-Stack Developer Trial — v1.0.0 Production Release

[![CI Pipeline](https://github.com/Karthik-hr18/HireTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Karthik-hr18/HireTrack/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-indigo.svg)](https://github.com/Karthik-hr18/HireTrack/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](file:///c:/Users/karth/Projects/HireTrack/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-brightgreen.svg)](file:///c:/Users/karth/Projects/HireTrack/client/tsconfig.json)

**HireTrack** is a high-performance, enterprise-grade B2B Applicant Tracking System (ATS) engineered for modern talent acquisition teams. Built inspired by industry standards like Lever, Greenhouse, Linear, and Stripe, HireTrack simplifies candidate sourcing, job distribution, technical interview scheduling, collaborative scorecard evaluations, and hiring pipeline analytics.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Screenshots & UI Showcase](#-screenshots--ui-showcase)
6. [Demo & Credentials](#-demo--credentials)
7. [Getting Started](#-getting-started)
8. [API Overview](#-api-overview)
9. [Security Architecture](#-security-architecture)
10. [Testing & Quality Assurance](#-testing--quality-assurance)
11. [Deployment & Infrastructure](#-deployment--infrastructure)
12. [Performance & UX Engineering](#-performance--ux-engineering)
13. [Project Structure](#-project-structure)
14. [Engineering Decisions & Trade-Offs](#-engineering-decisions--trade-offs)
15. [Future Roadmap](#-future-roadmap)
16. [Documentation Directory](#-documentation-directory)

---

## 🎯 Project Overview

### Product Vision & Problem Statement
Traditional hiring workflows are plagued by scattered candidate communications, slow candidate screening cycles, opaque referral pipelines, and fragmented interview feedback. Talent acquisition teams require a centralized, lightning-fast operational control center that unifies public job distribution, resume processing, multi-interviewer feedback aggregation, and talent analytics.

### Why HireTrack Exists
HireTrack bridges the gap between public candidate engagement and internal hiring operations:
- **For Candidates**: Provides an ultra-frictionless application experience with native PDF resume previews, mobile-responsive job tracking, and transparent status updates.
- **For Recruiters & Admins**: Delivers a Lever-style multi-stage Kanban workspace with 0ms visual drag-and-drop feedback, automated candidate sourcing tags, integrated technical interview scheduling, and structured scorecard evaluations.

---

## ✨ Key Features

### 👤 Candidate Experience
- **Public Careers Portal (`/careers`)**: Searchable, filterable open job directory with responsive salary ranges, department tags, and location filters.
- **Instant Application Flow (`/jobs/:id`)**: Single-page candidate submission with PDF resume attachment upload (up to 5MB limit).
- **Candidate Portal & Resume Preview**: In-app native PDF viewer with full-screen preview and downloadable portfolio links.
- **Duplicate Application Prevention**: Server-enforced duplicate application checks per candidate email per job opening.

### 💼 Recruiter & Talent Operations
- **Lever-Style Recruiter Workspace (`/dashboard`)**: Persistent sidebar grouping jobs by department, active stage counts, and active status indicators.
- **Optimistic Kanban Pipeline**: Drag-and-drop candidate stage transitions (*New Applied*, *Resume Screening*, *Phone Screen*, *Technical Interview*, *Offer*, *Hired*, *Rejected*).
- **Candidate Slide-Out Detail Panel**: 6-tab operational view (*Overview*, *Resume*, *Timeline*, *Notes*, *Interviews*, *Scorecards*).
- **Manual Sourcing & Referrals**: Sourced candidate creation modal supporting *Referral*, *LinkedIn*, and *Direct Outreach* tracking.

### 📅 Technical Interviews & Scorecard Reviews
- **Interview Scheduling**: Book interviewers, set dates/times, and trigger automated candidate email notifications.
- **Structured Scorecards**: 4-point rating system (*Overall Rating*, *Technical Skills*, *Communication*, *Problem Solving*) with structured recommendations (*Strong Hire*, *Hire*, *No Hire*, *Strong No Hire*).

### 📊 Analytics & Operational Metrics
- **Interactive KPI Dashboard (`/dashboard`)**: Candidate pipeline metrics, interview conversion rates, stage distribution breakdown, and sourcing channel funnels computed using MongoDB aggregation pipelines.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 + Vite | Lightning-fast HMR and optimized JSX rendering bundle. |
| **Styling** | Vanilla CSS3 + Modern Tokens | 4px/8px design grid system, glassmorphism UI, smooth 250ms transitions. |
| **Backend API** | Node.js + Express + TypeScript | Strongly typed REST API server with custom RBAC middleware. |
| **Database** | MongoDB Atlas + Mongoose ODM | Document store supporting aggregation pipelines for hiring analytics. |
| **Validation** | Zod (Shared Monorepo Package) | Single source of truth for request body validation on client & server. |
| **Authentication**| JWT + bcryptjs (Cost 12) | In-memory token storage with bcrypt password hashing & SHA-256 reset tokens. |
| **Cloud Storage** | Cloudinary API | Resume PDF upload streaming and asset delivery. |
| **Testing** | Vitest + Supertest | Unit & integration test suite executing 34 passing tests against MongoDB. |
| **Deployment** | Vercel (Client) + Render (Server) | Global CDN frontend distribution paired with containerized backend service. |

---

## 🏗️ Architecture

HireTrack is structured as a monorepo leveraging `npm workspaces` to enforce type safety and code reuse across the stack:

```
                          ┌──────────────────────────┐
                          │    @hiretrack/shared     │
                          │ (Zod Schemas & TS Types) │
                          └─────────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        ┌──────────────────────┐                ┌──────────────────────┐
        │   hiretrack-client   │                │   hiretrack-server   │
        │    (Vite / React)    │  ── HTTP/JWT ──►   (Node / Express)   │
        └──────────────────────┘                └──────────┬───────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────────┐
                                                │    MongoDB Atlas     │
                                                └──────────────────────┘
```

---

## 🌐 Demo & Credentials

- **Live Deployed Web Application**: [https://hiretrack-client.vercel.app](https://hiretrack-client.vercel.app)
- **Live Production API Server**: `https://hiretrack-server.onrender.com/health`
- **GitHub Repository**: [https://github.com/Karthik-hr18/HireTrack](https://github.com/Karthik-hr18/HireTrack)

### Default Seeding Credentials
| Role | Email Address | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `admin123` | Full System & Recruiter Provisioning |
| **Lead Recruiter** | `karthikhr676@gmail.com` | `karthik123` | Full Recruiter Workspace & Kanban Access |
| **Sample Candidate** | `candidate@example.com` | `candidate123` | Candidate Portal & Job Application Tracking |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas Connection URI

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Karthik-hr18/HireTrack.git
   cd HireTrack
   ```

2. **Install Workspace Dependencies**:
   ```bash
   npm install
   ```

3. **Compile Shared Validation Package**:
   ```bash
   npm run build:shared
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in `server/`:
   ```bash
   cp server/.env.example server/.env
   ```
   Fill in required credentials:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hiretrack?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Seed Database with Production Demo Data**:
   ```bash
   npm run db:seed --workspace=server
   ```

6. **Start Local Development Servers**:
   ```bash
   # Terminal 1: Backend Server (Port 5000)
   npm run dev:server

   # Terminal 2: Frontend Vite Client (Port 5173)
   npm run dev:client
   ```

7. **Run Vitest Integration Suite**:
   ```bash
   npm run test --workspace=server
   ```

---

## 📡 API Overview

The HireTrack backend exposes a RESTful API with Zod request validation and JWT authorization:

| Category | Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Public | Register new candidate account |
| **Auth** | `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT |
| **Auth** | `/api/auth/forgot-password` | `POST` | Public | Request password reset token |
| **Auth** | `/api/auth/reset-password` | `POST` | Public | Reset password via single-use token |
| **Jobs** | `/api/jobs` | `GET` | Public | Fetch open job listings |
| **Jobs** | `/api/jobs` | `POST` | Staff | Create new job posting |
| **Applications** | `/api/applications` | `POST` | Public/Candidate | Submit candidate application & PDF resume |
| **Applications** | `/api/applications/:id/stage` | `PATCH` | Staff | Update application pipeline stage |
| **Interviews** | `/api/interviews` | `POST` | Staff | Schedule technical interview |
| **Scorecards** | `/api/applications/:id/scorecards` | `POST` | Staff | Submit interviewer scorecard |
| **Analytics** | `/api/analytics/overview` | `GET` | Staff | Fetch hiring pipeline metrics |

*For complete endpoint schemas and payloads, consult [Docs/API_SPEC.md](file:///c:/Users/karth/Projects/HireTrack/Docs/API_SPEC.md).*

---

## 🔒 Security Architecture

- **Password Hashing**: Passwords are hashed using `bcrypt` with cost factor 12.
- **Single-Use Reset Tokens**: Reset tokens use 32-byte cryptographically secure random generation, SHA-256 token hashing at rest, and 30-minute TTL expiration.
- **Role-Based Access Control (RBAC)**: Express middleware (`authenticate`, `authorize`) enforces endpoint access levels (`admin`, `recruiter`, `candidate`).
- **Auth Rate Limiting**: Sensitive auth routes (`/login`, `/reset-password`) are rate-limited to **5 attempts per 15 minutes per IP** via `express-rate-limit`.
- **File Attachment Security**: Resume uploads are strictly allow-listed for PDF mime-types and capped at 5MB.

---

## 🧪 Testing & Quality Assurance

HireTrack includes an automated integration test suite built with Vitest and Supertest executing 34 tests across 8 test suites:

- **Authentication & RBAC**: Password hashing, duplicate registration handling, JWT verification, and unauthorized route access blocks.
- **Password Reset Flow**: Single-use token generation, password updating, and expired token rejection.
- **Application Pipeline**: Application creation, PDF resume validation, duplicate protection, and stage transitions.
- **Interview & Scorecards**: Interview scheduling, scorecard calculation, and stage advancement.
- **Analytics & Seeding**: MongoDB aggregation pipelines and stage metrics calculation.

---

## 📂 Project Structure

```
HireTrack/
├── .github/ workflows/ ci.yml       # GitHub Actions CI workflow
├── Docs/                            # Project Documentation Directory
│   ├── API_SPEC.md                  # Complete API REST specification
│   ├── architecture.md              # System design & architecture tradeoffs
│   ├── DATA_MODEL.md                # Mongoose collection & schema reference
│   ├── MASTER_PROJECT_SPEC.md       # Handbook requirements specification
│   ├── POST_RELEASE_TECH_DEBT.md    # Post-release maintenance backlog
│   ├── PRD.md                       # Product Requirements Document
│   └── PROJECT_AUDIT.md             # Consolidated Master Audit & Release Report
├── packages/
│   └── shared/                      # Shared npm workspace (@hiretrack/shared)
│       └── src/
│           ├── types.ts             # Shared TypeScript entity interfaces
│           └── validation.ts        # Shared Zod validation schemas
├── server/                          # Backend Express Application Workspace
│   ├── src/
│   │   ├── config/                  # DB and Cloudinary configuration
│   │   ├── controllers/             # Express route controllers
│   │   ├── middleware/              # Auth, RBAC, Rate Limiting & Error handlers
│   │   ├── models/                  # Mongoose Schema definitions
│   │   ├── routes/                  # Express Router definitions
│   │   ├── scripts/                 # Database seed & migration scripts
│   │   └── test/                    # Vitest integration test suites
│   ├── package.json
│   └── tsconfig.json
├── client/                          # Frontend React/Vite Application Workspace
│   ├── src/
│   │   ├── components/              # Shared UI components & Modals
│   │   ├── hooks/                   # Custom React data & workspace hooks
│   │   ├── pages/                   # Application views (Careers, Dashboard, Auth)
│   │   ├── index.css                # Design system token definitions & global CSS
│   │   └── App.tsx                  # Client routing & layout definitions
│   ├── package.json
│   └── tsconfig.json
├── CHANGELOG.md                     # Semantic versioning changelog
├── CONTRIBUTING.md                  # Open source contribution guide
├── LICENSE                          # MIT Open Source License
├── README.md                        # Master repository README
└── package.json                     # Monorepo root workspace configuration
```

---

## 💡 Engineering Decisions & Trade-Offs

1. **Why Monorepo with npm Workspaces?**  
   Consolidating the client, server, and shared schemas in a single monorepo guarantees 100% type synchronicity. When a Zod validation rule or entity interface is updated in `@hiretrack/shared`, compiler checks instantly catch breaking changes across both client forms and server controllers.

2. **Why Vanilla CSS Tokens instead of TailwindCSS?**  
   Vanilla CSS with CSS custom variables was selected to maintain maximum control over the design system, animations, glassmorphic backdrop filters, and responsive grid layouts without relying on utility class bloat.

3. **In-Memory JWT Headers vs. `httpOnly` Cookies**:  
   JWT bearer tokens transmitted via HTTP headers were chosen over `httpOnly` cookies to simplify cross-domain CORS communication between independent deployment platforms (Vercel CDN frontend and Render backend containers).

---

## 🔮 Future Improvements

- **Axios HTTP Interceptors**: Refactor direct `fetch` calls to a centralized Axios client with automatic 401 token refresh interceptors.
- **CSS Modularization**: Split monolithic `index.css` into modular partials (`tokens.css`, `public.css`, `recruiter.css`).
- **Dynamic OpenGraph Previews**: Implement server-side dynamic social media meta image generation for individual job postings.

---

## 📄 Documentation Directory

- [Docs/PROJECT_AUDIT.md](file:///c:/Users/karth/Projects/HireTrack/Docs/PROJECT_AUDIT.md) — Master Pre-Release Audit & Handbook Compliance Report.
- [Docs/architecture.md](file:///c:/Users/karth/Projects/HireTrack/Docs/architecture.md) — Architectural Overview & System Trade-Offs.
- [Docs/API_SPEC.md](file:///c:/Users/karth/Projects/HireTrack/Docs/API_SPEC.md) — Complete REST API Endpoint Specification.
- [Docs/DATA_MODEL.md](file:///c:/Users/karth/Projects/HireTrack/Docs/DATA_MODEL.md) — Database Schema & Collection Definitions.
- [Docs/POST_RELEASE_TECH_DEBT.md](file:///c:/Users/karth/Projects/HireTrack/Docs/POST_RELEASE_TECH_DEBT.md) — Stabilization Phase Technical Debt Backlog.
- [CHANGELOG.md](file:///c:/Users/karth/Projects/HireTrack/CHANGELOG.md) — Version Release History.
- [CONTRIBUTING.md](file:///c:/Users/karth/Projects/HireTrack/CONTRIBUTING.md) — Contribution & Code Guidelines.
- [LICENSE](file:///c:/Users/karth/Projects/HireTrack/LICENSE) — MIT License.
