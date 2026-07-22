# MASTER_PROJECT_SPEC.md
### Digital Heroes — Full Stack Developer Trial
### Reverse-Engineered Engineering Specification

**Method:** Every sentence of the handbook (Document 2) was treated as a potential evaluation criterion. Explicit statements are extracted directly; requirements the handbook clearly implies but never states outright are labeled **(IMPLICIT REQUIREMENT)**. Each item is scored **Priority: Critical / High / Medium / Low** based on (a) how directly it maps to a weighted rubric line in Section 20, (b) whether the "Common Mistakes" or "Submission Checklist" sections independently flag it, and (c) whether ignoring it is fatal (app doesn't work / isn't gradable) vs. cosmetic.

---

## TABLE OF CONTENTS

1. Project Philosophy
2. Reviewer Mindset (Reverse-Engineered)
3. Product Requirements
4. UI/UX Principles
5. Engineering Rules
6. AI Workflow (Claude in Antigravity)
7. Evaluation Checklist (Master Reviewer Checklist)
8. Hidden / Implicit Requirements
9. Common Mistakes
10. Action Plan Template
11. Final Scorecard Template

---

# PART 1 — PROJECT PHILOSOPHY

### 1.1 "Ship like a senior engineer"
- **Requirement:** The deliverable must be a live, working, deployed product — not a code sample, not a prototype, not a take-home puzzle answer.
- **Explanation:** The founder explicitly separates this task from "a quiz, a take-home puzzle, or a whiteboard exercise." The unit of evaluation is a shipped product a stranger can click, break, and read the code behind.
- **Why reviewers care:** Anyone can talk about architecture; few can carry an idea from empty repo to a polished, deployed, documented app. That gap is the actual signal being measured.
- **What happens if ignored:** A submission that only runs on localhost or exists as a GitHub repo with no live URL is disqualifying by the handbook's own logic ("An undeployed project does not exist").
- **How to implement:** Deploy from day one (see Pro Hacks: "Deploy a hello-world to production on day one"), keep it deployed continuously, treat the live URL as the primary artifact.
- **How to verify:** Open the live URL in an incognito window on a fresh machine/network and complete the core flow with zero prior context.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 1.2 Depth over breadth, finish over features
- **Requirement:** Build fewer features to a high standard rather than many features half-finished.
- **Explanation:** "A todo app built with obsessive craft beats an ERP built carelessly." This is stated as the literal grading philosophy.
- **Why reviewers care:** Feature count is cheap to fake; polish, edge-case handling, and finish are not — they're the actual proxy for engineering judgment.
- **What happens if ignored:** A large, ambitious, but shallow app will score *worse* than a small, complete one across nearly every rubric line (Product Quality, UI/UX Craft, Code Quality all penalize half-done work).
- **How to implement:** Pick one core entity/workflow, fully implement all four states (loading/empty/error/success) and full CRUD for it before adding a second feature area.
- **How to verify:** For every feature in the app, confirm it has no dead ends, no TODOs, no partially wired UI.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 1.3 What is judged: judgment and taste, not framework trivia
- **Requirement:** Technology choices are secondary; decision quality and attention to detail are primary.
- **Explanation:** "I'm not impressed by how many frameworks you can name... Judgment. Taste. Whether you sweat the details a user will notice and a reviewer will respect."
- **Why reviewers care:** Frameworks are learnable in a weekend; judgment under ambiguity is the actual hiring signal for a real engineering role.
- **What happens if ignored:** Over-indexing on stack novelty ("I used 5 different exotic libraries") without polish reads as breadth-chasing, which the philosophy explicitly penalizes.
- **How to implement:** Use the recommended, boring, job-relevant default stack (Section 9) unless you have a genuinely stronger reason not to; spend the saved time on craft.
- **How to verify:** Ask "would removing this technology choice change the user's experience?" If not, it wasn't worth the risk.
- **Priority:** High
- **Explicit/Implicit:** Explicit

### 1.4 The two-question lens (build through the end user's eyes)
- **Requirement:** Every screen and feature must pass: (a) "Is my UI instantly obvious?" — usable with no manual, no training, on the first try; (b) "Is the functionality genuinely useful?" — would it save a real person real time/money/effort if shipped tomorrow.
- **Explanation:** Presented as the master filter that "matters more than any framework you pick," to be applied *before and during* every decision, not just at the end.
- **Why reviewers care:** It's a fast, repeatable heuristic reviewers themselves will apply when they open the app cold.
- **What happens if ignored:** Features that require explanation, or that don't map to a real workflow, read as demo-ware rather than product.
- **How to implement:** For every screen, write one sentence answering each question before building it; if you can't answer "yes" honestly, redesign or cut the feature.
- **How to verify:** Hand the live app to someone unfamiliar with the project with zero instructions and watch where they hesitate.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 1.5 What makes a "bad" vs "excellent" project **(IMPLICIT REQUIREMENT)**
- **Requirement:** A bad project is broad, shallow, undeployed, undocumented, and inconsistent; an excellent project is narrow, deep, deployed, documented, and consistent end-to-end (product, code, docs, repo hygiene all at the same bar).
- **Explanation:** Never stated as a single sentence, but derivable by combining Sections 1–2, the Common Mistakes table, and the Evaluation rubric weights — all three independently converge on the same definition.
- **Why reviewers care:** It's the composite standard the entire rubric operationalizes.
- **What happens if ignored:** Optimizing one dimension (e.g., a beautiful UI on top of a broken backend, or vice versa) still fails the composite bar.
- **How to implement:** Track a single running checklist across product, code, docs, and repo simultaneously rather than finishing one dimension fully before starting the next.
- **How to verify:** Score yourself against Part 7 (master checklist) before submission — every category must clear the bar, not just your favorite one.
- **Priority:** High
- **Explicit/Implicit:** Implicit

### 1.6 AI is a force multiplier, not a crutch
- **Requirement:** You must be able to explain and defend every line Claude generated; the tool accelerates you, it doesn't replace your judgment or review.
- **Explanation:** Listed explicitly as one of the seven things you must prove ("Work with AI like a pro — direct Claude in Antigravity as a force multiplier, not a crutch").
- **Why reviewers care:** Unreviewed AI output is a liability (per the workflow section: "Claude confidently invents API signatures, and the bug it hands you costs more than the code it saved").
- **What happens if ignored:** Leftover AI attribution comments, unreviewed hallucinated code, or an inability to explain your own codebase is explicitly listed as a Common Mistake.
- **How to implement:** Review every diff line-by-line before accepting (see Part 6); strip AI attribution/TODO comments before submission.
- **How to verify:** Pick any random file in the repo and be able to explain, without looking, what it does and why it's structured that way.
- **Priority:** High
- **Explicit/Implicit:** Explicit

---

# PART 2 — REVIEWER MINDSET (REVERSE-ENGINEERED)

### 2.1 What the reviewer is actually looking for
- **Requirement:** Evidence of end-to-end ownership: a working product, real data modeling, tasteful UI, senior-readable code, live operation, and clear communication (README/docs/case study) — all present simultaneously.
- **Explanation:** Directly enumerated in Section 2 ("Objectives — What You Will Prove") as seven proof points, each with an evidence-based framing ("with evidence, not claims").
- **Why reviewers care:** These seven objectives map almost 1:1 onto the eight weighted rubric categories in Section 20 — they are the rubric in prose form.
- **What happens if ignored:** Any objective left unaddressed directly reduces at least one weighted category.
- **How to implement:** Use the seven objectives as a pre-submission gate — one pass item each.
- **How to verify:** Map each of the seven bullets in Section 2 to a specific, pointable artifact (a URL, a file, a screenshot) before submitting.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 2.2 First-impression signal: the first ten seconds of the repo
- **Requirement:** Repo root must be clean, structure must be self-explanatory, README must not be the framework default.
- **Explanation:** "A reviewer forms an opinion in the first ten seconds of opening your repo."
- **Why reviewers care:** It's an explicit anchoring-bias admission — early signal disproportionately colors the rest of the review.
- **What happens if ignored:** A messy root or default README (explicitly listed as a Common Mistake) creates a negative prior before the reviewer evaluates functionality at all.
- **How to implement:** Follow the exact folder structure in Section 10; replace the README day one, not at the end.
- **How to verify:** Open the repo in a fresh browser tab as if you were a stranger; time how long it takes to understand what the product is and how to run it.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 2.3 First-impression signal: the live URL, first 60 seconds
- **Requirement:** A stranger must complete the core job-to-be-done in under 60 seconds with zero dead ends.
- **Explanation:** Stated verbatim as the "excellent" bar for the highest-weighted rubric category (Product Quality & Functionality, 20%).
- **Why reviewers care:** It's the single highest-weighted line item in the entire rubric.
- **What happens if ignored:** Friction, confusion, or a dead end in the primary flow caps your score in the most heavily weighted category regardless of how good other categories are.
- **How to implement:** Time yourself (and ideally someone else) completing the primary flow from the landing page; cut anything that isn't needed for that path to be obvious.
- **How to verify:** Stopwatch test with a first-time user, cold.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 2.4 Instant score reducers / rejection triggers
- **Requirement:** Console errors, broken deploy, missing auth, no persistence, leaked secrets, default README, one giant commit, and broken mobile layout are treated as near-automatic penalties.
- **Explanation:** Directly enumerated in the "Common Mistakes" table (Section 18) and cross-referenced in the "Before you call it deployed" checklist (Section 13) and Submission Checklist (Section 19).
- **Why reviewers care:** These are binary, fast-to-check signals — a reviewer can verify each in seconds, which is why they're used as gates before deeper evaluation.
- **What happens if ignored:** Any one of these can plausibly zero out the corresponding rubric category (e.g., leaked secret → Deployment & Reliability and GitHub Professionalism both fail).
- **How to implement:** Run through Section 18 and Section 19 literally as a pre-submission gate; open DevTools console and drive it to zero warnings/errors.
- **How to verify:** Fresh clone → `.env.example` → install → run, exactly as a stranger would, with console open throughout.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 2.5 What genuinely impresses (beyond the baseline) **(IMPLICIT REQUIREMENT)**
- **Requirement:** Evidence of real product thinking — an opinionated take on a real problem, a hard architectural decision explained, meaningful automated tests, and at least a few "Bonus Points" items executed well (not bolted on superficially).
- **Explanation:** Synthesized from Section 21 ("Bonus Points... do not bolt on all of them") combined with the Originality & Attention to Detail rubric line (8%) and the case-study requirement ("one hard problem" in the portfolio post).
- **Why reviewers care:** Baseline competence is necessary but not differentiating at scale; the founder explicitly wants to move candidates from "good candidate" to "obvious hire," which requires a signal above the checklist floor.
- **What happens if ignored:** A fully checklist-compliant but generic clone-of-an-idea submission likely scores as "good" but not "exceptional," per the explicit distinction drawn in Section 21's framing.
- **How to implement:** Pick 2–4 Bonus Points that naturally fit your chosen idea (not all ten) and execute them to the same craft bar as the core product; write the case study's "hard problem" section honestly.
- **How to verify:** Ask: does this bonus item make the product measurably better, or does it exist only to be listed? Cut anything in the latter category.
- **Priority:** Medium
- **Explicit/Implicit:** Implicit

