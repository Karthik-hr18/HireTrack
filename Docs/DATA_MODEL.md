# DATA_MODEL.md — HireTrack

MongoDB (Mongoose). Embed vs. reference and denormalization decisions are explained inline where they
were a deliberate System Design call, not a default.

---

## User

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | required |
| `email` | String | required, unique, indexed |
| `passwordHash` | String | bcrypt, cost ≥ 12 |
| `role` | Enum: `candidate \| recruiter \| admin` | required |
| `isActive` | Boolean | default `true`; Admin deactivates Recruiters via this, not deletion |
| `resetTokenHash` | String, nullable | SHA-256 hash of reset token, never the raw token |
| `resetTokenExpiresAt` | Date, nullable | 15–30 min TTL from issuance |
| `createdAt` / `updatedAt` | Date | |

**Index:** `email` (unique).

---

## Job

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `title` | String | required |
| `description` | String | required |
| `requirements` | String | |
| `location` | String | |
| `status` | Enum: `open \| closed` | required |
| `createdBy` | ObjectId → User | Recruiter/Admin who created it |
| `deletedAt` | Date, nullable | **soft delete only** — Applications and ActivityLog reference Jobs and must not be orphaned |
| `createdAt` / `updatedAt` | Date | |

**Index:** `status` (careers page filters to `open` + `deletedAt: null`).

---

## Application

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `candidate` | ObjectId → User | required |
| `job` | ObjectId → Job | required |
| `source` | Enum: `careers_page \| linkedin \| naukri \| referral \| campus \| recruiter_added` | required |
| `stage` | Enum: `applied \| resume_screening \| interview_scheduled \| interview_completed \| final_review \| offer \| hired \| rejected` | required, default `applied` — enforced forward-only by the state machine (see SYSTEM_DESIGN.md) |
| `resumeUrl` | String | Cloudinary URL |
| `resumeSnapshotAt` | Date | resume as submitted at *this* application's time |
| `rejectionReason` | Enum, nullable: `skills_mismatch \| experience_mismatch \| withdrew \| salary_expectations \| other` | required if `stage === rejected` |
| `rejectionNote` | String, nullable | optional free text |
| `notes` | Array of `{ author: ObjectId → User, text: String, createdAt: Date }` | **embedded**, not a separate collection — small, bounded per-candidate volume |
| `createdAt` / `updatedAt` | Date | `updatedAt` drives the 3-day staleness check on the Recruiter dashboard |

**Indexes:** compound `{ job: 1, stage: 1 }` (pipeline views, stage counts); `{ source: 1 }` (source-tracking dashboard); `{ candidate: 1 }` (one active application per job constraint, candidate's own list).

**Business rule enforced at the application layer, not the schema:** one *active* (non-`hired`,
non-`rejected`) application per candidate per job — checked before insert, not a unique index, since a
candidate re-applying after a past rejection must be allowed.

---

## Interview

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `application` | ObjectId → Application | required |
| `interviewer` | ObjectId → User | required, `role: admin` only |
| `scheduledAt` | Date | required |
| `status` | Enum: `scheduled \| completed` | set to `completed` automatically when its Scorecard is submitted |
| `createdAt` | Date | |

**Index:** compound `{ interviewer: 1, status: 1 }` — powers the Admin's "my assigned interviews" view.

---

## Scorecard

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `interview` | ObjectId → Interview | required, **1:1** — one scorecard per interview |
| `recommendation` | String | required |
| `comments` | String | required |
| `ratings` | Mixed, nullable | optional numeric ratings |
| `submittedBy` | ObjectId → User | must equal `interview.interviewer` |
| `createdAt` | Date | immutable after creation — no update endpoint exists for this collection |

**Index:** `{ interview: 1 }` (unique — enforces the 1:1 relationship).

---

## ActivityLog

Single shared collection across all loggable entity types — one query shape, easy to extend later.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `entityType` | Enum: `application \| job \| user` | |
| `entityId` | ObjectId | polymorphic reference, resolved at query time based on `entityType` |
| `action` | String | e.g. `stage_changed`, `rejected`, `scorecard_submitted`, `job_created` |
| `actor` | ObjectId → User | who performed the action |
| `metadata` | Mixed | e.g. `{ from: 'applied', to: 'resume_screening' }` |
| `createdAt` | Date | |

**Index:** compound `{ entityType: 1, entityId: 1, createdAt: -1 }` — powers the Candidate Timeline
(reverse-chronological, per entity) and also serves as the audit trail required by the NFRs.

---

## Relationships Summary

```
User (candidate) ─┬─< Application >─┬─ Job
                   │                 │
                   │                 └─< Interview >── User (admin, as interviewer)
                   │                                        │
                   │                                        └── Scorecard (1:1)
                   │
                   └─< ActivityLog (via entityType='application')
```
