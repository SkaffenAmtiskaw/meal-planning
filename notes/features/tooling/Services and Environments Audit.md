---
type: cleanup
status: idea
blocked-by: ["decision needed: whether docs/ci.md's Setup Outside the Repo moves into the services doc"]
confirmed: 2026-10-05
---
# Where It Stands
Next: /decide ^status

Shaped 2026-10-05 as a cleanup. `/investigate`'s Current State is the audit itself, read from each service's dashboard. The result is a new doc in `docs/` and a Roadmap line for each change production needs. One decision has to be settled before `/investigate` starts.

# Inbox
- [Sarah] - I suspect some of the white-listed IPs on the Atlas cluster are for my old address, but I don't know which one(s).
- What's known so far: production is on Vercel and doesn't use the same data as local, but Sarah isn't sure whether it's a different database or something else. Its Resend domain is also different. `docs/seed.md` says production is "a different database on the same Atlas cluster" as the dev `test` database. The scan should confirm that, since [[Atlas Version Check Script]] waits on it. Found by `/shape` 2026-10-05.

# Purpose
Audit everything the app and its development rely on, figure out what's set up, document it, and find anything that needs to change. Each change becomes a new story. One that's critical goes under [[Dev Foundations]], and anything else most likely goes to [[App Health]]. Sarah decides which when each story's line is placed.

It covers two Done When items of [[Dev Foundations]]:
- Sarah doesn't have to go digging to remember how her services and accounts are set up, such as how to set up a new MongoDB environment or who she pays for the domain (Cloudflare), when she needs to change anything.
- The production environment on Vercel has been audited: Sarah knows what it uses and how it differs from local, and anything it should be doing differently is fixed or has a Roadmap line.

The audit covers each environment: local dev, production on Vercel, Vercel's preview deployments and CI. Its services include Vercel, MongoDB Atlas (with its IP allowlist), Resend, Google OAuth, Cloudflare, the better-auth secret, and the GitHub and claude.ai setup that `docs/ci.md` records. The doc says where each secret lives, never its value.

`docs/ci.md` ("Setup Outside the Repo") records the CI setup outside the repo (the Claude GitHub App, the cloud environment, the routines, the Actions secrets and the merge block on `main`), with each routine's own configuration in a `routine.md` beside its skill. This audit takes that section into account: it moves the section into the home it sets up for Sarah's services, or links to it.

Sarah's wish for a document about creating a new environment that she can refer back to later moved here from [[E2E Tests in CI]] on 2026-10-02, since CI needs no new environment for the E2E tests.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Current State
Questions for this section:
- How does the scan read the settings that live only in dashboards (Vercel, Atlas, Resend, Cloudflare, Google Cloud)?
  - **Decided 2026-10-05:** Sarah reads them out. The agent asks for one setting at a time, and she looks it up and tells it. Sarah's call.

# Open Decisions
1. Does `docs/ci.md`'s "Setup Outside the Repo" section move into the new services doc, or stay in `docs/ci.md` with the new doc linking to it? Later stories that set up something outside the repo, such as [[Vercel Deploy Errors]] and [[Sentry Logging and Root Cause Analysis]], record it wherever this answer says. Found by `/shape` (2026-10-05).

# Out of Scope
- Building a backup and restore for production's database: [[Database Backup and Restore]].
- Checking the existing docs against the code: [[Docs Audit]].
- Fixing what the audit finds, such as the stale Atlas IPs: each change gets its own Roadmap line, under [[Dev Foundations]] if it's critical, otherwise most likely [[App Health]].

# Acceptance Criteria
- [ ] One doc in `docs/` records every service and account the app and its development use, for each environment, including where each secret lives and who Sarah pays for what.
- [ ] The doc says how to set up a new environment, such as a new MongoDB one.
- [ ] The doc records how production on Vercel differs from local.
- [ ] Each change production needs has its own Roadmap line, placed under the goal Sarah picks for it.
- [ ] `docs/ci.md`'s "Setup Outside the Repo" is moved into the doc or linked from it, as Open Decision 1 settles.

# Implementation