---

# PART 3 — PRODUCT REQUIREMENTS

Grouped exactly per Section 08 ("Functional Requirements") plus the categories the master prompt calls out that Section 08 subsumes (Analytics/Dashboard/Notifications are implicit via project-idea selection, not universal).

## 3.1 Authentication
- **Requirement:** Email+password signup with Argon2id (or bcrypt cost ≥12) hashing; email verification required before write access is granted.
- **Explanation:** Explicit, with named algorithms and a minimum cost factor.
- **Why reviewers care:** Weak hashing is a checkable, binary security failure; it's the kind of detail that signals whether "server-side validation" and "real auth" (the handbook's two "hard rules") were actually respected.
- **What happens if ignored:** Directly fails the "Auth & Access" functional requirement and the Trust & Safety category; likely zeroes the security portion of Code Quality & Architecture.
- **How to implement:** Use Auth.js/NextAuth, Clerk, or Supabase Auth (Section 9 — "never hand-roll crypto"); configure Argon2id/bcrypt via the library's adapter, not manually.
- **How to verify:** Inspect the stored password hash format in the DB; confirm unverified accounts cannot perform write operations.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

- **Requirement:** Sessions stored in httpOnly, Secure, SameSite=Lax cookies; session ID rotated on login and on every privilege change.
- **Explanation:** Explicit, framed as defense against session fixation.
- **Why reviewers care:** It's a specific, well-known vulnerability class (session fixation) reviewers with security awareness will check for.
- **What happens if ignored:** Session hijacking / fixation vulnerability; fails Trust & Safety.
- **How to implement:** Configure cookie flags at the framework/auth-library level; call session regeneration on login and role-change code paths.
- **How to verify:** Inspect Set-Cookie headers in DevTools Network tab; confirm session ID changes value after login and after a role change.
- **Priority:** High
- **Explicit/Implicit:** Explicit

- **Requirement:** Password reset via single-use token, hashed at rest, 15–30 min TTL, invalidated on first use; never email the plaintext password.
- **Explanation:** Explicit with concrete TTL bounds.
- **Why reviewers care:** Long-lived or reusable reset tokens are a common real-world breach vector; the specificity (15–30 min) signals the reviewer will check the actual expiry behavior, not just its presence.
- **What happens if ignored:** Fails Trust & Safety; a stale/reusable reset link is a demonstrable, reproducible vulnerability a reviewer can test in minutes.
- **How to implement:** Generate a cryptographically random token, store only its hash, set an expiry column, delete/invalidate on use.
- **How to verify:** Use a reset link twice — the second use must fail; wait past TTL and confirm expiry.
- **Priority:** High
- **Explicit/Implicit:** Explicit

- **Requirement:** RBAC (owner/admin/member/viewer) enforced server-side in middleware on every route; never trust a client-sent role.
- **Explanation:** Explicit, named roles given as an example set.
- **Why reviewers care:** Client-trusted authorization is one of the most common and most damaging real-world vulnerabilities; it's also directly listed as a Bonus Point ("Role-based access — admin vs. member with enforced permissions"), meaning its *absence* is noticeable and its *presence* is rewarded twice (baseline + bonus).
- **What happens if ignored:** Fails Trust & Safety outright; a reviewer can trivially test this by editing a client-side role value or replaying a request.
- **How to implement:** Central authorization middleware/guard function invoked on every mutating route; role check happens server-side against the DB-stored role, never a client payload.
- **How to verify:** Attempt a privileged action as a lower-privilege account via direct API call (not just UI); it must be rejected server-side.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

- **Requirement:** Rate-limit login/reset to ~5 attempts / 15 min per IP+account, with exponential backoff.
- **Explanation:** Explicit with concrete numbers.
- **Why reviewers care:** Prevents credential stuffing; concrete numeric thresholds signal this is meant to be literally tested, not just conceptually present.
- **What happens if ignored:** Fails Trust & Safety's rate-limiting requirement, which is listed twice (auth-specific and again for "sensitive routes" generally).
- **How to implement:** Token-bucket or fixed-window limiter middleware keyed on IP+account identifier.
- **How to verify:** Script 6+ rapid failed login attempts and confirm a 429 response with backoff.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

- **Requirement:** OAuth (Google/GitHub) wired through a vetted library, never a hand-rolled token exchange.
- **Explanation:** Explicit; framed as optional ("Wire OAuth... ") but the "never hand-roll" instruction is absolute if OAuth is included at all.
- **Why reviewers care:** Hand-rolled OAuth is a classic source of subtle, hard-to-audit vulnerabilities.
- **What happens if ignored:** Only applies if OAuth is implemented; if present and hand-rolled, it's a red flag under Trust & Safety.
- **How to implement:** Use Auth.js/NextAuth's built-in providers.
- **How to verify:** Confirm the OAuth flow goes through the library's callback handler, not custom token-exchange code.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

## 3.2 Authorization
- **Requirement:** Authorize every mutation at the row level — verify the actor owns the resource, not merely that they are logged in.
- **Explanation:** Explicit, distinct from RBAC (this is object-level, not role-level, authorization).
- **Why reviewers care:** This is the IDOR (Insecure Direct Object Reference) vulnerability class — extremely common in real apps and trivially testable by a reviewer swapping an ID in a request.
- **What happens if ignored:** A logged-in user could edit/delete another user's data; this is a severe, testable Trust & Safety failure.
- **How to implement:** Every update/delete query includes a `WHERE owner_id = current_user_id` (or equivalent) clause, or an explicit ownership check before the mutation executes.
- **How to verify:** As User A, attempt to mutate a resource ID belonging to User B via direct API call; must be rejected.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

## 3.3 CRUD
- **Requirement:** Full create/read/update/delete on core entities with server-generated IDs and `created_at`/`updated_at` timestamps.
- **Explanation:** Explicit baseline.
- **Why reviewers care:** It's the literal minimum bar the handbook sets ("These are the table stakes. If any category is missing, the product reads as a demo, not software").
- **What happens if ignored:** Missing CRUD operations fail the Submission Checklist item verbatim ("Core CRUD works: create, read, update, delete — verified by hand").
- **How to implement:** Standard REST/server-action endpoints per entity; IDs generated server-side (UUID or auto-increment), never client-supplied.
- **How to verify:** Manually exercise create → read → update → delete for every core entity end-to-end on the live deployment.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

- **Requirement:** Shared Zod schema validates identical rules on both client and server.
- **Explanation:** Explicit — "one shared Zod schema so the browser and the API reject the exact same bad input."
- **Why reviewers care:** Prevents client/server validation drift, a common source of bugs and a security gap (client-only validation is trivially bypassed).
- **What happens if ignored:** API can accept invalid data even if the UI blocks it; fails "server-side validation," one of the handbook's five explicit hard rules.
- **How to implement:** Define validators in a shared `lib/validators` module imported by both the form layer and the API/server-action layer.
- **How to verify:** Send an invalid payload directly to the API (bypassing the UI) and confirm rejection with a proper error.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

- **Requirement:** Optimistic UI for high-success mutations (toggles, reorders), with rollback + error toast on failure.
- **Explanation:** Explicit; also reappears as a Bonus Point ("Real-time or optimistic UI — the product feels instant").
- **Why reviewers care:** Distinguishes a "senior" UX instinct from default blocking-spinner behavior; rewarded twice in the rubric (baseline UX + bonus).
- **What happens if ignored:** Not fatal alone, but caps UI/UX Craft score below "excellent" tier, which explicitly expects "designed loading/skeleton" states throughout.
- **How to implement:** Update local state immediately on user action, fire the mutation in the background, revert state + show a toast if the server rejects it.
- **How to verify:** Simulate a failed mutation (e.g., throttle network + force an error) and confirm the UI reverts cleanly with a visible error toast.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

- **Requirement:** Explicit pending state on submit — disabled button + spinner — so double-submits are structurally impossible.
- **Explanation:** Explicit.
- **Why reviewers care:** Double-submit bugs are a classic, embarrassing, easily-reproduced failure a reviewer will hit by double-clicking.
- **What happens if ignored:** Duplicate records on double-click; fails "State Coverage" functional requirement.
- **How to implement:** Disable the submit control and show a loading indicator for the duration of the in-flight request.
- **How to verify:** Rapidly double-click every submit button in the app; confirm only one record/mutation results.
- **Priority:** High
- **Explicit/Implicit:** Explicit

- **Requirement:** Soft-delete via `deleted_at` where recovery matters; cascade rules defined explicitly, not inherited by accident.
- **Explanation:** Explicit.
- **Why reviewers care:** Undefined cascade behavior is a real-world data-loss risk; explicitness signals deliberate schema design (tested separately under "Schema-first development").
- **What happens if ignored:** Accidental data loss on delete of a parent record; a reviewer probing delete behavior on a related entity could surface this.
- **How to implement:** Add `deleted_at` nullable timestamp column where relevant; define `ON DELETE CASCADE/RESTRICT/SET NULL` per foreign key intentionally in the schema/migration.
- **How to verify:** Delete a parent record with children and confirm the actual behavior matches the documented intent (e.g., in `docs/architecture.md`).
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

