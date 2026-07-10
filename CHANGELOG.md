# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Monorepo folder organization utilizing npm workspaces (`client`, `server`, `@hiretrack/shared`).
- Zod validation schemas for registration, login, job management, interview bookings, and scorecard uploads.
- Complete set of Mongoose models representing users, open jobs, applications, interviews, scorecards, and activity timelines matching `DATA_MODEL.md`.
- JWT authentication pipeline and Role-Based Access Control (RBAC) middleware verifying user states and restricting route endpoints.
- Database seeding script (`npm run db:seed`) to populate default Admin credentials on deploy.
- Premium landing UI hello-world card for client verification.
- Vitest integration testing suite verifying security, schemas, and middleware gating logic.
- CI pipeline workflow via GitHub Actions checking compile actions and Vitest checks.
