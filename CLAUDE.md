# BoardGamesWeb

Family board game library website. Repo: `eamon9/BoardGamesWeb`.

Note: not related to the separate Grannies-LV-page / vecmaminas.lv project (a different repo). An earlier session's CLAUDE.md incorrectly conflated the two, that reference has been removed.

## Conventions
- Conversation with the user happens in Latvian, but all code, comments, commit messages, and actions are in English
- UI text and flash messages in the app itself stay Latvian (existing convention, don't change)
- Never use em dash (-) in any output, use a regular hyphen (-) only
- Commit messages: English, imperative mood, no em dash
- Never run `git commit` (or merge/push) without the user's explicit go-ahead each time, even if a previous message approved a commit. The user does their own commits unless they explicitly ask otherwise for that change.

## Tech stack
- Node.js + Express 5, ES modules (`type: module`)
- MongoDB + Mongoose, sessions via `connect-mongo`
- EJS templates + Bootstrap 5
- Auth: custom (bcrypt + express-session), not Passport
- Hosting: Render free tier, sleeps after inactivity, risk of full spin-down after long idle periods

## Code conventions
- Every POST form needs a CSRF token (`<input type="hidden" name="_csrf" value="<%= csrfToken %>">`), global CSRF middleware in `app.js` requires it everywhere
- Never use GET requests with side effects (e.g. delete), always POST
- `views/admin/*.ejs` follows the `dashboard.ejs`/`users.ejs` style pattern (Bootstrap card/table)

## Current state (2026-09-09)

### Fixed (patch not yet applied to this checkout, see below)
- `views/admin/games.ejs` - missing view was causing a 500 error, now created, dashboard card uncommented
- `views/admin/users.ejs` - added missing `_csrf` inputs in toggle-admin/delete forms (without it, 403)
- `routes/ratings.js` + `views/game.ejs` - rating delete changed from GET link to POST form with CSRF
- `routes/auth.js` - removed sensitive console.log (full user object with password hash in logs)
- `middleware/loginRateLimiter.js` (new) - brute force protection on login (5 attempts/10min)
- `createUser.js` - no more hardcoded password, now `node createUser.js <username> <password> [--admin]`

### Known, not fixed
- `config/db.js` - unused duplicate (app.js connects to Mongo itself)
- No create/delete game admin routes, only edit via `/game/:id`
- Old password `toms`/`toms` was in the public repo, rotate it in the real DB if not done yet
- CSS `body { font-size: 1.5rem }` seems too large globally, check on mobile

### Next steps (in the order the user chose)
1. Critical bugs - DONE (see patch)
2. Security - DONE (see patch)
3. **Render sleep fix** - not started. Options: cron-job.dev/UptimeRobot ping every 10-14 min, or migrate to Fly.io/Railway
4. Code cleanup (dead code, CSS review)

## Big picture: SaaS pivot
Idea: turn this from a single family app into a multi-tenant SaaS where anyone can create their own library, goal is to cover server costs, not to make a profit.

Required changes:
- Multi-tenancy: `ownerId`/`libraryId` field on the `Game` model and on `ratingUsers` (currently hardcoded in `config/users.js`)
- Public signup (`/auth/register`), currently only admin creates users
- Move image storage from the repo (`public/images`, 18MB) to cloud storage (S3/Cloudinary/Backblaze B2)
- Monetization: undecided, leaning toward starting with a donate/support button (Ko-fi etc) plus a free tier with limits rather than Stripe subscriptions right away, less complexity, faster to launch, real demand data before a bigger investment

This pivot is still in planning, no code changes started yet.