- **Requirement:** Every write returns the mutated record so the client reconciles state without a second GET.
- **Explanation:** Explicit API design convention.
- **Why reviewers care:** Reduces round-trips and race conditions; a small but real signal of API design maturity.
- **What happens if ignored:** Minor — extra network calls, possible stale-state bugs; affects Code Quality/Architecture at the margin.
- **How to implement:** API/server actions return the full updated row (or relevant subset) in the mutation response.
- **How to verify:** Inspect the network response body of a PATCH/POST/DELETE call; confirm it contains the resulting record.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

## 3.4 Search
- **Requirement:** Server-side search with ~300ms debounced input, backed by a trigram or full-text index — not client-side array filtering.
- **Explanation:** Explicit, with a concrete debounce value and an explicit rejection of the naive approach.
- **Why reviewers care:** Client-side filtering doesn't scale and signals a demo-level implementation; the handbook explicitly contrasts this as the wrong approach.
- **What happens if ignored:** Search "works" on 10 rows in a demo but is flagged as not production-grade; fails "Finding Data" requirement literally.
- **How to implement:** Postgres `pg_trgm` or full-text (`tsvector`) index; debounce the input handler client-side before firing the query.
- **How to verify:** Seed a larger dataset (hundreds+ rows) and confirm search remains responsive and returns correct results without shipping the whole table to the client.
- **Priority:** High
- **Explicit/Implicit:** Explicit

## 3.5 Filters
- **Requirement:** Filters combine with clear AND semantics and are mirrored into the URL query string (shareable state, working back-button).
- **Explanation:** Explicit.
- **Why reviewers care:** URL-synced state is a well-known "taste" signal (Linear/Notion-style apps do this); its absence is a subtle but noticeable gap for anyone who's studied "category leaders" as instructed in Section 5.
- **What happens if ignored:** Filter state lost on refresh/back-navigation; fails "Finding Data" and dents UI/UX Craft.
- **How to implement:** Sync filter state to `useSearchParams`/URL query params; parse on load to restore state.
- **How to verify:** Apply filters, refresh the page, and use the browser back button; state must persist/restore correctly.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

## 3.6 Sorting
- **Requirement:** Sort on indexed columns, ascending/descending, with a stable secondary sort on `id` to prevent page jitter.
- **Explanation:** Explicit, including the specific stability fix.
- **Why reviewers care:** Sort jitter under pagination is a subtle bug most junior implementations miss entirely — its presence/absence is a clean differentiator.
- **What happens if ignored:** Rows visibly reorder/duplicate/skip across paginated pages — a reproducible bug a careful reviewer will find by paging through sorted data.
- **How to implement:** `ORDER BY <sort_column> <dir>, id <dir>` in every sorted query; index the sortable columns.
- **How to verify:** Sort a list with many rows sharing the same value in the sort column; page through and confirm no duplicates/omissions.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

## 3.7 Pagination
- **Requirement:** Cursor/keyset pagination for large sets (offset degrades past ~10k rows); default page size 25, hard cap 100.
- **Explanation:** Explicit with concrete numbers and a stated performance threshold.
- **Why reviewers care:** Signals awareness of real-world scale, not just happy-path demo data; the concrete numbers suggest a reviewer may specifically probe page-size limits.
- **What happens if ignored:** Fails "Finding Data" and likely fails "Search / filter / sort / pagination behave under real data volume" on the Submission Checklist.
- **How to implement:** Keyset pagination (`WHERE id > :cursor ORDER BY id LIMIT :n`) instead of `OFFSET`; enforce page-size cap server-side regardless of client request.
- **How to verify:** Request a page size above 100 directly via API and confirm it's clamped, not honored as-is.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

- **Requirement:** Distinguish "no matches for this filter" from "no data yet," with a one-click reset for the former.
- **Explanation:** Explicit.
- **Why reviewers care:** Conflating these two empty states is a common, easily-noticed UX miss; distinguishing them is called out specifically enough to suggest reviewers check it.
- **What happens if ignored:** Confusing UX when filters return zero results; dents both "State Coverage" and UI/UX Craft.
- **How to implement:** Two distinct empty-state components/copy variants, conditioned on whether any filter/search is active.
- **How to verify:** Apply a filter guaranteed to return zero results and confirm the copy/CTA differs from the true first-run empty state.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

## 3.8 Analytics / Dashboard / Notifications **(IMPLICIT REQUIREMENT)**
- **Requirement:** If the chosen project idea implies a dashboard (most of the 60+ ideas do — "dashboard-heavy" is explicitly recommended), it must load meaningful, real data above the fold for a returning user; notifications (if included) should differentiate in-app/email/push and support batching.
- **Explanation:** Not a standalone functional-requirements bullet in Section 08, but Section 04 explicitly steers toward "CRUD-rich and dashboard-heavy" ideas "because it naturally exercises auth, roles, data modeling, search, and analytics," and Section 05's research checklist explicitly asks candidates to study "what loads above the fold for a returning user" and "in-app vs. email vs. push, badge/toast/inbox split, batching" on category-leader products.
- **Why reviewers care:** If you picked a dashboard-shaped idea (likely, given the idea list), the dashboard's quality is a de facto proxy for your overall data-modeling and product-thinking skill, even though it isn't its own rubric line.
- **What happens if ignored:** A dashboard that's just a table dump (no real aggregation/insight) undercuts "Product Quality & Functionality" and "Originality & Attention to Detail."
- **How to implement:** Design the dashboard's default view around the single most useful thing a returning user needs to see immediately (per the research exercise in Section 5).
- **How to verify:** Ask a first-time returning user what they'd do next after landing on the dashboard; the answer should be obvious without guidance.
- **Priority:** Medium
- **Explicit/Implicit:** Implicit

## 3.9 Forms & Validation
- **Requirement:** Validate on both sides with the same Zod schema (see 3.3); field grouping, inline-validation timing, autosave vs. explicit save, tab order, and error-copy tone should be deliberate (per the research checklist).
- **Explanation:** The concrete validation mechanics are explicit (Section 08); the qualitative form-design expectations are implicit, drawn from the "What to extract" research list in Section 05 ("Forms: field grouping, inline-validation timing...").
- **Why reviewers care:** Forms are one of the highest-friction surfaces in any product; the handbook devotes an entire research bullet to reverse-engineering how category leaders do this, implying candidates are expected to apply the same care.
- **What happens if ignored:** Generic, unstyled, or poorly-timed validation (e.g., validating on every keystroke immediately, or not at all until submit) reads as un-researched, denting Originality & Attention to Detail.
- **How to implement:** Validate on blur or after a short debounce post-first-interaction, not on every keystroke from a pristine field; group related fields visually; make error copy specific ("Email is required" not "Invalid").
- **How to verify:** Fill out each form incorrectly, in the order a real user would, and confirm error timing/copy feels considered rather than default.
- **Priority:** Medium
- **Explicit/Implicit:** Implicit (mechanics explicit, design timing/tone implicit)

## 3.10 Uploads
- **Requirement:** Allow-list uploads by MIME type and size.
- **Explanation:** Explicit, under Trust & Safety.
- **Why reviewers care:** Unrestricted file upload is a classic attack vector (arbitrary file execution, storage abuse).
- **What happens if ignored:** Fails Trust & Safety if the app has any upload feature.
- **How to implement:** Server-side MIME/type/size validation (never trust the client-reported MIME type alone — verify actual content where feasible); reject and return a clear error otherwise.
- **How to verify:** Attempt to upload a disallowed file type/oversized file directly via API and confirm rejection.
- **Priority:** High (conditional — only if the app has uploads)
- **Explicit/Implicit:** Explicit

