---
type: cleanup
status: spec
blocked-by: []
confirmed: 2026-11-04
---
# Where It Stands
Audited. Next: /plan-steps ^status

The readings are in Current State. What remains is writing the new doc in `docs/` and splitting `docs/ci.md`'s "Setup Outside the Repo". Open Decision 2's ten findings have their Roadmap lines.

# Inbox
- From Large Workflow Changes (`/tooling`, 2026-11-03): this note is typed cleanup but changes no code. It reads settings from dashboards and produces a doc and Roadmap lines, so the running-app click-through checks in `.claude/skills/writing-implementation-steps/checks.md` may not fit its steps.

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
The repo is public, so these findings and the new doc leave out Sarah's IP addresses and the cluster's host name.

## From the Repo
Checked 2026-11-04 by reading `src/env.ts`, `src/_auth/auth.ts`, `playwright.config.ts`, `.github/workflows/`, `docs/ci.md`, `docs/seed.md`, `docs/e2e_tests.md`, each `routine.md` and the variable names in `.env.local`, plus grep across `src`, `seed`, `scripts`, `e2e` and `test` for `process.env`, `env.` and each service's name.

**The app's variables** (`src/env.ts`), by where each gets its value:

| Variable | Service | Local | Unit tests | E2E | CI and routines |
|---|---|---|---|---|---|
| `DB_URL` | MongoDB Atlas | `.env.local` | `test/mocks/env.ts` | memory server | dummy |
| `BETTER_AUTH_SECRET` | better-auth | `.env.local` | `test/mocks/env.ts` | dummy | dummy |
| `BETTER_AUTH_URL` | the app's own URL | `.env.local`: `http://localhost:3000` | `test/mocks/env.ts` | Playwright's base URL | dummy |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth, plus One Tap (`oneTap()` in `src/_auth/auth.ts`) | `.env.local` | `test/mocks/env.ts` | dummy | dummy |
| `RESEND_API_KEY` | Resend | `.env.local` | `test/mocks/env.ts` | dummy | dummy |
| `RESEND_FROM_EMAIL` | Resend | `.env.local`, at `meal-planning.net` | `test/mocks/env.ts` | dummy | dummy |

No other service is in the code: `package.json` has no Sentry or Vercel package. `next/font/google` in `src/app/layout.tsx` downloads Google Fonts at build. No `.vercel` folder or `vercel.json` is in the repo, and `.env.local` is the only env file.

**Local database:** `DB_URL` in `.env.local` points at a host whose name starts with `dev.`, database `test` (read with the credentials stripped). `docs/e2e_tests.md` says the Atlas cluster runs the 8.0 series and pins the memory server to `8.0.32`. `docs/seed.md` says production is on the same cluster, which the dashboard reading has to confirm.

**GitHub** (read with `gh api` and `gh secret list`, 2026-11-04): the repo `SkaffenAmtiskaw/meal-planning` is public, its default branch is `develop`, and auto-merge is off. The `main` ruleset matches `docs/ci.md`: active, no bypass, deletion and force-push blocked, and `lint`, `type-check`, `unit-tests` and `build` required. The Actions secrets are the four `ROUTINE_*` ones `docs/ci.md` names. There are no Actions variables. GitHub environments `Preview` and `Production` exist, and `vercel[bot]` created the five latest deployments, all `Preview`, so Vercel's GitHub integration is on.

**The claude.ai setup:** `docs/ci.md` and each `routine.md` record the Claude GitHub App, the `Meal Planning Routines` cloud environment and the `ci-failure` and `dependency-updates` routines.

## From the Dashboards
Sarah read these out on 2026-11-04.

**Vercel, `DB_URL`:**
- **Production:** the same host as local, database `staging`. It's the same cluster as local, as `docs/seed.md` says, and the two differ only by database name.
- **Preview:** the same value as Production, so preview deployments read and write production's data.

**Vercel, `BETTER_AUTH_URL`:**
- **Production:** `https://www.meal-planning.net`.
- **Preview:** `https://www.meal-planning.net`, the same as Production, so an invite or email-change link sent from a preview opens production.

**Vercel, `RESEND_FROM_EMAIL`:**
- **Production:** `noreply@meal-planning.net`. Local sends from `tester@meal-planning.net` (read from `.env.local`), so both use the same domain.

