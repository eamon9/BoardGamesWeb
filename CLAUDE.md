# BoardGamesWeb

Family board game library website. Repo: `eamon9/BoardGamesWeb`.

Note: not related to the separate Grannies-LV-page / vecmaminas.lv project (a different repo). An earlier session's CLAUDE.md incorrectly conflated the two, that reference has been removed.

## Conventions
- Conversation with the user happens in Latvian, but all code, comments, commit messages, and actions are in English
- UI text and flash messages in the app itself stay Latvian (existing convention, don't change)
- Never use em dash (-) in any output, use a regular hyphen (-) only
- Commit messages: English, imperative mood, no em dash
- Never run `git commit` (or merge/push) without the user's explicit go-ahead each time, even if a previous message approved a commit. The user does their own commits unless they explicitly ask otherwise for that change.
- User does not want a `Co-Authored-By: Claude ...` trailer in commit messages. When drafting a message for the user to commit themselves, leave it out. Note: if Claude Code itself ends up running `git commit`, a session-level instruction may still add this trailer regardless of this preference, that's outside this project's control.
- When asked for "a commit message", it covers only the currently uncommitted changes (`git status`/`git diff` against `HEAD`), not a summary of the whole session or of already-committed work. Check what's actually uncommitted first, don't assume from earlier conversation turns.

## Running locally
- `npm run dev` (nodemon, auto-restarts on file changes) or `npm start` / `node app.js` (one-off)
- Needs `.env` present with `MONGO_URI`, `SESSION_SECRET`, `PORT`, `NODE_ENV=development`
- No extra steps needed for CSP: `app.js` only adds Helmet's `upgradeInsecureRequests` directive when `NODE_ENV === "production"`. Locally (`development`) it's off automatically, this used to break every asset (CSS/JS/images) with a browser "SSL error" because Helmet forced HTTPS upgrades on a plain HTTP dev server, fixed 2026-09-09.

## Version tracking
- Footer shows `v. <hash>` (git commit short hash) via `getAppVersion()` in `app.js`, called fresh on every request: `RENDER_GIT_COMMIT` on Render (static per deploy, no exec needed), else local `git rev-parse --short HEAD`, else `dev`
- Because it's read per request rather than cached at startup, the local dev server does NOT need a restart after a `git commit`, just reload the page and it matches `HEAD`
- To compare with what's actually live on Render, check the footer value against `git log --oneline -1` (or the latest commit on GitHub) after a deploy finishes

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

### Fixed (applied on main, commits e0e400c/1ace289/fe6823f/1f0d3e1/5fad0c9)
- `views/admin/games.ejs` - missing view was causing a 500 error, now created, dashboard card uncommented
- `views/admin/users.ejs` - added missing `_csrf` inputs in toggle-admin/delete forms (without it, 403)
- `routes/ratings.js` + `views/game.ejs` - rating delete changed from GET link to POST form with CSRF
- `routes/auth.js` - removed sensitive console.log (full user object with password hash in logs)
- `middleware/loginRateLimiter.js` (new) - brute force protection on login (5 attempts/10min)
- `createUser.js` - no more hardcoded password, now `node createUser.js <username> <password> [--admin]`
- `.DS_Store`/`.vscode` untracked, added to `.gitignore`
- MongoDB Atlas password rotated (old one had been exposed), updated in local `.env` and Render env vars, confirmed live and working

### Known, not fixed
- `config/db.js` - unused duplicate (app.js connects to Mongo itself)
- No create/delete game admin routes, only edit via `/game/:id`
- CSS `body { font-size: 1.5rem }` seems too large globally, check on mobile

### Next steps (in the order the user chose)
1. Critical bugs - DONE
2. Security - DONE (bugfixes/CSRF/rate limiting + Mongo password rotation)
3. Render sleep fix - DONE, UptimeRobot monitor set up pinging the Render URL every 5 min
4. **Code cleanup** - not started (dead code, CSS review, see "Known, not fixed" above)

## Big picture: SaaS pivot
Idea: turn this from a single family app into a multi-tenant SaaS where anyone can create their own library, goal is to cover server costs, not to make a profit.

Required changes:
- Multi-tenancy: `ownerId`/`libraryId` field on the `Game` model and on `ratingUsers` (currently hardcoded in `config/users.js`)
- Public signup (`/auth/register`), currently only admin creates users
- Move image storage from the repo (`public/images`, 18MB) to cloud storage (S3/Cloudinary/Backblaze B2)
- Monetization: undecided, leaning toward starting with a donate/support button (Ko-fi etc) plus a free tier with limits rather than Stripe subscriptions right away, less complexity, faster to launch, real demand data before a bigger investment

This pivot is still in planning, no code changes started yet.