## 3.11 Exports
- **Requirement:** CSV/PDF export of any table view, streamed for large sets so the request survives past the ~30s gateway timeout.
- **Explanation:** Explicit, under "Beyond Basics," with a concrete timeout constraint.
- **Why reviewers care:** It's listed as a differentiator beyond table-stakes CRUD; the streaming detail signals awareness of serverless/gateway constraints (a real production concern, not a toy-app concern).
- **What happens if ignored:** Non-fatal if omitted entirely (it's "Beyond Basics," not core), but a naive synchronous export on a large dataset that times out would be a visible bug if attempted.
- **How to implement:** Stream the export response (chunked) rather than building the entire file in memory before responding.
- **How to verify:** Export a large seeded dataset and confirm it completes without timing out or blocking the UI.
- **Priority:** Low (Medium if included — must work correctly, not just exist)
- **Explicit/Implicit:** Explicit

## 3.12 Error Handling
- **Requirement:** Every async view resolves to loading/empty/error/success with no blank flash between; errors are actionable (friendly message + retry client-side, full stack trace logged server-side); routes wrapped in 404 + error boundary so a thrown render never becomes a white screen.
- **Explanation:** Explicit, multiple bullets under "State Coverage."
- **Why reviewers care:** This is repeated across at least four different sections (Functional Requirements, UI/UX Expectations, Common Mistakes, Submission Checklist) — the handbook's heaviest repetition of any single requirement, signaling it's the single most-checked behavior.
- **What happens if ignored:** Directly matches two separate Common Mistakes entries ("No empty, loading, or error states" and console errors); near-certain to be caught.
- **How to implement:** Wrap data-fetching in try/catch with typed error states; implement a route-level error boundary and a catch-all 404 page; never let a promise rejection reach an unhandled state in the UI.
- **How to verify:** Force a failure (kill the DB connection, throttle to offline, hit a nonexistent route) and confirm a graceful, on-brand error UI appears every time — never a white screen or raw stack trace to the user.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

## 3.13 Loading States
- **Requirement:** Skeletons matching final layout (not spinners) for known-shape content, to avoid CLS; block interaction on the affected region only, don't freeze the whole page.
- **Explanation:** Explicit, repeated in both Functional Requirements and UI/UX Expectations/Pro Hacks.
- **Why reviewers care:** Skeleton-vs-spinner is explicitly framed as a perceived-performance and CLS (Core Web Vitals) issue, which also feeds directly into the SEO/Performance rubric line.
- **What happens if ignored:** Generic spinners read as default/unfinished; layout shift from spinner→content transitions hurts CLS scoring.
- **How to implement:** Build skeleton components that mirror the exact dimensions of the eventual content.
- **How to verify:** Throttle network in DevTools and visually confirm skeleton shape matches loaded content with no jump.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

## 3.14 Empty States
- **Requirement:** Every empty state has a primary CTA ("Create your first X"); designed *before* the populated state, not as an afterthought.
- **Explanation:** Explicit in both Functional Requirements and Pro Hacks ("Design the empty state before the populated one — users hit 'zero items' first").
- **Why reviewers care:** New users always hit empty states first — the handbook explicitly notes this ordering matters more than intuition suggests.
- **What happens if ignored:** Matches a Common Mistake line item directly ("blank screen while fetching, white crash on failure" / no empty state).
- **How to implement:** Design and build the empty-state component alongside (or before) the populated-list component for each view.
- **How to verify:** Use the app as a brand-new user/account with zero data and confirm every list/table has a helpful, actionable empty state.
- **Priority:** High
- **Explicit/Implicit:** Explicit

## 3.15 Accessibility
- **Requirement:** WCAG 2.1 AA compliance — semantic HTML, modal focus traps, ARIA labels, 4.5:1 contrast, full keyboard operability.
- **Explanation:** Explicit, listed under both Functional Requirements ("Beyond Basics") and as its own weighted-adjacent line via UI/UX Craft ("Lighthouse a11y >= 95").
- **Why reviewers care:** It's independently verifiable via automated tooling (Lighthouse), making it a cheap, objective check a reviewer will very likely run.
- **What happens if ignored:** Directly caps UI/UX Craft (15% weight) below its "excellent" bar, which explicitly requires a11y ≥ 95.
- **How to implement:** Use semantic elements over div-soup, `shadcn/ui`-style accessible primitives, visible focus rings, ARIA attributes on custom components, and focus traps in modals.
- **How to verify:** Run Lighthouse Accessibility audit (target ≥95); manually tab through every flow with the mouse unplugged.
- **Priority:** High
- **Explicit/Implicit:** Explicit

## 3.16 Security **(consolidated from Trust & Safety)**
- **Requirement:** Escape all rendered user input (never raw HTML injection); parameterized queries/ORM everywhere; secrets server-side only (grep client bundle to confirm no `NEXT_PUBLIC_`-prefixed keys); CSP/HSTS/X-Content-Type-Options headers; CSRF protection on all state-changing requests; rate-limiting on sensitive routes with 429 + Retry-After.
- **Explanation:** Explicit, the full "Trust & Safety" bullet list in Section 08.
- **Why reviewers care:** This is the densest single cluster of concrete, testable security requirements in the handbook — and security failures (leaked secrets, SQL injection surface, XSS) are the fastest possible disqualifiers per Section 2.4.
- **What happens if ignored:** Any single item here failing is independently capable of tanking Trust & Safety, Deployment & Reliability, and GitHub Professionalism simultaneously (a leaked key fails all three).
- **How to implement:** Use framework auto-escaping (never `dangerouslySetInnerHTML` with user content); use Prisma/Drizzle (parameterized by default); set security headers via middleware/framework config; use the auth library's built-in CSRF protection; keep all secrets in platform env vars.
- **How to verify:** Grep the built client bundle for any secret-looking strings; run a header-inspection tool against the live URL; attempt a CSRF request from an external origin.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

## 3.17 Performance **(cross-referenced with SEO Section 14)**
- **Requirement:** LCP <2.5s, INP <200ms, CLS <0.1 at p75 (verified via real-world CrUX/PageSpeed data, not just a local lab run); Lighthouse ≥90 across all four categories, wired into CI to block regressions.
- **Explanation:** Explicit, with concrete Core Web Vitals thresholds.
- **Why reviewers care:** These are the same metrics Google uses for ranking and the same ones a reviewer can check in 30 seconds via PageSpeed Insights on your live URL — zero ambiguity, zero excuse.
- **What happens if ignored:** Directly fails the SEO & Discoverability rubric line's explicit bar ("Lighthouse SEO score of 100") and dents the general Performance/CWV expectation.
- **How to implement:** `next/image` for all images (AVIF/WebP, explicit dimensions), `next/font` self-hosted fonts, lazy-load below-the-fold content, preload the LCP asset, defer non-critical JS.
- **How to verify:** Run PageSpeed Insights against the deployed URL (not localhost) and confirm field data, not just lab score, clears thresholds.
- **Priority:** High
- **Explicit/Implicit:** Explicit

## 3.18 Responsive Design
- **Requirement:** Responsive from 320px up; touch targets ≥44px; zero horizontal scroll; tables collapse to cards on mobile; mobile-first design at breakpoints 640/768/1024/1280px.
- **Explanation:** Explicit, with concrete pixel values in both Functional Requirements and the UI/UX "Hard specs" table.
- **Why reviewers care:** It's independently listed as a Common Mistake ("Layout breaks below 400px") and a Submission Checklist item — a reviewer is essentially guaranteed to test at mobile width.
- **What happens if ignored:** Directly matches a named Common Mistake; fails Submission Checklist and dents UI/UX Craft.
- **How to implement:** Build mobile-first with Tailwind's responsive utility classes; test at 375px explicitly, not just "shrink the browser."
- **How to verify:** DevTools device mode at 320–375px on every screen; confirm no horizontal scrollbar and all tap targets are reachable.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

## 3.19 SEO **(see Part 4 detail below for the full breakdown; summarized here as a product requirement)**
- **Requirement:** The product must be technically discoverable — see Section 14 in full for the exhaustive list (meta tags, sitemap, robots.txt, structured data, OG images).
- **Priority:** High
- **Explicit/Implicit:** Explicit
*(Full breakdown deferred to Part 4 §4.9–4.14 to avoid duplication.)*

---

# PART 4 — UI/UX PRINCIPLES

### 4.1 Spacing on a strict 4px/8px grid
- **Requirement:** All margins, padding, gaps snap to the 4px base scale (4/8/12/16/24/32/48/64px), 8px as default rhythm. Any 13px/17px-style off-scale value is a bug, not a stylistic choice.
- **Explanation:** Explicit, with the exact scale given as a copyable token table.
- **Why reviewers care:** Off-grid spacing is one of the fastest tells of an un-designed, "vibe-coded" UI — trivially visible to a trained eye.
- **What happens if ignored:** Directly contradicts the "excellent" bar for UI/UX Craft ("One 4/8px spacing scale... reads as intentional, not Bootstrap-default").
- **How to implement:** Configure Tailwind's spacing scale to only expose the approved values; avoid arbitrary values (`p-[13px]`) entirely.
- **How to verify:** Inspect computed styles on a sample of elements; confirm every spacing value is a multiple of 4.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 4.2 Hierarchy by weight, not boxes
- **Requirement:** One primary action, one `<h1>` per view; rank elements via size/weight/color before reaching for borders or fill boxes.
- **Explanation:** Explicit.
- **Why reviewers care:** Over-boxed UIs (borders around everything) are a common novice pattern; restraint in hierarchy signals design maturity.
- **What happens if ignored:** Visually noisy, "everything is equally important" UI — dents UI/UX Craft and Originality.
- **How to implement:** Default to typographic weight/size/color for hierarchy; reserve borders/fills for genuine grouping needs.
- **How to verify:** Screenshot each screen and check there is exactly one dominant visual focal point.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 4.3 Restraint as the aesthetic
- **Requirement:** 3 neutral grays, 1 accent color, 1 border radius, 1 font family — every additional color/shadow/weight must be justified.
- **Explanation:** Explicit, framed as a hard constraint ("Every extra color, shadow, or weight is a decision you're forcing on the user").
- **Why reviewers care:** Matches the explicit design-inspiration target ("the quiet confidence of Linear, Stripe, and Vercel: restrained, fast, obvious").
- **What happens if ignored:** A visually inconsistent or "rainbow" UI reads as untrained taste, directly hurting UI/UX Craft.
- **How to implement:** Define design tokens (CSS variables / Tailwind theme) for exactly this palette and radius scale up front; enforce via code review against yourself.
- **How to verify:** Audit all colors/radii used across components; flag anything outside the defined token set.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 4.4 Motion only on state change, with strict timing
- **Requirement:** Animate only enter/exit, expand/collapse, position changes; 150–250ms, ease-out, 300ms hard cap; respect `prefers-reduced-motion` (disable entirely when set).
- **Explanation:** Explicit, with an exact easing curve (`cubic-bezier(0.4, 0, 0.2, 1)`) provided in the hard-specs table.
- **Why reviewers care:** Motion is one of the easiest things to overdo; the handbook is unusually prescriptive here, suggesting reviewers will actually feel/time animations.
- **What happens if ignored:** Animations feel laggy (>300ms) or gratuitous; also an explicit accessibility failure if `prefers-reduced-motion` is ignored.
- **How to implement:** Use CSS transitions/Framer Motion configured to these exact durations and easing; add a media-query or JS check for reduced-motion preference.
- **How to verify:** Time transitions with browser dev tools' animation inspector; toggle OS-level reduced-motion setting and confirm animations disable.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 4.5 All four states designed before the happy path
- **Requirement:** Empty, loading, error, and success states designed explicitly, in that order of priority, before styling the "normal" view.
- **Explanation:** Explicit in both UI/UX Expectations and Pro Hacks.
- **Why reviewers care:** Already covered in Part 3.12–3.14, but restated here as a *design process* rule, not just a feature checklist — the handbook cares about the order you work in, not just the end result.
- **What happens if ignored:** Rushed, inconsistent, or missing non-happy-path states — the single most repeated failure mode across the whole handbook.
- **How to implement:** Literally design/build empty → loading → error → success in that sequence for each view.
- **How to verify:** Confirm each view's four states exist as distinct, intentional designs (not one generic fallback reused everywhere).
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 4.6 Contrast ≥ WCAG AA
- **Requirement:** Body text ≥4.5:1, large text/UI/icons ≥3:1; placeholder-gray text does not count as real content if users must read it.
- **Explanation:** Explicit, with the placeholder-text clarification called out specifically.
- **Why reviewers care:** Directly testable via automated contrast checkers; the placeholder-text caveat suggests a specific, commonly-missed failure mode the reviewers have seen before.
- **What happens if ignored:** Fails accessibility checks and the UI/UX Craft "WCAG AA contrast" bar.
- **How to implement:** Choose token colors that pass contrast at the required ratios; never rely on placeholder attribute text alone for meaningful labels.
- **How to verify:** Run a contrast checker (e.g., via Lighthouse or axe) against every text/background combination.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 4.7 Keyboard as a first-class input
- **Requirement:** Every flow completable without a mouse; Tab order follows visual order; Cmd+K palette; Esc closes; Enter submits; visible focus ring on every control.
- **Explanation:** Explicit, and reappears as a Common Mistake avoidance item and a Bonus Point (command palette + shortcuts).
- **Why reviewers care:** It's called out in the Submission Checklist directly ("keyboard-navigable") and Pro Hacks ("Test keyboard-only... before calling it done").
- **What happens if ignored:** Fails accessibility and the Submission Checklist literally.
- **How to implement:** Ensure natural DOM order matches visual order (avoid CSS-only reordering that breaks tab flow); implement Esc/Enter handlers on modals/forms; never remove default focus outlines without replacing them.
- **How to verify:** Unplug the mouse and complete the core flow using only Tab/Enter/Esc/arrow keys.
- **Priority:** High
- **Explicit/Implicit:** Explicit

### 4.8 Dark mode designed, not inverted
- **Requirement:** If implemented, elevate surfaces via lighter grays (not shadows), desaturate accent colors, cap "white" text near 87% opacity to avoid halation on pure black.
- **Explanation:** Explicit, with a specific opacity figure.
- **Why reviewers care:** Naive CSS-filter dark mode is a well-known tell of low effort; also a named Bonus Point ("Dark mode done properly (system-aware, no flash)").
- **What happens if ignored:** Non-fatal if dark mode is simply omitted; fatal to the *bonus* credit if attempted poorly (worse than not attempting it at all, arguably, since it signals low craft rather than scope discipline).
- **How to implement:** Define a separate dark token set rather than `filter: invert()`; use system preference detection with no flash-of-wrong-theme on load.
- **How to verify:** Toggle OS dark mode and confirm no flash/wrong-theme on initial load; check text opacity/surface elevation against the 87% guidance.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 4.9–4.14 SEO Requirements (full breakdown)

- **4.9 Semantic HTML / on-page fundamentals**
  - **Requirement:** Exactly one `<h1>` and one `<main>` per route; proper `<nav>/<article>/<footer>` landmarks; unique `<title>` (50–60 chars, keyword front-loaded) and meta description (150–160 chars) per route; `<link rel="canonical">` with absolute URL on every page; `robots.txt` allowing crawl but blocking `/api` and preview deploys; `sitemap.xml` generated at build time with `<lastmod>`, submitted to Search Console/Bing; lowercase kebab-case paths with 301 redirects for trailing-slash variants.
  - **Explanation:** Explicit, exhaustively itemized in Section 14 "Technical Foundations."
  - **Why reviewers care:** SEO & Discoverability is a full 10%-weighted rubric category with an explicit "Lighthouse SEO score of 100" bar for excellence — unusually strict (100, not ≥90 like other categories).
  - **What happens if ignored:** Directly and severely caps the SEO & Discoverability rubric line; also independently listed as a Common Mistake ("Zero meta tags or OG image").
  - **How to implement:** Framework-level metadata APIs (e.g., Next.js Metadata API) per route; `next-sitemap` or a hand-written `app/sitemap.ts`.
  - **How to verify:** Run Lighthouse SEO audit on the deployed URL; manually check `view-source` for one `<h1>`/`<main>`, correct title/description length.
  - **Priority:** High
  - **Explicit/Implicit:** Explicit

- **4.10 Social/Sharing metadata**
  - **Requirement:** Full OG tags (title/description/url/type/site_name/image, absolute URLs) per route; Twitter Card tags (`summary_large_image` + title/description/image); a generated 1200×630 OG image (<8MB) per page via `opengraph-image.tsx`; `og:image:width/height/alt` set; validated in Facebook Sharing Debugger, LinkedIn Post Inspector, and Twitter Card Validator before launch — a local screenshot is explicitly stated as *not* proof.
  - **Explanation:** Explicit, with exact dimensions and named validator tools.
  - **Why reviewers care:** This is a specific, easy reviewer action — paste your URL into Slack/Twitter/LinkedIn and see if it renders correctly; also independently listed under the "Before you call it deployed" checklist.
  - **What happens if ignored:** Matches the Common Mistake "shared links render a blank grey card" exactly.
  - **How to implement:** Next.js `opengraph-image.tsx` / `ImageResponse` API for dynamic OG image generation.
  - **How to verify:** Paste the live URL into all three named validator tools and Slack/iMessage; confirm correct rendering in each.
  - **Priority:** Medium
  - **Explicit/Implicit:** Explicit

- **4.11 Structured Data (JSON-LD)**
  - **Requirement:** `SoftwareApplication` JSON-LD on the landing page (name, category, `operatingSystem: Web`, `offers` price 0, `aggregateRating` only if real); `FAQPage` JSON-LD matching visible FAQ copy verbatim; `BreadcrumbList` JSON-LD on docs pages matching the visible breadcrumb exactly; all JSON-LD server-rendered (`<script type="application/ld+json">`), never client-injected post-hydration; validated with zero errors/warnings in Google Rich Results Test and schema.org validator before merge.
  - **Explanation:** Explicit and unusually detailed — this is the most granular single requirement cluster in the entire handbook.
  - **Why reviewers care:** Structured data is invisible in the UI, so its presence signals genuine technical SEO diligence beyond what's visually obvious — a strong differentiator for the "excellent" tier.
  - **What happens if ignored:** Non-fatal to the core product but caps SEO & Discoverability below its top bar; the explicit "never client-injected after hydration" rule suggests reviewers may check via view-source specifically (client-injected JSON-LD won't appear there).
  - **How to implement:** Render JSON-LD server-side in the route's server component/page, not in a `useEffect`.
  - **How to verify:** View page source (not DevTools Elements panel) to confirm JSON-LD is present in the raw HTML; run Google's Rich Results Test.
  - **Priority:** Low
  - **Explicit/Implicit:** Explicit

- **4.12 Performance / Core Web Vitals**
  - *(See Part 3.17 — cross-referenced, not duplicated.)*

- **4.13 Content & Discovery**
  - **Requirement:** Real landing page copy (specific H1 value prop, no lorem/placeholder), crawlable static docs pages each targeting one search intent, a real FAQ feeding both `FAQPage` schema and AI-overview-style answers, README as the repo's front door, and bidirectional linking between landing/repo/docs.
  - **Explanation:** Explicit.
  - **Why reviewers care:** Placeholder/lorem content is an immediate, visible signal of an unfinished submission.
  - **What happens if ignored:** Reads as incomplete; dents both SEO and Originality & Attention to Detail.
  - **How to implement:** Write real, product-specific copy for every public-facing page before submission.
  - **How to verify:** Search the codebase for "lorem," "TODO," or placeholder text and eliminate all instances in user-facing copy.
  - **Priority:** Medium
  - **Explicit/Implicit:** Explicit

- **4.14 IA / Navigation research expectations (IMPLICIT REQUIREMENT)**
  - **Requirement:** Navigation should reflect deliberate information-architecture choices — sidebar vs. topbar, hierarchy depth, breadcrumbs, Cmd+K coverage — informed by studying category-leading products, not defaulted to a framework template.
  - **Explanation:** Never stated as a functional requirement directly, but Section 05's mandatory research exercise explicitly instructs candidates to study and extract "Navigation & IA: top-level item count, sidebar vs topbar, hierarchy depth, breadcrumbs, and Cmd+K palette coverage" from category leaders before writing code.
  - **Why reviewers care:** A reviewer familiar with the category (Linear, Notion, etc.) will notice if IA choices look arbitrary vs. considered.
  - **What happens if ignored:** Generic or confusing navigation dents both UI/UX Craft and Originality & Attention to Detail.
  - **How to implement:** Complete the Section 05 research exercise for real before designing navigation; document findings in a private research note as instructed.
  - **How to verify:** Compare your nav structure against your own research notes — can you justify every choice?
  - **Priority:** Low
  - **Explicit/Implicit:** Implicit

### 4.15 Tables/Lists, Forms, Modals, Cards, Buttons — token-driven consistency
- **Requirement:** One button component, one input component, one card component, all driven by shared design tokens; if two elements are 90% alike, make them identical or make the difference obviously intentional.
- **Explanation:** Explicit ("Consistency through tokens").
- **Why reviewers care:** Component drift (three slightly different-looking buttons) is a classic sign of copy-pasted, unreviewed code — directly relevant to Code Quality & Architecture as well as UI/UX Craft.
- **What happens if ignored:** Visually inconsistent UI; also likely correlates with duplicated component code, hurting Code Quality.
- **How to implement:** Build a small shared component library (`components/ui/`) and use it everywhere rather than one-off styled elements per screen.
- **How to verify:** Audit all buttons/inputs/cards in the app; confirm they all trace back to the same shared components.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 4.16 Input acknowledgment under 100ms
- **Requirement:** Hover/active/focus/disabled states on every control; instant press feedback (<100ms).
- **Explanation:** Explicit, with a numeric threshold.
- **Why reviewers care:** Missing interactive states is explicitly named as one of the four things separating "a demo from a product" (Pro Hacks, Polish & Detail).
- **What happens if ignored:** UI feels unresponsive/cheap; dents UI/UX Craft.
- **How to implement:** Define hover/active/focus/disabled Tailwind variants on every interactive component by default (e.g., via the shared component library from 4.15).
- **How to verify:** Interact with every button/input/link and visually confirm each state renders distinctly and immediately.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

---

# PART 5 — ENGINEERING RULES

### 5.1 TypeScript strict mode, zero `any`
- **Requirement:** TypeScript in strict mode with no use of `any`.
- **Explanation:** Explicit, and listed as one of only five "hard rules" in the entire handbook ("TypeScript strict... A real database... Real auth... Server-side validation... Secrets in env vars").
- **Why reviewers care:** It's one of the handbook's five non-negotiables — the shortest, most absolute list in the document — and directly named in the Code Quality rubric line ("TypeScript strict with zero `any`").
- **What happens if ignored:** Directly fails the explicit "hard rule" and the Submission Checklist ("TypeScript strict, no errors").
- **How to implement:** Enable `"strict": true` in `tsconfig.json`; type all function signatures, API responses, and component props explicitly; use `unknown` + narrowing instead of `any` where types are genuinely uncertain.
- **How to verify:** `tsc --noEmit` with zero errors; grep the codebase for `any` and eliminate/justify each instance.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 5.2 A real database (not localStorage)
- **Requirement:** Persistent server-side database (Postgres via Supabase/Neon, or SQLite for simple apps) — not client-only state or localStorage as the system of record.
- **Explanation:** Explicit hard rule; also the #1 entry in Common Mistakes ("data vanishes on refresh - no persistence").
- **Why reviewers care:** It's the most literal test of "is this a real product or a React demo" — a refresh test catches it in seconds.
- **What happens if ignored:** Immediate, obvious, first-minute failure for any reviewer who refreshes the page after creating data.
- **How to implement:** Provision Postgres via Supabase/Neon/Vercel Postgres; use Prisma or Drizzle as the ORM.
- **How to verify:** Create a record, hard-refresh the browser, confirm the data persists.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 5.3 Real auth (hard rule, cross-referenced)
- *(Full detail in Part 3.1 — cross-referenced here as an engineering-rules hard rule, not duplicated.)*
- **Priority:** Critical

### 5.4 Server-side validation (hard rule, cross-referenced)
- *(Full detail in Part 3.3 — shared Zod schema.)*
- **Priority:** Critical

### 5.5 Secrets in env vars, never in the repo (hard rule)
- **Requirement:** No secret or key ever committed to the repository; all secrets live in platform environment variables; nothing prefixed `NEXT_PUBLIC_` may be a secret.
- **Explanation:** Explicit hard rule, reinforced in Common Mistakes, Pro Hacks, and the "Before you call it deployed" checklist.
- **Why reviewers care:** It's the single most repeated concrete rule in the document (appears in at least 5 separate sections) — clearly the handbook's single biggest fear for candidates to trip on.
- **What happens if ignored:** Common Mistakes prescribes emergency remediation ("rotate the leaked key immediately... scrub history with `git filter-repo`") — implying this is treated as a severe, embarrassing failure, not a minor deduction.
- **How to implement:** `.env` in `.gitignore` from commit one; commit only `.env.example` with dummy values; set real values via the hosting platform's environment variable UI.
- **How to verify:** `git log -p | grep -i` for common secret patterns across full history; grep the built client bundle for key-shaped strings.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 5.6 Project structure / folder organization
- **Requirement:** Follow the prescribed repo layout: `.github/`, `docs/`, `prisma/`, `public/`, `src/{app,components,lib,server,types}`, `tests/`, `.env.example`, `.gitignore`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `README.md`; root kept to config files only, source lives in `src/`.
- **Explanation:** Explicit, given as a literal directory tree.
- **Why reviewers care:** Directly supports the "first ten seconds" first-impression principle (Part 2.2); a nonstandard or messy structure adds friction before any code is even read.
- **What happens if ignored:** Slower/frustrating review experience; likely dents GitHub Professionalism (10% weight).
- **How to implement:** Scaffold the repo to match this tree at project start, not retrofit it later.
- **How to verify:** Diff your repo's top-level structure against the prescribed tree.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 5.7 Schema-first / type-first development
- **Requirement:** Design the DB schema and shared TypeScript types before writing feature code; lock the migration and types so every downstream generation inherits the same contract.
- **Explanation:** Explicit, both as a general engineering rule and as one of the "Copy-ready prompts" for Claude.
- **Why reviewers care:** Prevents schema churn ("the most expensive kind" per Pro Hacks) and type drift between features — a structural quality signal visible in the git history (schema commits before feature commits).
- **What happens if ignored:** Inconsistent or duplicated type definitions across features; messy migration history.
- **How to implement:** Write `prisma/schema.prisma` (or equivalent) and a shared `types/` module first; only then build endpoints/UI against that contract.
- **How to verify:** Check git log — do schema/migration commits precede the feature commits that depend on them?
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 5.8 Testing philosophy
- **Requirement:** Tests should be meaningful, not coverage theatre — an e2e test of the critical path beats high line-coverage of trivial code; tests are written alongside (or before) implementation, confirmed to fail first, then implementation proceeds until green.
- **Explanation:** Explicit — "Automated tests that matter — an e2e test of the critical path, not coverage theatre" (Bonus Points) plus the "Demand tests in the same turn" AI-workflow rule.
- **Why reviewers care:** Distinguishes genuine engineering discipline from box-checking; explicitly named as a Bonus Point, meaning its absence isn't fatal but its presence (done right) is rewarded.
- **What happens if ignored:** Non-fatal (tests are Bonus, not core), but the Submission Checklist does require "lint and tests pass in CI" if tests exist at all — so partial/broken tests are worse than none.
- **How to implement:** Vitest for unit tests, Playwright for e2e; write the critical-path e2e test (signup → core CRUD flow) first.
- **How to verify:** Confirm the test suite actually runs and passes in CI, and that at least one e2e test covers the true critical path end-to-end.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 5.9 Git workflow / commit hygiene
- **Requirement:** Small, atomic, imperative-mood commits with Conventional Commits prefixes (`feat:`, `fix:`, `docs:`, `refactor:`); feature branches, never pushing straight to `main`; PR descriptions explain "what changed and why"; rebase on `main` before opening a PR; a tagged `v1.0.0` release once core is done.
- **Explanation:** Explicit, detailed across Sections 15, 17, and Common Mistakes.
- **Why reviewers care:** "Reviewers read your git log to judge how you think, not just the final diff" — stated explicitly; it's an independent, low-effort-to-check signal (git log is one click away).
- **What happens if ignored:** Directly matches two named Common Mistakes ("One squashed 'initial commit'" and "'fix', 'fix2', 'asdf', 'final-final'" commit messages) — described as something that "screams junior."
- **How to implement:** Commit after each logically complete unit of work, using Conventional Commit prefixes; work in feature branches; open PRs even solo, with a real description.
- **How to verify:** Read your own git log top to bottom as if you were a stranger — does it tell a coherent build story?
- **Priority:** High
- **Explicit/Implicit:** Explicit

### 5.10 Documentation as you build
- **Requirement:** Write documentation (especially architectural decisions) at the moment the decision is made, not reconstructed afterward.
- **Explanation:** Explicit — "Document as you build... A five-line note the moment you make a choice is worth an hour of archaeology later."
- **Why reviewers care:** Docs written after the fact tend to be generic/incomplete; the handbook explicitly frames real-time documentation as higher quality, not just faster.
- **What happens if ignored:** Thin or generic architecture docs; likely correlates with a weaker "why" section in `docs/architecture.md`.
- **How to implement:** Maintain a running decisions log (even informally) in `docs/architecture.md` throughout the build, not as a final task.
- **How to verify:** Check timestamps/commit history on doc files — were they updated incrementally alongside feature commits, or all at once at the end?
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 5.11 API design conventions
- **Requirement:** Mutations return the mutated record (see 3.3); consistent method/path conventions; documented per-endpoint (method, path, inputs, output, auth required).
- **Explanation:** Explicit under Documentation Requirements.
- **Why reviewers care:** Undocumented APIs slow a reviewer trying to understand the system, working against the "senior can add a feature in one sitting" Code Quality bar.
- **What happens if ignored:** Dents Documentation (10%) and Code Quality (15%) simultaneously.
- **How to implement:** A short table in `docs/` (or an OpenAPI file) listing every endpoint/server action with its contract.
- **How to verify:** Cross-check the documented endpoint list against the actual routes in `src/app` / `src/server`.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 5.12 Naming conventions / comments **(IMPLICIT REQUIREMENT — general code-quality bar)**
- **Requirement:** Comment the *why*, never the *what*; good naming should make most comments unnecessary; no 500-line "God components"; clear module boundaries.
- **Explanation:** Explicit for the comments rule; the "God component"/module-boundary language comes directly from the Code Quality rubric line, generalized here as a standing engineering rule rather than a one-off grading note.
- **Why reviewers care:** Directly quoted in the rubric's "excellent" bar for Code Quality & Architecture (15% weight): "no 500-line God components, no dead code; a senior can add a feature in one sitting without asking where anything lives."
- **What happens if ignored:** Caps Code Quality & Architecture below its top tier even if functionality is otherwise complete.
- **How to implement:** Extract components/functions once they exceed roughly one screen of code; name things for what they represent, not implementation detail; delete dead code and generated scaffolding before submission.
- **How to verify:** Scan for any single file over ~200–300 lines and ask whether it should be decomposed; grep for unused exports/dead files.
- **Priority:** Medium
- **Explicit/Implicit:** Implicit (synthesized from an explicit rubric description)

---

# PART 6 — AI WORKFLOW (CLAUDE IN ANTIGRAVITY)

### 6.1 Spec before code (plan.md gate)
- **Requirement:** Write acceptance criteria, data shapes, and edge cases into a `plan.md` and have Claude confirm the plan before any implementation code is written.
- **Explanation:** Explicit, framed with an economic argument: "ambiguity killed in prose is 10x cheaper than in a diff."
- **Why this workflow rule exists:** Prevents wasted generation cycles on the wrong interpretation of a feature; creates a reviewable artifact (the plan) independent of the code.
- **Best-practice translation:** Before starting any new feature, always produce and get explicit sign-off (from yourself, reading it critically) on a written plan before generating implementation code.
- **Priority:** High
- **Explicit/Implicit:** Explicit

### 6.2 Ship in milestones, not monoliths
- **Requirement:** Cap each generation turn to one vertical slice (schema → one endpoint → one screen); avoid single generations exceeding what you can fully review (~500 lines is flagged as too much).
- **Explanation:** Explicit — "A 500-line generation you can't fully review is a liability, not velocity."
- **Why this workflow rule exists:** Large, unreviewable diffs are where hallucinated APIs and subtle bugs hide; also produces the clean, atomic commit history required elsewhere (5.9).
- **Best-practice translation:** Structure every AI-assisted session around one small, independently reviewable, independently committable unit of work.
- **Priority:** High
- **Explicit/Implicit:** Explicit

### 6.3 Schema and types first, features second
- **Requirement:** Lock the migration and TypeScript types before requesting any feature code from Claude.
- **Explanation:** Explicit; directly ties to the "Schema-first" engineering rule (5.7) — this is its AI-workflow enforcement mechanism.
- **Why this workflow rule exists:** Every downstream generation then inherits a fixed contract instead of the model inventing its own shapes per feature, which would cause drift.
- **Best-practice translation:** Always paste/reference the locked schema and types file when prompting for any feature that touches data.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 6.4 Demand tests in the same turn
- **Requirement:** Ask for the failing test alongside the implementation in the same request; confirm it fails, then confirm it passes after implementation.
- **Explanation:** Explicit — "a feature Claude wrote and Claude tested still needs a test you can read and run."
- **Why this workflow rule exists:** Prevents the false confidence of "Claude said it works" without independent verification; ties directly to the testing philosophy in 5.8.
- **Best-practice translation:** Structure prompts as: "write the test first, show me it fails, then implement until it passes" rather than asking for implementation alone.
- **Priority:** Medium
- **Explicit/Implicit:** Explicit

### 6.5 Review every diff — never blind-paste
- **Requirement:** Read every generated hunk before accepting it into the codebase.
- **Explanation:** Explicit — "Claude confidently invents API signatures, and the bug it hands you costs more than the code it saved."
- **Why this workflow rule exists:** Direct accountability rule — you own every bug in the submission regardless of who/what wrote the code; ties to Part 1.6 (AI as force-multiplier, not crutch).
- **Best-practice translation:** Treat every AI-generated diff exactly like a PR from a junior engineer: read it fully, understand it, only then merge it.
- **Priority:** Critical
- **Explicit/Implicit:** Explicit

### 6.6 Feed it the stack trace, not a summary
- **Requirement:** When debugging, paste the full error, exact failing command, and relevant raw logs — not a paraphrased description of the symptom.
- **Explanation:** Explicit — "Claude self-fixes from raw evidence far better than from your paraphrase of the symptom."
- **Why this workflow rule exists:** Paraphrasing loses diagnostic detail the model needs; raw evidence lets it reason from first principles instead of guessing from a vague description.
- **Best-practice translation:** Always copy-paste raw terminal output/stack traces directly into debugging prompts.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 6.7 Keep the context window tight
- **Requirement:** Start a fresh thread per milestone; reference files by path rather than pasting everything into one long-running session.
- **Explanation:** Explicit — "a bloated 100k-token session degrades reasoning and buries the one instruction that matters."
- **Why this workflow rule exists:** Long sessions accumulate irrelevant context that can drown out the current task's actual constraints.
- **Best-practice translation:** Treat each Claude session as scoped to a single milestone; don't drag an entire project history into every prompt.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 6.8 Force a second draft ("is there a more elegant way?")
- **Requirement:** After a working solution, explicitly prompt for one refactor pass before considering the feature done.
- **Explanation:** Explicit — "The first draft ships; the second draft is the one a staff engineer approves."
- **Why this workflow rule exists:** First-pass AI code tends to be correct-but-unrefined; a dedicated refactor prompt catches the gap between "works" and "well-structured."
- **Best-practice translation:** Never treat the first green-test implementation as final; always request one explicit refactor/simplification pass.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 6.9 Copy-ready prompt templates (as reusable principles)
- **Requirement:** The handbook supplies five literal prompt templates (Planning/spec-first, Schema-first, Test generation, Code review, Debugging/self-fix) intended to be reused verbatim.
- **Explanation:** Explicit, given as copy-pasteable text blocks.
- **Why this workflow rule exists:** Encodes the above principles (6.1–6.6) into repeatable, low-effort prompt patterns so discipline doesn't depend on remembering the philosophy each time.
- **Best-practice translation:** Adopt these five templates directly as your default prompting habits for planning, schema work, testing, review, and debugging respectively.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

### 6.10 Account-switching hack for Opus limits **(operational note, not an engineering principle)**
- **Requirement:** If hitting usage limits, switching Google accounts resets Antigravity's Opus 4.8 quota; because this clears session context, save `plan.md`, key decisions, and the current chat into a `docs/` note in the repo *before* switching so a fresh session can resume seamlessly.
- **Explanation:** Explicit, presented as a "practical hack."
- **Why this workflow rule exists:** Purely operational continuity — prevents context loss from breaking the "spec before code" and "schema-first" discipline established above when a session must restart.
- **Best-practice translation:** Regardless of whether you use this specific hack, always keep `plan.md`/decision notes committed to the repo as the source of truth, independent of any single chat session's memory.
- **Priority:** Low
- **Explicit/Implicit:** Explicit

---

# PART 7 — EVALUATION CHECKLIST (MASTER REVIEWER CHECKLIST)

*Every requirement above converted into a checkbox. Organized to mirror how a reviewer would actually move through a submission: repo → live app → code → docs → discoverability → portfolio.*

## 7.1 Repo — First Ten Seconds
- [ ] Root directory matches the prescribed structure (`.github/`, `docs/`, `prisma/`, `public/`, `src/`, `tests/`, root config files only)
- [ ] README is fully custom (not the framework default / no leftover Next.js boilerplate)
- [ ] Repo has a description, topics, and the live URL set in the GitHub header
- [ ] `.gitignore` correctly excludes `.env`, `node_modules`, `.next`/build output
- [ ] `.env.example` present and documents every required variable with safe dummy values
- [ ] No `.env` or secret ever appears in git history (checked, not assumed)

## 7.2 Live App — Core Product
- [ ] Live URL loads with zero console errors and zero broken images
- [ ] A first-time stranger completes the core job-to-be-done in under 60 seconds
- [ ] Real auth works end-to-end in production (signup, login, email verification)
- [ ] Demo/read-only credentials provided in the README if auth exists
- [ ] Full CRUD verified by hand on every core entity, on the live deployment
- [ ] Data persists across a hard refresh (real DB, not localStorage/in-memory state)
- [ ] Search is server-side, debounced (~300ms), index-backed
- [ ] Filters combine with AND semantics and sync to the URL
- [ ] Sort is stable (secondary sort on `id`) across paginated pages
- [ ] Pagination uses cursor/keyset for large sets; page size capped server-side (≤100)
- [ ] Every async view has distinct loading / empty / error / success states, no blank flash
- [ ] Skeletons (not spinners) used for known-shape content
- [ ] Every empty state has a primary CTA
- [ ] Errors are actionable client-side (retry) with full trace logged server-side only
- [ ] 404 page and error boundary present — no thrown render ever produces a white screen
- [ ] Submit buttons disable + show pending state (no double-submit bugs)
- [ ] Optimistic UI used for high-success mutations, with rollback on failure

## 7.3 Security & Access
- [ ] Passwords hashed with Argon2id or bcrypt (cost ≥12); never stored/emailed in plaintext
- [ ] Sessions in httpOnly/Secure/SameSite=Lax cookies; rotated on login and privilege change
- [ ] Password reset tokens: single-use, hashed at rest, 15–30 min TTL
- [ ] RBAC enforced server-side on every route; client-sent roles never trusted
- [ ] Row-level authorization on every mutation (ownership verified, not just login status)
- [ ] Rate limiting on login/reset (~5/15min) and all other sensitive routes (429 + Retry-After)
- [ ] OAuth (if used) goes through a vetted library, never hand-rolled
- [ ] All user input escaped/auto-escaped; no raw HTML injection from user content
- [ ] Parameterized queries / ORM used everywhere (no raw string-concatenated SQL)
- [ ] Uploads (if any) allow-listed by MIME type and size, validated server-side
- [ ] CSP, HSTS, X-Content-Type-Options headers set; CSRF protection on state-changing requests
- [ ] No secret anywhere in the client bundle (verified by grepping the built output)

## 7.4 Code Quality
- [ ] TypeScript strict mode enabled, zero `any` in the codebase
- [ ] `tsc --noEmit` passes with zero errors
- [ ] Lint passes clean
- [ ] No file is an unreviewable "God component"; clear module boundaries
- [ ] No dead code, no leftover AI-attribution comments, no stray TODOs
- [ ] Shared Zod schemas used identically on client and server for every form/endpoint
- [ ] Mutation endpoints return the mutated record

## 7.5 UI/UX Craft
- [ ] All spacing snaps to the 4px/8px scale — no arbitrary off-grid values
- [ ] One primary action and one `<h1>` per view; hierarchy via weight/size/color
- [ ] Restrained palette: 3 neutral grays + 1 accent + 1 radius + 1 font family
- [ ] Motion limited to state changes, 150–250ms, ease-out, 300ms hard cap
- [ ] `prefers-reduced-motion` respected (animations disabled when set)
- [ ] Contrast ≥4.5:1 body text, ≥3:1 large text/icons (verified with a checker, not eyeballed)
- [ ] Every interactive element has hover/active/focus/disabled states, feedback <100ms
- [ ] Full keyboard operability: Tab order matches visual order, Esc/Enter work, focus ring always visible
- [ ] Cmd+K command palette (if included) covers core actions
- [ ] Dark mode (if included) uses real tokens, no flash-of-wrong-theme, correct text opacity
- [ ] One shared button/input/card component used everywhere (no visual drift between instances)
- [ ] Responsive from 320px: zero horizontal scroll, ≥44px tap targets, tables collapse to cards
- [ ] Lighthouse Accessibility score ≥95

## 7.6 Deployment & Reliability
- [ ] Deployed to a real public HTTPS URL (Vercel/Netlify)
- [ ] Custom domain configured (if pursuing full rubric credit)
- [ ] Env vars fully configured in the platform, matching `.env.example`
- [ ] Migrations run against the production database (not just local)
- [ ] CI runs typecheck + build (and lint/tests if present) on every push, and fails the build on errors — not just warnings
- [ ] App still works after a hard refresh in an incognito window
- [ ] Every nav item and deep link works on the deployed URL (not just localhost)

## 7.7 Documentation
- [ ] README: one-line pitch, hero screenshot/GIF, live demo link — all above the fold
- [ ] README: feature bullets (verbs, not adjectives), tech stack, quick start commands re-run on a fresh clone
- [ ] README: environment variable table
- [ ] README: demo/read-only login credentials (if auth exists)
- [ ] `docs/architecture.md`: data model diagram, one-paragraph auth/authorization explanation, non-obvious decisions + trade-offs
- [ ] API/endpoints documented (method, path, inputs, output, auth required)
- [ ] Code comments explain *why*, not *what*; naming does the rest
- [ ] `CHANGELOG.md` maintained in Keep-a-Changelog format

## 7.8 GitHub Professionalism
- [ ] Commit history is atomic and Conventional-Commits-labeled (`feat:`, `fix:`, `docs:`, etc.) — no "fix2"/"asdf"/"final-final"
- [ ] No single giant "initial commit" containing the whole project
- [ ] Feature-branch workflow used; PRs opened with "what changed and why" descriptions
- [ ] `LICENSE` file present (MIT default) with real content, not a placeholder
- [ ] `CONTRIBUTING.md` present (local setup, branch/commit conventions, test/lint instructions)
- [ ] Issue templates and PR template present in `.github/`
- [ ] Tagged `v1.0.0` release once the core is complete

## 7.9 SEO & Discoverability
- [ ] Exactly one `<h1>` and one `<main>` per route; proper landmark elements
- [ ] Unique title (50–60 chars) and meta description (150–160 chars) per route
- [ ] Canonical URL tag on every page
- [ ] `robots.txt` correctly configured; `sitemap.xml` generated and submitted
- [ ] Lowercase kebab-case URLs, trailing slashes 301-redirected
- [ ] Full OG tags + Twitter Card tags with a real generated 1200×630 image per route
- [ ] Validated in Facebook Sharing Debugger, LinkedIn Post Inspector, Twitter Card Validator
- [ ] JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList` as applicable) server-rendered, validated with zero errors
- [ ] Core Web Vitals at p75 (field data): LCP <2.5s, INP <200ms, CLS <0.1
- [ ] Lighthouse ≥90 across Performance/Accessibility/Best Practices, SEO = 100
- [ ] No lorem/placeholder copy anywhere public-facing
- [ ] Real FAQ page/section present, matching its JSON-LD verbatim

## 7.10 Open Source Hygiene
- [ ] `LICENSE` — real MIT (or equivalent) text, not a stub
- [ ] `CONTRIBUTING.md` complete
- [ ] `CHANGELOG.md` complete, Keep-a-Changelog format
- [ ] Conventional Commits used consistently
- [ ] Semantic versioning tag applied (`v1.0.0`)

## 7.11 Portfolio Package
- [ ] Written case study: Problem / Approach / Result / What you learned
- [ ] 60–90 second Loom demo video recorded
- [ ] 3–5 clean screenshots produced for README/portfolio
- [ ] One-paragraph pitch suitable for LinkedIn/job applications
- [ ] Project pinned on GitHub profile with topics + live URL
- [ ] Linked on personal portfolio site (demo + repo + case study)

## 7.12 Bonus Points (select a few, execute well — do not bolt on all)
- [ ] Meaningful automated e2e test of the critical path
- [ ] CI/CD running lint + typecheck + tests on every PR
- [ ] Real-time or optimistic UI that feels instant
- [ ] Enforced role-based access (admin vs. member)
- [ ] Dark mode done properly (system-aware, no flash)
- [ ] A genuinely useful AI feature (not a gimmick)
- [ ] Analytics dashboard with real charts over real data
- [ ] Accessibility above baseline (full keyboard support, ARIA where needed)
- [ ] Custom domain + polished 404 page
- [ ] Short architecture write-up on one hard decision

## 7.13 Final Submission Gate
- [ ] Live app link ready (with demo login if applicable)
- [ ] Public GitHub repo link ready, README credits the Digital Heroes trial
- [ ] Demo video link ready
- [ ] Case study ready
- [ ] Message sent to Shreyansh Singh (LinkedIn or Instagram) with all links — **submission is not complete without this outreach step**

---

# PART 8 — HIDDEN / IMPLICIT REQUIREMENTS

Requirements never stated as standalone bullets but derivable from combining multiple sections, or logically necessary for the stated ones to hold.

### 8.1 Expected software quality bar
- **Requirement:** The overall bar is "production SaaS," not "student project" — every rubric category's "excellent" description assumes production-grade behavior (real Core Web Vitals data, real security controls, real CI gates).
- **Why:** Derived by reading the "excellent score looks like" column of Section 20 literally — none of the eight descriptions describe demo-level work.
- **Priority:** Critical

### 8.2 Expected architecture maturity
- **Requirement:** Clear separation of concerns (routes / components / lib / server / types, per the prescribed folder structure) is expected even for a small solo project — not just for large teams.
- **Why:** The prescribed repo structure (Section 10) is presented as *the* structure, with no "simplify for small projects" caveat, and the Code Quality rubric explicitly expects "clear module boundaries."
- **Priority:** Medium

### 8.3 Expected UX maturity
- **Requirement:** The bar is competitive with funded, professionally-designed SaaS products (Linear/Stripe/Vercel/Notion/Height are the explicit reference points), not merely "better than a bootcamp project."
- **Why:** Section 5 requires literally studying category leaders before building; Section 7's design language explicitly names these products as the target aesthetic.
- **Priority:** High

### 8.4 Expected documentation quality
- **Requirement:** Documentation should be sufficient for a reviewer to run, use, *and evaluate* the project without ever needing to ask the candidate a clarifying question.
- **Why:** "It must let a stranger understand, run, and evaluate the project in minutes" (Section 11) — the explicit standard is total self-sufficiency of the written artifacts.
- **Priority:** High

### 8.5 Expected project completeness vs. scope
- **Requirement:** A smaller, fully-realized product (including all secondary requirements — security, SEO, docs, tests) is preferred over a larger product missing any of these dimensions.
- **Why:** Directly follows from "depth over breadth" (Part 1.2) applied consistently across every section, not just feature count.
- **Priority:** Critical

### 8.6 Expected production readiness
- **Requirement:** The submission should be able to survive unannounced, unattended real-world use for an extended period (a reviewer coming back days later should find it still working, still secure, still fast) — not just work during a live demo.
- **Why:** Synthesized from the "Deployment & Reliability" rubric line ("it still works after a hard refresh in incognito") combined with the security/rate-limiting requirements, which only matter if the app is expected to face real, possibly hostile, traffic over time.
- **Priority:** Medium

### 8.7 Reviewer will test adversarially, not just click through happy paths
- **Requirement:** Assume the reviewer will attempt to break auth boundaries (IDOR, role bypass), double-submit forms, and test at extreme viewport widths — not just casually browse the app.
- **Why:** The specificity of security bullets (row-level auth, rate limiting, RBAC server-side) only makes sense if these are things a reviewer actually probes, not just reads about in the README.
- **Priority:** High

### 8.8 The outreach step is part of the deliverable, not optional follow-up
- **Requirement:** Messaging Shreyansh Singh with the finished links is a *required* part of submission, not a courtesy afterthought.
- **Why:** Stated explicitly and bluntly: "A finished project nobody is told about can't move you forward, so don't skip this." A perfect project with no outreach message functionally never gets reviewed.
- **Priority:** Critical

---

# PART 9 — COMMON MISTAKES (WITH WHY + AVOIDANCE)

| # | Mistake | Why It's Wrong | How to Avoid |
|---|---------|-----------------|----------------|
| 1 | Demo where data vanishes on refresh (no persistence/auth, React state only) | Fails the most basic "is this real software" test in seconds | Wire a real DB from day one; gate writes behind auth |
| 2 | Commits `.env`/API keys into the repo | Permanent leak in git history; real security incident | `.gitignore` from commit one; rotate + `git filter-repo` if it happens; platform env vars only |
| 3 | Leaves the framework default README | Fails the "first ten seconds" impression test | Replace immediately with pitch, screenshots, live URL, setup steps you actually re-ran |
| 4 | One squashed "initial commit" with the whole project | Reviewers read git log to judge process, not just output | Commit in logical, incremental units as you build |
| 5 | Only runs on localhost / deploy 404s on refresh | "An undeployed project does not exist" | Deploy day one; test every route via direct URL in incognito |
| 6 | Zero meta tags / OG image, shared links render blank grey cards | Fails SEO rubric and looks unfinished when shared | Add per-route metadata + generated OG image; validate in sharing debuggers |
| 7 | Console full of React key warnings, hydration errors, failed fetches | Signals unreviewed/unfinished code | Treat a red console as a failing test blocking submission |
| 8 | No empty/loading/error states — blank screen or white crash | The single most-repeated failure mode across the whole handbook | Design all four states explicitly before the happy path |
| 9 | Layout breaks below 400px | Directly tested via DevTools mobile width | Build mobile-first; test at 375px |
| 10 | Leftover AI attribution, TODOs, commented-out code, unused scaffolding | Signals unreviewed AI output, not owned code | Strip before submission; be able to explain every file |

---

# PART 10 — ACTION PLAN TEMPLATE

*(To be filled in per-candidate, per-project. Template only — not populated here since no specific project was in scope for this extraction.)*

| Requirement (from Parts 3–7) | Current Status (Completed / Missing / Needs Improvement) | Priority | Estimated Effort |
|---|---|---|---|
| e.g. RBAC enforced server-side | — | Critical | — |
| e.g. Lighthouse SEO = 100 | — | High | — |
| e.g. Case study written | — | Medium | — |
| *(repeat for every checkbox in Part 7)* | | | |

---

# PART 11 — FINAL SCORECARD TEMPLATE

*(Mirrors Section 20's weighting exactly. Populate "Current Points" against a specific submission when auditing one.)*

| Category | Weight | Max Points | Current Points | Reason | Missing Work |
|---|---|---|---|---|---|
| Product Quality & Functionality | 20% | 20 | — | — | — |
| UI/UX Craft | 15% | 15 | — | — | — |
| Code Quality & Architecture | 15% | 15 | — | — | — |
| Deployment & Reliability | 12% | 12 | — | — | — |
| Documentation | 10% | 10 | — | — | — |
| GitHub Professionalism | 10% | 10 | — | — | — |
| SEO & Discoverability | 10% | 10 | — | — | — |
| Originality & Attention to Detail | 8% | 8 | — | — | — |
| **Total** | **100%** | **100** | **—** | | |

---

*End of MASTER_PROJECT_SPEC.md — extracted exclusively from the Digital Heroes Full Stack Developer Trial handbook (Document 2). No project-specific audit was performed, per scope.*