**Vercel, Preview:** every app variable applies to both Production and Preview, with one shared value. Sarah doesn't recall ever setting up separate Preview values. So a preview uses production's database, Resend key, sender address, Google credentials and better-auth secret.

**Resend, domains:** `meal-planning.net` is the only one, and it's verified.

**Resend, plan:** free.

**What Sarah pays for:** the domain at Cloudflare and a Claude Max subscription. As far as she recalls, nothing else is paid.

**Resend, API keys:** one key, named `meal-planning-test`, with sending permission. Since it's the only key, local, production and previews all use it.

**Atlas, IP access list:** five entries, all active. One is `0.0.0.0/0`, commented "Vercel Dynamic IP", which allows every address, so the cluster's database password is the only thing keeping anyone out. The other four are single addresses (`/32`) with no comment. One of those is Sarah's current address, and the other three can't be told apart from the list. The addresses stay out of this note because the repo is public.

**Atlas, cluster:** Free tier, MongoDB 8.0.36, which is in the 8.0 series `docs/e2e_tests.md` names. Atlas's docs say standard cloud backups aren't available on Free clusters, and that a daily-snapshot subscription for them is in private preview ([Free Cluster Backups](https://www.mongodb.com/docs/atlas/backup/cloud-backup/free-cluster-backup/), read 2026-11-04). Nobody checked this cluster's Backup page, so assume production's data has no backups.

**Atlas, database users:** two, both using SCRAM and both showing All Resources: `seadams` with `atlasAdmin@admin`, and `staging` ("staging environment") with `readWrite@staging`. Local's `DB_URL` signs in as `seadams` (read from `.env.local` with the password stripped), so local has admin rights over the whole cluster, production's `staging` database included. The database name in `DB_URL` and the seed's guard (`seed/devDatabase.ts`) are what keep local work off production's data. Production's `DB_URL` signs in as `staging`, so production and previews can reach only the `staging` database.

**Cloudflare, domain:** `meal-planning.net` is registered with Cloudflare, status Active, and shows a renewal on March 2, 2027 with the auto-renew icon.

**Cloudflare, DNS:** seven records, all DNS only, so Cloudflare proxies nothing:
- **Vercel:** an `A` record on the bare domain to `216.198.79.1`, a `CNAME` on `www` to a `vercel-dns` target, and two `_vercel` `TXT` records that verify the bare and `www` domains.
- **Resend:** a `resend._domainkey` `TXT` (DKIM), and an `MX` and an SPF `TXT` on `send`, pointing at Amazon SES.
- **Not there:** no `_dmarc` record.

**Google Cloud, OAuth:** one client, `meal-planning-web-app`, a web application created 2025-12-28, shown with a warning icon. Local, production and previews share it. Its JavaScript origins are `http://localhost`, `http://localhost:3000` and `https://www.meal-planning.net`. Its redirect URIs are `/api/auth/callback/google` on `http://localhost:3000` and on `https://www.meal-planning.net`. No preview URL and not the bare domain is on either list. The warning icon says the client has more than one secret, and that the old one should be disabled and deleted once the app is confirmed to use the new one.

**Google Cloud, Audience:** publishing status Testing, user type External. Publish app is greyed out until the Branding page is complete. The test-user list is empty. Google sign-in on production worked when Sarah tried it on 2026-11-04. Whether it works for an account other than hers wasn't tested.

**Vercel, domains** (`curl -I` on both, 2026-11-04): `https://meal-planning.net` redirects to `https://www.meal-planning.net/` with a 307, and `www` answers 200, so the bare domain needs no entry in the OAuth client.

**Vercel, `BETTER_AUTH_SECRET`:** production's value differs from local's (Sarah compared them on 2026-11-04). Previews share production's.

**Vercel, plan:** Hobby.

**Vercel, Deployment Protection:** Vercel Authentication is on, with Require Log In set to Standard Protection. The latest preview URL sends an anonymous `curl -I` to `https://vercel.com/sso-api` with a 302, so strangers can't open a preview (checked 2026-11-04), and `www.meal-planning.net` still answers 200.

**Vercel, production deploys** (`gh api` deployments and `git log`, 2026-11-04): the latest `Production` deployment is `11f8a9c` from 2026-10-04, which is the tip of `main`, as `docs/ci.md` says it tracks. `develop` is 307 commits ahead of `main`.

# Open Decisions
1. Does `docs/ci.md`'s "Setup Outside the Repo" section move into the new services doc, or stay in `docs/ci.md` with the new doc linking to it? Later stories that set up something outside the repo, such as [[Vercel Deploy Errors]], [[Sentry Error Reporting]] and [[Sentry Root Cause Analysis]], record it wherever this answer says. Found by `/shape` (2026-10-05).
   - **Decided 2026-10-06:** Split `docs/ci.md`'s "Setup Outside the Repo" by what depends on each setting. `docs/ci.md` keeps setup that exists only so a workflow or routine works, recorded beside that workflow. The services doc holds setup the app or Sarah's machine depends on in any environment, plus accounts, billing and how to set up a new environment, and has one entry per service that names its secrets and where they're stored, linking to `docs/ci.md` for CI-only ones. The rule for later stories: if a setting exists only so a workflow or routine works, record it in `docs/ci.md` and link it from the service's entry in the services doc; otherwise record it in the services doc; if it serves both, record it beside the repo files it has to change with. Of today's section, only the clause on Vercel's production branch tracking `main` and where the app's variables get their real values (Vercel Production and Preview, `.env.local`) move. Records that have to change with `checks.yml`, `mise.toml` or a workflow stay beside them, as Google's documentation best practices advise, and the services doc gives Sarah one place to start without repeating anything.
     - Rejected: move all of it to the services doc - it separates records from the files they have to change with, and needs Sarah to edit the setup script on claude.ai.
     - Rejected: keep all of it in `docs/ci.md`, with one link from the services doc - it gives later stories no rule for setup that isn't CI.
     - Rejected: split by vendor (GitHub and claude.ai in `docs/ci.md`, everything else in the services doc) - it splits one feature across two docs, such as the Vercel token and the workflow that uses it.
2. Which of the audit's findings become changes? Found by `/audit` (2026-11-04).
   - **Decided 2026-11-04:** all of them, each with its own Roadmap line. Sarah's call. Findings 1 and 4 are under [[Dev Foundations]] and the rest, other than 9, under [[App Health]], which she approved from an agent's recommendations. Finding 9's line is the uncommitted idea [[Paid Atlas Clusters]], Sarah's call: she might need it eventually, but not yet. The findings are:
     1. Previews use production's database, Resend key, Google client and better-auth secret.
     2. Atlas's IP access list allows `0.0.0.0/0`.
     3. The allowlist has three unlabelled addresses, probably including Sarah's old ones.
     4. Local's `DB_URL` signs in as an `atlasAdmin` user.
     5. One Resend key, named `meal-planning-test`, is used everywhere.
     6. The domain has no DMARC record.
     7. The Google OAuth client has two secrets.
     8. Google OAuth is in Testing with no test users.
     9. Production shares a Free cluster with dev and likely has no backups.
     10. Production's database is named `staging`, on a host starting `dev.`.
     - Rejected: finding 9 under [[Dev Foundations]] - she isn't ready to pay and hasn't come close to any limits.
3. How does the scan read the settings that live only in dashboards (Vercel, Atlas, Resend, Cloudflare, Google Cloud)?
   - **Decided 2026-10-05:** Sarah reads them out. The agent asks for one setting at a time, and she looks it up and tells it. Sarah's call.

# Out of Scope
- Building a backup and restore for production's database: [[Database Backup and Restore]].
- Checking the existing docs against the code: [[Docs Audit]].
- Fixing what the audit finds, such as the stale Atlas IPs: each change gets its own Roadmap line, under [[Dev Foundations]] if it's critical, otherwise most likely [[App Health]].

# Acceptance Criteria
- [ ] One doc in `docs/` records every service and account the app and its development use, for each environment, including where each secret lives and who Sarah pays for what.
- [ ] The doc says how to set up a new environment, such as a new MongoDB one.
- [ ] The doc records how production on Vercel differs from local.
- [ ] `docs/ci.md`'s "Setup Outside the Repo" is split with the doc as Open Decision 1 settles, and both docs state the rule for which one records a new setting.

# Implementation
