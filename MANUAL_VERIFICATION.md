# MANUAL_VERIFICATION.md — Pre-Submission QA Checklist
### HireTrack Applicant Tracking System

Complete this interactive checklist on the live deployed environment prior to final submission.

---

## 1. Authentication & Account Flows
- [ ] **Fresh Candidate Signup**: Register a new account via `/register` with valid email & password. Confirm successful redirect to Candidate Portal.
- [ ] **Login (Candidate & Staff)**: Log in with Candidate credentials and Admin credentials (`karthikhr676@gmail.com`). Verify correct role routing.
- [ ] **Invalid Login Credentials**: Attempt login with incorrect password. Confirm inline error alert displays without page reload.
- [ ] **Logout**: Click "Sign Out" in navbar. Verify token is cleared from client state and user is redirected to `/login`.

---

## 2. Public Careers & Application Flow
- [ ] **Public Careers Page (`/careers`)**: Open `/careers` in an incognito window. Verify hero section, company story, culture image, and open position listings load cleanly.
- [ ] **Job Detail Page (`/jobs/:id`)**: Click on an open position card. Verify job requirements, salary range, location, and apply form render.
- [ ] **Apply Flow**: Complete application submission with name, email, experience, and source.
- [ ] **Resume Upload**: Attach a PDF resume (under 5MB). Verify upload completes and stores file reference.
- [ ] **Duplicate Application Protection**: Re-submit an application using the same email for the same job posting. Confirm duplicate rejection alert.

---

## 3. Recruiter Workspace & Candidate Pipeline
- [ ] **Recruiter Dashboard Access**: Log in as Admin/Recruiter and navigate to `/dashboard`. Verify fixed 240px sidebar and KPI cards.
- [ ] **Kanban Board Navigation (`/dashboard/workspace`)**: Select a job position from the sidebar. Verify candidate cards render across 6 pipeline stages.
- [ ] **Drag-and-Drop Stage Transition**: Drag a candidate card to a new stage column. Confirm instant UI update and database state persistence upon refresh.
- [ ] **Candidate Detail Panel**: Click a candidate card to open the slide-out detail panel. Test switching across all 6 tabs (*Overview*, *Resume*, *Timeline*, *Notes*, *Interviews*, *Scorecards*).
- [ ] **Resume Preview**: Open the *Resume* tab in the detail panel. Verify PDF resume renders cleanly in the embedded PDF viewer.
- [ ] **Add Internal Note**: Add an internal recruiter note in the *Notes* tab. Confirm note appears immediately in timeline audit history.

---

## 4. Interview Scheduling & Scorecards
- [ ] **Interview Scheduling**: Click "Schedule Technical Interview" on a candidate in *Resume Screening*. Select interviewer, date, and time. Confirm interview booking and stage progression.
- [ ] **Conduct Interview & Scorecard**: Log in as designated Admin interviewer, navigate to `/interviews/assigned`, and submit a scorecard with ratings and recommendation. Verify application stage updates.

---

## 5. Candidate Sourcing & Referrals
- [ ] **Add Sourced Candidate**: Click "Add Candidate" modal in recruiter workspace. Submit candidate with source marked as *Referral* or *LinkedIn*.
- [ ] **Pipeline Source Filter**: Filter pipeline candidates by source (*Referral* vs *Careers Page*). Confirm correct candidate list filtering.

---

## 6. Search, Filters & Pagination
- [ ] **Job Search**: Type a keyword into the job search input. Verify list updates with debounced input.
- [ ] **Pipeline Stage Filtering**: Filter applications by specific stage. Verify empty state displays when zero candidates match filters.
- [ ] **Pagination**: Navigate across pages on large candidate/job lists. Verify page size is clamped and state persists.

---

## 7. Responsive & Accessibility Testing
- [ ] **Desktop Navigation**: Test navbar layout at 1440px width. Confirm links, buttons, and sticky glassmorphism header align horizontally.
- [ ] **Mobile Responsiveness (375px Viewport)**: Open DevTools mobile view at 375px. Verify sticky navbar hamburger menu, collapsible job cards, and zero horizontal scroll.
- [ ] **Recruiter Mobile Guard**: Access `/dashboard` on a mobile screen (<768px). Verify Recruiter Mobile Guard screen displays with guidance to use desktop/tablet.
- [ ] **Keyboard Navigation**: Navigate the site using only `Tab`, `Enter`, and `Escape` keys. Verify focus rings are visible on all interactive elements.
- [ ] **Motion Sensitivity (`prefers-reduced-motion`)**: Toggle OS reduced motion setting. Confirm floating animations disable cleanly.

---

## 8. Technical QA & Reliability
- [ ] **Console Error Audit**: Open browser DevTools Console. Perform a full application walkthrough and verify **0 red console errors or warnings**.
- [ ] **404 Handling**: Navigate to a non-existent URL (e.g. `/invalid-route`). Verify custom 404 page renders gracefully.
- [ ] **Error Boundary Check**: Verify thrown render errors show an actionable retry button rather than a white screen.
- [ ] **PageSpeed / Lighthouse Audit**: Run Lighthouse audit on deployed URL. Verify scores: Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO = 100.
