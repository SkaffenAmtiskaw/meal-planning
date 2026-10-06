---
type: cleanup
status: idea
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Decisions made. Next: /investigate ^status

Shaped 2026-10-05 as a cleanup. `/investigate`'s Current State is the audit itself, read from each service's dashboard. The result is a new doc in `docs/` and a Roadmap line for each change production needs. Its one decision, how the new doc splits `docs/ci.md`'s "Setup Outside the Repo", was settled 2026-10-06.

# Inbox
- [Sarah] - I suspect some of the white-listed IPs on the Atlas cluster are for my old address, but I don't know which one(s).
- What's known so far: production is on Vercel and doesn't use the same data as local, but Sarah isn't sure whether it's a different database or something else. Its Resend domain is also different. `docs/seed.md` says production is "a different database on the same Atlas cluster" as the dev `test` database. The scan should confirm that, since [[Atlas Version Check Script]] waits on it. Found by `/shape` 2026-10-05.

# Purpose
Audit everything the app and its development rely on, figure out what's set up, document it, and find anything that needs to change. Each change becomes a new story. One that's critical goes under [[Dev Foundations]], and anything else most likely goes to [[App Health]]. Sarah decides which when each story's line is placed.

It covers two Done When items of [[Dev Foundations]]:
- Sarah doesn't have to go digging to remember how her services and accounts are set up, such as how to set up a new MongoDB environment or who she pays for the domain (Cloudflare), when she needs to change anything.
- The production environment on Vercel has been audited: Sarah knows what it uses and how it differs from local, and anything it should be doing differently is fixed or has a Roadmap line.

The audit covers each environment: local dev, production on Vercel, Vercel's preview deployments and CI. Its services include Vercel, MongoDB Atlas (with its IP allowlist), Resend, Google OAuth, Cloudflare, the better-auth secret, and the GitHub and claude.ai setup that `docs/ci.md` records. The doc says where each secret lives, never its value.

`docs/ci.md` ("Setup Outside the Repo") records the CI setup outside the repo (the Claude GitHub App, the cloud environment, the routines, the Actions secrets and the merge block on `main`), with each routine's own configuration in a `routine.md` beside its skill. This audit splits that section with the new doc, as Open Decision 1 settles, and writes the rule for which doc records a setting into both docs.

Sarah's wish for a document about creating a new environment that she can refer back to later moved here from [[E2E Tests in CI]] on 2026-10-02, since CI needs no new environment for the E2E tests.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Current State
Questions for this section:
- How does the scan read the settings that live only in dashboards (Vercel, Atlas, Resend, Cloudflare, Google Cloud)?
  - **Decided 2026-10-05:** Sarah reads them out. The agent asks for one setting at a time, and she looks it up and tells it. Sarah's call.

# Open Decisions
1. Does `docs/ci.md`'s "Setup Outside the Repo" section move into the new services doc, or stay in `docs/ci.md` with the new doc linking to it? Later stories that set up something outside the repo, such as [[Vercel Deploy Errors]] and [[Sentry Logging and Root Cause Analysis]], record it wherever this answer says. Found by `/shape` (2026-10-05).
   - **Decided 2026-10-06:** Split `docs/ci.md`'s "Setup Outside the Repo" by what depends on each setting. `docs/ci.md` keeps setup that exists only so a workflow or routine works, recorded beside that workflow. The services doc holds setup the app or Sarah's machine depends on in any environment, plus accounts, billing and how to set up a new environment, and has one entry per service that names its secrets and where they're stored, linking to `docs/ci.md` for CI-only ones. The rule for later stories: if a setting exists only so a workflow or routine works, record it in `docs/ci.md` and link it from the service's entry in the services doc; otherwise record it in the services doc; if it serves both, record it beside the repo files it has to change with. Of today's section, only the clause on Vercel's production branch tracking `main` and where the app's variables get their real values (Vercel Production and Preview, `.env.local`) move. Records that have to change with `checks.yml`, `mise.toml` or a workflow stay beside them, as Google's documentation best practices advise, and the services doc gives Sarah one place to start without repeating anything.
     - Rejected: move all of it to the services doc - it separates records from the files they have to change with, and needs Sarah to edit the setup script on claude.ai.
     - Rejected: keep all of it in `docs/ci.md`, with one link from the services doc - it gives later stories no rule for setup that isn't CI.
     - Rejected: split by vendor (GitHub and claude.ai in `docs/ci.md`, everything else in the services doc) - it splits one feature across two docs, such as the Vercel token and the workflow that uses it.

# Out of Scope
- Building a backup and restore for production's database: [[Database Backup and Restore]].
- Checking the existing docs against the code: [[Docs Audit]].
- Fixing what the audit finds, such as the stale Atlas IPs: each change gets its own Roadmap line, under [[Dev Foundations]] if it's critical, otherwise most likely [[App Health]].

# Acceptance Criteria
- [ ] One doc in `docs/` records every service and account the app and its development use, for each environment, including where each secret lives and who Sarah pays for what.
- [ ] The doc says how to set up a new environment, such as a new MongoDB one.
- [ ] The doc records how production on Vercel differs from local.
- [ ] Each change production needs has its own Roadmap line, placed under the goal Sarah picks for it.
- [ ] `docs/ci.md`'s "Setup Outside the Repo" is split with the doc as Open Decision 1 settles, and both docs state the rule for which one records a new setting.

# Implementation
