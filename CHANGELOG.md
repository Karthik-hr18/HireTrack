# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-24

### Added
- Monorepo folder organization utilizing npm workspaces (`client`, `server`, `@hiretrack/shared`).
- Centralized Zod validation schemas for auth, job management, application submission, interview bookings, and scorecard uploads.
- Full Mongoose data models for User, Job, Application, Interview, Scorecard, and ActivityLog.
- Multi-tier authentication pipeline with Firebase ID token verification, JWT sessions, and RBAC middleware.
- Candidate self-registration with email verification enforcement.
- Executive analytics dashboard with real-time MongoDB aggregation pipelines for active jobs, applicant volume, funnel metrics, and stale candidate alerting.
- Automated interview scheduling and collapsed hiring recommendation scorecard system.
- SEO enhancements: canonical URLs, Open Graph / Twitter metadata, sitemap.xml, SoftwareApplication & FAQPage JSON-LD.
- Accessibility features including `@media (prefers-reduced-motion: reduce)` support and reusable SkeletonLoader components.
- Architecture documentation (`docs/architecture.md`) and case study (`docs/case-study.md`).
- 37 Vitest integration tests covering end-to-end user workflows and state machine logic.
