# HireTrack Applicant Tracking System

HireTrack replaces the spreadsheet-and-inbox chaos small hiring teams use to track candidates with one clean pipeline — so a growing company can hire like a company with a real ATS, without enterprise complexity.

Built as a single-company Applicant Tracking System for organizations with 50-250 employees.

---

## ⚡ Tech Stack

* **Frontend**: React + TypeScript (Strict), Vite, React Query, React Router v6
* **Styling**: Vanilla CSS (Rich dark design system)
* **Backend**: Node.js + Express + TypeScript (Strict), Express Rate Limit, Morgan
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JWT (Authorization Header, In-Memory storage on client)
* **File Storage**: Cloudinary (PDF resumes only, server-mediated upload)
* **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)
* **CI/CD**: GitHub Actions (Linting + Compilation check + Vitest integration tests)

---

## ⚙️ Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

| Variable | Description | Example / Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection URL | `mongodb://127.0.0.1:27017/hiretrack` |
| `JWT_SECRET` | Secret token signing JWT hashes | `your_secret_string` |
| `ADMIN_EMAIL` | Initial Admin Username | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial Admin Password | `admin_password` |
| `PORT` | API Listening port | `5000` |

---

## 🚀 Quick Start

### 1. Prerequisite Installations
Ensure you have Node.js (v18+) and MongoDB installed and running locally, or use a MongoDB Atlas cluster.

### 2. Install Project Dependencies
Run at the root folder:
```bash
npm install
```

### 3. Build Shared Packages
Compile Zod schemas and shared types:
```bash
npm run build:shared
```

### 4. Seed Administrator Credentials
Seed the database with the default Admin credentials using the values set in your `.env` configuration file:
```bash
npm run db:seed
```

### 5. Boot Up Server & Client Workspaces
Start development environments:
* **Backend Server**: `npm run dev:server` (Listens on port `5000`)
* **React Client**: `npm run dev:client` (Listens on port `5173`)

---

## 🧪 Testing Instructions

Run the automated integration tests verifying authentication, schemas, and RBAC security gates:
```bash
npm run test
```

---

## 🔑 Demo Access

Once seeded, you can log in using:
* **Admin User**:
  - Email: `karthikhr676@gmail.com`
  - Password: `Karthik@64`
* **Candidate**: Register an account directly via the client signup interface.
