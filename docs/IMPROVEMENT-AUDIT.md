# Career Path: Improvement Audit

**Date:** 2026-10-20
**Scope:** Whole repository: `server/` (Express + MongoDB + C4.5 model) and `client/` (React + Vite).
**Method:** Read every route, controller, model and page. Ran the type checks, lint, client tests and a production build.

## Summary

The core student flow works: register, verify email, log in, take the assessment, see the C4.5 recommendation and download a PDF. Type checks pass on both sides, lint shows 1 warning, and all 44 client tests pass.

The biggest problem is that **several admin screens are mock-ups**. They show sample data and say "saved" without calling the server:

- Student queries (admins never see real questions from students)
- Student records (add, edit and delete)
- Career tracks
- Account settings (save settings and change password)
- "Recent Activities" on the admin dashboard

There are also a few security gaps that need fixing before the app is used by real students.

Priority key: **P0** = broken, fake or a security risk, so fix first. **P1** = should fix soon. **P2** = an enhancement or a new feature.

## Status (updated 2026-10-20)

Everything in P0 and P1 is done, plus most of P2. Checked with type checks, lint, 19 server tests, 49 client tests, a production build, and a full click-through in the browser against a separate test database (no real student data was touched).

**Done**
- Security #6 to #10: NoSQL injection blocked, answer key removed from the browser, server-issued question sets, rate limits, CORS allowlist and security headers.
- Admin screens #1 to #5 now use real data: student queries (with email to the student when answered), student records (add, edit, delete, reset assessment, CSV export), career tracks (saved in the database and shown to students), account settings (name, change password, administrator list with "resend setup link"), and a real activity feed plus strand chart on the dashboard.
- Account flows #11 to #14: forgot/reset password, resend verification (login page and verify page), automatic sign-out on an expired session, a `/health` check, and a clear "database unavailable" message instead of a crash. A daily GitHub Action pings `/health` so the free Atlas cluster does not pause again.
- P1 backend: one result per student is now enforced by the database (one old duplicate removed, the newest result kept), invalid IDs return 404, login and resend no longer reveal which emails exist, input lengths are limited, students cannot change their own student ID or email, counselor names are real, list endpoints have a safety cap, and the unused `Assessment` model is gone.
- P1 frontend: one API helper everywhere, the URL now drives the dashboards (Back button works), the sidebar becomes a menu on phones, clickable cards work with the keyboard, toasts and dialogs replace `alert()`/`confirm()`, the progress card is real, the assessment saves progress and can resume after a refresh, pages load on demand (main bundle 828 kB to 237 kB), plus page title, description, favicon, robots.txt and a 404 page.
- Bugs found along the way: student queries showed the wrong date and no counselor name; the grade level on the student profile was never saved; match percentages were rescaled so the top strand always showed 100%. All fixed.
- Tooling: server tests (Vitest + Supertest), `tsx` for local server dev, unused and duplicate dependencies removed, CI workflow for lint, tests and build.

**Not done**
- Error monitoring (needs a Sentry or similar account).
- A separate staging deployment (needs a second Vercel project and database).
- Announcement scheduling and email alerts for important announcements.
- Real pagination: lists are capped (2,000 students, 500 queries, 200 announcements) instead, which is enough for one school.
- The training data is still synthetic; that is a research decision, not a code change.

---

## P0: Fix first

### Screens that pretend to work

| # | Where | What happens now | Fix |
|---|---|---|---|
| 1 | `client/src/pages/AdminQueryManagement.tsx:17` | The page shows 4 hard-coded sample queries (John Doe, Maria Santos...). Replies only change local state. Real student questions never reach any admin. | Load from `GET /queries` and send replies through `PATCH /queries/:id/reply`. Both endpoints already exist. |
| 2 | `client/src/pages/AdminStudentManagement.tsx:194-217` | Add, edit and delete only change the screen. The alerts even say "TODO". A refresh brings the old data back. | Add `POST/PATCH/DELETE /students/:id` (admin only), then connect the buttons. |
| 3 | `client/src/pages/AdminCareerTracks.tsx:15` and `server/src/routes/tracks.ts` | Tracks and "enrolled students" counts (187, 145...) are hard-coded. Edits are lost on refresh. On the server, `GET /tracks` returns an empty list and `POST /tracks` is a stub with **no login check**. | Seed the `Track` collection, add real CRUD protected by `requireAuth` + `requireRole("admin")`, and compute enrolled counts from assessment results. |
| 4 | `client/src/pages/AccountSettings.tsx:36-52` | "Save" and "Change Password" show a success alert but do nothing. A user may think the password changed when it did not. | Add `POST /auth/change-password` (checks the current password first) and a profile update endpoint. Remove the notification and theme toggles until they work. |
| 5 | `client/src/pages/AdminDashboard.tsx:504` | "Recent Activities" lists made-up people and times. "Active Tracks" falls back to a fixed `4`. | Build the feed from real records (newest users, results and queries), or remove the section. |

### Security

| # | Where | Risk | Fix |
|---|---|---|---|
| 6 | `server/src/routes/auth.ts` `/verify-email` and `/admin/setup-password` | **NoSQL injection.** `token` goes straight into the Mongo query, so sending `{"$ne": ""}` as the token matches any token. With a known admin `_id` and an unused setup link, someone could set that admin's password. | Convert with `String(token)`, check `id` with `mongoose.isValidObjectId`, and turn on `mongoose.set("sanitizeFilter", true)` globally. |
| 7 | `client/src/data/aptitudeQuestions.ts` | The **answer key** (`correctOptionId`) ships to the browser, so any student can open DevTools and see every correct answer. | Serve questions from the server without the answers, and score only on the server. |
| 8 | `server/src/controllers/aptitudeAssessmentController.ts:72` | The server accepts any list of question IDs. A student can send all 30 questions in a domain, or the same question twice. Domain scores can then reach 30, but the model was trained on a 0 to 15 range (`MAX_DOMAIN_SCORE = 15`). | Have the server issue the question set and check that exactly 15 unique questions per domain come back. Also cap each domain at 15. |
| 9 | All `/auth/*` routes | No rate limiting. Passwords can be brute-forced, and `/register` and `/resend-verification` can burn the Brevo email quota. | Add `express-rate-limit` on login, register and resend. |
| 10 | `server/src/app.ts:19` | `cors()` allows every origin, and there are no security headers. | Allow only the client domain and add `helmet`. |

### Missing basic account flows

| # | Gap | Fix |
|---|---|---|
| 11 | No "Forgot password" for students or admins. | Add a reset-token flow. The email helper and token pattern already exist in `auth.ts`. |
| 12 | `/auth/resend-verification` exists, but no page lets the user trigger it. Users whose link expired are stuck. | Add a "Resend verification email" button on Login and VerifyEmail. |
| 13 | When the 1-day token expires, pages just show errors. The user is not logged out. | In `client/src/lib/api.ts`, on a `401` response, clear storage and redirect to `/login`. |
| 14 | If the database is down, `server/src/config/db.ts` calls `process.exit(1)`. On Vercel this kills the function, and users see generic errors (the cause of the Oct 20 outage). | Cache the connection, return `503` with a clear message, and add `GET /health`. Free Atlas clusters pause after inactivity, so add a weekly ping or upgrade the tier. |

---

## P1: Backend improvements

- **One assessment per student is not enforced in the database.** A double-click can save two results. Add a unique index on `AssessmentResult.student`.
- **Bad IDs return 500 instead of 400/404.** This happens in `GET /queries?userId=bad`, `PATCH /announcements/:id`, `PATCH /queries/:id/reply` and the auth `id` fields. Validate IDs first.
- **The login response reveals whether an account exists.** A role mismatch returns `403` before the password check, and resend returns `404 User not found`. Use one generic message.
- **No input validation layer.** Profile fields have no length or type checks, and students can overwrite their own `studentId` and `email` in the profile. Add `zod` schemas, and make `studentId` read-only (taken from `User`).
- **No admin "reset assessment".** A student who needs a retake is blocked forever. Add an admin-only reset endpoint.
- **No pagination** on `/students`, `/queries` or `/announcements`. This is fine for 35 users but will slow down with a full school.
- **Query replies show "School Admin"** instead of the real counselor's name. Populate `counselor.fullName`.
- **Dead code:** `server/src/models/Assessment.ts` is unused. The question bank is duplicated in `client/` and `server/`, so the two copies can drift apart. Keep one copy on the server.
- **No backend tests.** `npm test` in `server/` exits with an error. Add Jest + Supertest for auth, assessment scoring and role checks.
- **Thesis note:** the training data is synthetic (`server/src/data/trainingData.ts`). Report this clearly, and retrain on real labelled student data when you have it.

## P1: Frontend improvements

- **Use one API helper.** Six pages re-create `fetch` and look for the token under 4 different storage keys (`access`, `token`, `accessToken`, `authToken`). Use `api()` from `client/src/lib/api.ts` everywhere.
- **`userId` is never saved at login.** `App.tsx:34` reads it, but `Login.tsx` never sets it, so `user.id` is always empty.
- **The browser Back button probably does not change the screen.** The dashboards keep `activeView` in `useState(initialView)`, and the URL changes do not update it. Derive the view from the URL, or use nested routes.
- **Not mobile friendly.** The sidebar has a fixed width of 256px and there is no menu button, which matters because many students use phones. Add a collapsible sidebar.
- **Accessibility.** Quick-action cards are clickable `div`s, so keyboard users cannot reach them. Make them `button` elements. Replace `alert()`/`confirm()` with toasts and modals.
- **The student "Your Progress" card is fake.** It only shows "Completed" if the page was opened at `/student/tracks`. Fetch the real status.
- **Assessment progress is lost on refresh** (90 questions). Save a draft to `localStorage` and warn before leaving the page.
- **The bundle is large.** The main bundle is 828 kB. Lazy-load the pages and `jsPDF`.
- **Clean-up:**
  - `pages/Dashboard.tsx` is unused.
  - `nodemailer` (a server library) is listed in the client and root dependencies.
  - Jest versions do not match (root 30, client 29).
  - Lint warning at `StudentProfile.tsx:150`.
- **Page basics.**
  - The browser tab title is `career-path`.
  - The favicon is a `.jpg` declared as `svg`.
  - There is no meta description.
  - There is no 404 page (unknown URLs silently go to the login page).

---

## P2: Features worth adding

**For students**
- Change password and forgot password (see P0).
- A badge when a counselor answers a query, and an unread marker on announcements.
- A strand detail page: subjects, careers and colleges, using the real track data from #3.

**For admins**
- A student detail page that shows the full result, domain scores and answer review.
- Export class results as CSV or PDF, plus a chart of the strand distribution by section or batch.
- An admin list with deactivate and resend-setup-link, since an expired setup link currently has no recovery.
- Announcement scheduling and expiry dates.

**Full stack and operations**
- Email notifications when a query is answered or an important announcement is posted.
- CI on GitHub Actions: type check, lint, test and build on every push.
- Error monitoring (for example Sentry), and environment variable checks at startup.
- A separate staging deployment, so changes can be tested before the panel or students see them.

---

## Suggested order

1. Security fixes #6 to #10 (small changes, high risk).
2. Connect the mock admin screens #1 to #5 (these are visible to the thesis panel).
3. Account flows #11 to #14.
4. P1 clean-up, then P2 features.
