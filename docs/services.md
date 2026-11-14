# Services and Environments
This doc records everything the app, its development, CI and the routines rely on outside the repo: each environment the app runs in, each service and account and how it's set up, where every secret is stored, and who gets paid for what. It's for anyone who needs to change one of those settings, or to set up a new environment. It assumes you know the app's variables are declared in `src/env.ts`, and nothing more.

Each setting is recorded in its service's entry under "The Services", so that's where a new one goes too. A new app variable also gets a row in "The Environments". How the workflows and routines use their settings is explained in `docs/ci.md`.

It records only where each secret lives, never its value. The repo is public, so it also leaves out the IP addresses on Atlas's access list and the cluster's host name.

# The Environments
The app runs in five places, and each gets the variables in `src/env.ts` from its own source:
- **Local dev:** `pnpm dev` on your machine, reading `.env.local`. The main checkout runs at `http://localhost:3000` against the `test` database. Each worktree gets a slot with its own host name, ports and `test-<n>` database, which `scripts/worktree-slot.sh` writes into its `.env.local` (see `docs/seed.md`, "Worktrees").
- **Production:** Vercel's Production environment, at `https://www.meal-planning.net`, deployed from `main`.
- **Previews:** Vercel's Preview environment, a deployment for each push to any other branch.
- **CI and the routines:** the GitHub Actions workflows and the routines' claude.ai cloud environment, which only check the code and never reach a real service (see `docs/ci.md`, "The App's Variables").
- **Tests:** unit tests and E2E tests, which also reach no real service.

Where each variable's value comes from in each one:

| Variable | Local | Vercel Production | Vercel Preview | CI and routines | Unit tests | E2E tests |
|---|---|---|---|---|---|---|
| `DB_URL` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | the memory server's URI |
| `BETTER_AUTH_SECRET` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | dummy in `playwright.config.ts` |
| `BETTER_AUTH_URL` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | the run's own URL |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | dummy in `playwright.config.ts` |
| `RESEND_API_KEY` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | dummy in `playwright.config.ts` |
| `RESEND_FROM_EMAIL` | `.env.local` | Vercel | Production's value | dummy | `test/mocks/env.ts` | dummy in `playwright.config.ts` |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | `.env.local` | Vercel | not set | not set | not set | dummy in `playwright.config.ts` |
| `NEXT_PUBLIC_VERCEL_ENV` | not set | Vercel's system variable, `production` | Vercel's system variable, `preview` | not set | not set | `development` in `playwright.config.ts` |

Every variable set on Vercel's Environment Variables page, except PostHog's three (see below), applies to both Production and Preview with one shared value, so a preview runs with production's database, Resend key, sender address, Google client and better-auth secret. Because `BETTER_AUTH_URL` is shared too, a link in an email sent from a preview, such as an invite, opens production.

PostHog's three variables, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and the build's `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` (see below), are set on Vercel for Production only, because only production reports errors (see "PostHog"). `NEXT_PUBLIC_VERCEL_ENV` isn't set by hand: Vercel provides it as a system variable. The app reports only when `NEXT_PUBLIC_VERCEL_ENV` is `production` and the project token is set. Local leaves `NEXT_PUBLIC_VERCEL_ENV` unset, so a token in `.env.local` sends nothing.

CI's dummies live in `checks.yml` and the cloud environment's variables (see "The Cloud Environment"). The E2E values are set at the top of `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables").

`BETTER_AUTH_SECRET` is the app's own secret rather than a service's: it signs better-auth's sessions and tokens.

`.env.local` also holds `PORT` and `SIGN_IN_PORT`, which aren't app variables: they set the ports `pnpm dev` and `pnpm sign-in` listen on.

`POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` aren't app variables either. `next.config.mjs` reads them at build time to upload source maps to PostHog, and skips the upload unless both are set. Only Vercel's Production sets them, so every other build skips it. Keep them out of `.env.local`. With them there, every local `pnpm build` and the lefthook `build` hook would upload source maps to PostHog, and `pnpm check:types` would contact PostHog too. `scripts/worktree-setup.sh` copies `.env.local` into every new worktree, so they'd reach every worktree as well.

# How Production Differs From Local
Production and local use the same Atlas cluster, the same Resend API key and the same Google OAuth client. What differs:

| | Local (main checkout) | Production |
|---|---|---|
| Database | `test` | `staging` |
| Database user | `local` (`readWrite` on `test` and `test-1` to `test-5`) | `staging` (`readWrite` on `staging`) |
| `BETTER_AUTH_SECRET` | its own value | a different value |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://www.meal-planning.net` |
| Sender address | `tester@meal-planning.net` | `noreply@meal-planning.net` |

Previews have every production value in this table.

Because `local` has no role on `staging`, nothing run locally can read or change production's database, whichever database `DB_URL` names.

# The Services

## Vercel
Vercel hosts production and the previews, on the Hobby plan. Its GitHub integration deploys each push: a push to `main` goes to Production, and a push to any other branch makes a preview. Production's branch is set in the project's Settings → Environments → Production → Branch Tracking, and stays `main` whatever GitHub's default branch is. The integration also creates the `Preview` and `Production` environments on GitHub, where each deployment shows up.

Production's domain is `www.meal-planning.net`. The bare `meal-planning.net` redirects to it with a 307, so the bare domain needs no entry anywhere else, such as Google's OAuth client.

Deployment Protection has Vercel Authentication on, set to Standard Protection, so opening a preview needs a Vercel login. Production's domain stays public.

The project's Environment Variables page has **Enable access to System Environment Variables** ticked. That gives each deployment Vercel's system variables, such as `NEXT_PUBLIC_VERCEL_ENV`, which turns error reporting on in production. With the setting off, production silently reports nothing: no build or check fails.

**Secrets:** every app variable, and the build's two PostHog variables, in the project's Settings → Environment Variables. PostHog's three, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID`, are set for Production only, with `POSTHOG_API_KEY` marked Sensitive. Every other one is set for both Production and Preview with one value. A changed value reaches only deployments made after the change, so redeploy to pick it up.

### The Vercel Token
`vercel-deploy-errors.yml` reads the project's deployments and build logs with a Vercel access token, kept in the Actions secret `VERCEL_TOKEN`. It's made at Vercel → Account Tokens (https://vercel.com/account/tokens) and expires a year after it's made. It's scoped to the meal-planning project only, so its API calls need no team ID.

Even a project-scoped token can deploy to production and read and change environment variables. So the workflow holds it, and it's never in the cloud environment, the routine or its session (see `docs/ci.md`, "Routines").

### Renewing the Vercel Token
You'll know the token has expired when a session's summary says Vercel refused the workflow's log fetch, or when the Account Tokens page shows its expiry date has passed. To renew it, in order:
1. At https://vercel.com/account/tokens, create a token scoped to the meal-planning project, with a one-year expiry.
2. In GitHub → Settings → Secrets and variables → Actions, replace `VERCEL_TOKEN`'s value with it.
3. Delete the old token on the Account Tokens page.

## MongoDB Atlas
Atlas holds the app's data, on one Free cluster running MongoDB 8.0, the series the E2E tests' memory server runs (see `docs/e2e_tests.md`).

Free clusters get no standard cloud backups, so production's data is backed up by a workflow of the repo's own, as `docs/backups.md` describes.

The cluster holds these databases:
- **`staging`:** production's data, which previews share.
- **`test`:** the main checkout's dev data and seed.
- **`test-1` to `test-5`:** one for each worktree slot.

The app's database users, each signing in with a password (SCRAM):

| User | Role | Who signs in as it |
|---|---|---|
| `local` | `readWrite` on `test` and on `test-1` to `test-5` only | local dev, from the main checkout and every worktree |
| `staging` | `readWrite` on `staging` only | production and previews |
| `backup` | `read` on `staging` only, set under Specific Privileges | `backup.yml`, to dump production's data (see `docs/backups.md`) |

The IP access list (Database & Network Access → IP Access List) has five entries. One is `0.0.0.0/0`, commented "Vercel Dynamic IP". It lets Vercel's deployments in, because a Hobby deployment has no fixed address. It also allows every other address, so the database user's password is the only thing keeping anyone out. The other four are single addresses with no comment. When the list was read on 2026-11-04, one of them was your address, and the other three haven't been identified.

**Secrets:** each user's password is part of its connection string. `local`'s is `DB_URL` in `.env.local`, `staging`'s is `DB_URL` in Vercel, and `backup`'s is the Actions secret `BACKUP_DB_URL`, with no database in its path, since `scripts/db-backup.sh` names `staging` itself.

### Replacing the `backup` User's Password
You'll know it needs replacing when a backup run fails with an authentication error from `mongodump`. To replace it, in order:
1. In Atlas, go to Database & Network Access → Database Users, edit `backup` and use **Autogenerate Secure Password**. If `backup` is gone, add it again with **Add New Database User**, an autogenerated password and `read` on `staging` under Specific Privileges.
2. In GitHub → Settings → Secrets and variables → Actions, replace `BACKUP_DB_URL` with the new connection string, keeping it free of a database name.
3. Take a backup by hand from Actions → **Database Backup** → **Run workflow**, and check that it passes.

## Google Cloud
Google sign-in and One Tap (`oneTap()` in `src/_auth/auth.ts`) go through one OAuth client, `meal-planning-web-app`, on the Google Auth Platform's Clients page. It's a web application, and local, production and previews all use it.

A sign-in's origin and callback have to match an entry on these lists exactly:
- **Authorized JavaScript origins:** `http://localhost`, `http://localhost:3000` and `https://www.meal-planning.net`.
- **Authorized redirect URIs:** `/api/auth/callback/google` on `http://localhost:3000` and on `https://www.meal-planning.net`.

No preview URL and no worktree's `<folder>.localhost` origin is on either list.

The app's Audience is set to External, with publishing status Testing and no test users.

**Secrets:** `GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (the same ID, for One Tap in the browser) and `GOOGLE_CLIENT_SECRET`, in `.env.local` and Vercel. The client has two secrets. Google warns that the older one should be disabled and deleted once the app is confirmed to use the newer one. Which one `.env.local` and Vercel hold hasn't been checked.

## Resend
Resend sends the app's emails, such as invites and email-change links, on the free plan. Its one domain is `meal-planning.net`, which is verified. Local sends from `tester@` there, and production and previews from `noreply@`.

It has one API key, named `meal-planning-test`, with sending permission. Local, production and previews all use it, so revoking or rotating it changes all three at once.

E2E runs never reach Resend: they use a fake (see `docs/e2e_tests.md`, "Environment Variables").

**Secrets:** the key is `RESEND_API_KEY`, in `.env.local` and Vercel. Resend shows a key's value only when it's created.

## PostHog
PostHog's error tracking collects the app's errors, on the free plan. The account is on US Cloud and has one project, which the app reports to only from production. Previews send nothing, because the free plan's one project would group their errors with production's. PostHog sends no alert of its own when a new issue opens, so `production-errors.yml` checks for new issues (see `docs/ci.md`, "Production Errors"). What the app reports, and why the browser's reports go through the app's own `/relay` route, is in `docs/project_conventions.md`, "Error Reporting".

The project has two personal API keys, each limited to the project. The source-map key has write access on error tracking only. Production's build uses it to upload source maps, so a reported stack trace points at the original source. The read key is below.

**Secrets:** the source-map key is `POSTHOG_API_KEY`, in Vercel's Production only. It's marked Sensitive there, so Vercel never shows its value again, and replacing it means creating a new key in PostHog. The project ID, `POSTHOG_PROJECT_ID`, is in Vercel's Production too. The project token, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, is in Vercel's Production and the main checkout's `.env.local`. The project ID and the token aren't secret: the browser bundle carries the token, and the ID only identifies the project.

### The PostHog Read Key
`production-errors.yml` reads issues and events with the read key, which has only the `error_tracking:read` scope. It's kept in the Actions secret `POSTHOG_READ_KEY`. The project's ID is also in the Actions variable `POSTHOG_PROJECT_ID`, since it isn't secret.

The key can only read, but it reads every error the app reports, and errors can hold users' data. So the workflow holds it, and the routine's session gets no PostHog access (see `docs/ci.md`, "Routines").

### Replacing the PostHog Read Key
You'll know the key needs replacing when a session's summary says PostHog refused it. To replace it, in order:
1. In PostHog → account settings → Personal API keys, create a key with only the `error_tracking:read` scope, limited to the project.
2. In GitHub → Settings → Secrets and variables → Actions, replace `POSTHOG_READ_KEY`'s value with it.
3. Delete the old key in PostHog.

## Google Fonts
`next/font/google` in `src/app/layout.tsx` downloads the app's fonts from Google Fonts when the app builds. It needs no account or secret.

## Cloudflare
Cloudflare is the registrar for `meal-planning.net`, serves its DNS, and stores the database backups in R2. The domain renews on 2027-03-02, with auto-renew on.

Its DNS records are all set to "DNS only", so Cloudflare proxies none of the traffic:
- **Vercel:** an `A` record on the bare domain to `216.198.79.1`, a `CNAME` on `www` to a `vercel-dns` target, and two `_vercel` `TXT` records that verify the bare and `www` domains.
- **Resend:** a `resend._domainkey` `TXT` record (DKIM), and an `MX` and an SPF `TXT` record on `send`, pointing at Amazon SES.

The domain has no `_dmarc` record.

R2 is Cloudflare's object storage (see `docs/backups.md`). Its one bucket, `meal-planning-db-backups`, is private. A lifecycle rule on the bucket, with no prefix, deletes each object 7 days after it's uploaded, so the bucket holds about a week of backups. `backup.yml` reads the bucket's name from the Actions variable `R2_BUCKET`, and the account's R2 endpoint, `https://<account ID>.r2.cloudflarestorage.com`, from the Actions secret `R2_ENDPOINT`.

The bucket has two R2 API tokens. Each is scoped to the bucket alone and has only the access its user needs, so a leaked Mac token can't change or delete a backup. The two tokens:
- **The workflow's token,** with Object Read & Write, which `backup.yml` uses to upload. It's kept in the Actions secrets `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
- **Your Mac's token,** with Object Read only, which `pnpm db:restore` uses to download. It's kept in Proton Pass (see "Proton Pass").

**Secrets:** Cloudflare shows an R2 token's secret only when it's created. `docs/backups.md`, "Your Mac's R2 Read Token", says how to replace your Mac's.

### Replacing the Workflow's R2 Token
You'll know it needs replacing when a backup run gets `403 Forbidden` from rclone. To replace it, in order:
1. In the Cloudflare dashboard, open R2 → **Manage API tokens** → **Create Account API token**. Give it **Object Read & Write** permission, scoped to the `meal-planning-db-backups` bucket only.
2. In GitHub → Settings → Secrets and variables → Actions, replace `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` with its Access Key ID and Secret Access Key.
3. Delete the old token on the same Cloudflare page.
4. Take a backup by hand from Actions → **Database Backup** → **Run workflow**, and check that it passes.

## Proton Pass
Your Proton Pass account holds the two secrets a restore needs, so neither sits in a file. `scripts/db-restore.sh` reads them with the `pass-cli` command-line tool. `pass-cli`'s signed-in session has no PIN lock, so `pass-cli` reads them without asking. That lets the restore test run with no step from you. Both items are in the Development vault:
- **"Meal Planning backup key (age)":** the `age` private key that decrypts the backups, in the item's note. Its public key is the Actions variable `BACKUP_AGE_RECIPIENT`. Without the private key, no backup in the bucket can be read.
- **"Meal Planning backup R2 read token":** your Mac's R2 read token, as a login. Its username is the token's Access Key ID, its password is the Secret Access Key, and its website is the account's R2 endpoint.

The restore reads both items by name, so renaming one or moving it out of the vault breaks the restore and the restore test.

## GitHub
The code repo, `SkaffenAmtiskaw/meal-planning`, is public. Vercel's GitHub integration and its environments are under "Vercel".

The notes repo, `meal-planning-notes`, is private, with default branch `main`. It holds the Obsidian vault, and the Obsidian Git plugin commits and pushes it from your machine (see `docs/project_structure.md`, "Notes").

### The Default Branch
The code repo's default branch (Settings → General → Default branch) is `develop`. A routine clones the default branch and runs the skills committed there, so a change to a routine's skill reaches the routine once its PR merges into `develop`. Scheduled workflows run on the default branch too, such as `dependency-updates.yml`. The rulesets name their branches, so they don't change with it, and Vercel's production branch is a separate setting (see "Vercel").

### The Rulesets on `develop` and `main`
Every change reaches `develop` and `main` through a PR whose checks passed, so neither branch can go red, and nothing reaches production except through a PR. The one exception is `back-merge.yml`'s push of a hotfix from `main` straight to `develop`, which merges two sides that each passed (see `docs/ci.md`, "Back-Merge"). How work flows between the branches is in `docs/branching.md`.

Two branch rulesets (Settings → Rules → Rulesets) hold this, with enforcement active. Each is named after its branch and targets it by name, not as the default branch. Both have these rules:
- **Require a pull request before merging,** with 0 approvals, since the review happens in the story's sessions, not on GitHub. A direct push is refused, from your account and so from a routine, which pushes as you.
- **Require status checks to pass:** `lint`, `type-check`, `unit-tests`, `build` and `e2e`, the five check jobs in `checks.yml`. `start-ci-failure` isn't a check, so it isn't required. When a check job changes, these change with it, as `docs/ci.md`, "Keeping the Checks in Step", describes.
- **Restrict deletions** and **Block force pushes.**

The settings that differ between the two rulesets, with each one's value and why:

| | `develop` | `main` |
|---|---|---|
| Merge methods | Squash, for a story or `/tooling` PR, so each lands as one commit dated when it lands. Merge commit, for a hotfix brought back by hand. | Merge commit only, so `main`'s history shows each release and hotfix as it shipped. |
| "Require branches to be up to date before merging" | On, so every PR is tested against the latest `develop` and two PRs that each pass alone can't break it together. After a merge into `develop`, each other open PR needs **Update branch** (or `gh pr update-branch`) and another check run before it can merge. | Off, since merging `develop` into `main` leaves merge commits on `main` that would make `develop` look out of date. |
| Bypass list | The back-merge App only, so `back-merge.yml` can push (see "The Back-Merge App"). | Empty. |

No ruleset setting stops a routine from merging a PR as you, so the `routine-sessions` skill's rule that a routine never merges is the only guard there.

### Pull Request Settings
The settings in Settings → General → Pull Requests, with their values and why:
- **Merge methods:** merge commits and squash allowed, rebase off, to match the rulesets' merge methods.
- **Default commit messages:** a merge commit's message is the PR title, so `main`'s history lists the goals shipped. A squash's is the PR title with its commit details, so a story's step messages survive on `develop`.
- **Allow auto-merge:** on, so a story's PR into `develop` merges by itself once its checks pass.
- **Automatically delete head branches:** on, so after a merge only the local branch and worktree are left, which the SessionStart hook's sweep (`scripts/worktree-sweep.sh`) removes.

### The `notes-pending` Label
While notes work waits on a PR's merge, such as a `/tooling` change's Roadmap edits, the PR carries the repo's `notes-pending` label, and its body lists that work under "Held until the merge". What the SessionStart hook's sweep does with a merged PR that still has the label is in `docs/branching.md`, "Cleaning Up After a Merge".

The label was made once with `gh label create notes-pending --description "Merged PR with notes work still to do"`, since `gh pr create --label` fails on a label that doesn't exist.

### Actions Secrets and Variables
The workflows' secrets and variables are set in Settings → Secrets and variables → Actions. None holds an app variable's real value (see `docs/ci.md`, "The App's Variables"). Each is recorded in full under the service it comes from. The secrets and variables, what reads each and what it holds:

| Name | Kind | Read by | What it holds |
|---|---|---|---|
| `ROUTINE_<NAME>_URL`, `ROUTINE_<NAME>_TOKEN` | secrets | each workflow that starts a routine | the routine's `/fire` URL and bearer token (see "Routines") |
| `VERCEL_TOKEN` | secret | `vercel-deploy-errors.yml` | the Vercel access token (see "The Vercel Token") |
| `POSTHOG_READ_KEY` | secret | `production-errors.yml` | the PostHog read key (see "The PostHog Read Key") |
| `POSTHOG_PROJECT_ID` | variable | `production-errors.yml` | the PostHog project's ID |
| `BACKUP_DB_URL` | secret | `backup.yml` | the Atlas `backup` user's connection string (see "MongoDB Atlas") |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | secrets | `backup.yml` | the workflow's R2 token (see "Cloudflare") |
| `R2_ENDPOINT` | secret | `backup.yml` | the account's R2 endpoint |
| `R2_BUCKET` | variable | `backup.yml` | the bucket's name, `meal-planning-db-backups` |
| `BACKUP_AGE_RECIPIENT` | variable | `backup.yml` | the `age` public key each dump is encrypted to. It isn't secret: it can only encrypt. Its private key is in Proton Pass (see `docs/backups.md`, "The `age` Key Pair"). |
| `BACK_MERGE_APP_CLIENT_ID`, `BACK_MERGE_APP_PRIVATE_KEY` | secrets | `back-merge.yml` | the back-merge App's Client ID and private key (see "The Back-Merge App") |

### The Back-Merge App
`back-merge.yml` pushes as a GitHub App of your own, `meal-planning-back-merge` (your Settings → Developer settings → GitHub Apps), the one actor on the `develop` ruleset's bypass list. Your account mustn't be on the list, because routines push as you and would get through too.

> [!NOTE]
> GitHub doesn't let a workflow's built-in token be on a bypass list at all. That leaves an App as the only actor that can be on the list without letting your account, and so the routines, through.

The App has no webhook, is installed on `meal-planning` only, and has Contents and Workflows read and write. Its Client ID and private key are the Actions secrets `BACK_MERGE_APP_CLIENT_ID` and `BACK_MERGE_APP_PRIVATE_KEY`. If the key is lost or leaked, generate a new one on the App's page, replace `BACK_MERGE_APP_PRIVATE_KEY`'s value and delete the old key there.

### The Claude GitHub App
The [Claude GitHub App](https://github.com/apps/claude) is installed with access to `meal-planning` and `meal-planning-notes`. It lets routines clone both repos, push `claude/` branches in `meal-planning` and push to `main` in `meal-planning-notes`. A cloud session reaches GitHub through the cloud GitHub proxy, which authenticates `git` and `gh` with the App's access, so no GitHub token is stored anywhere.

The App's access also covers what the routines' sessions do with PRs and runs on GitHub. A run's logs need one more allowed host in the cloud environment (see "The Cloud Environment").

## claude.ai
Your Claude Max subscription runs Claude Code, both on your machine and in the routines' cloud sessions.

### The Cloud Environment
Routines run in a claude.ai cloud environment named `Meal Planning Routines` (at https://claude.ai/code, the cloud button above the message box). A new session starts from a snapshot of what its setup script installed. When you change the network access, the variables or the script on claude.ai, update this record to match at the same time.

**Network access:** Custom, with **Also include default list of common package managers** (the Trusted list) checked, since sessions install from npm, get Node from `nodejs.org` and download Google Fonts in `pnpm build`. The allowed domains:

```text
results-receiver.actions.githubusercontent.com
tuf-repo-cdn.sigstore.dev
cdn.playwright.dev
fastdl.mongodb.org
react.dev
nextjs.org
mantine.dev
better-auth.com
zod.dev
```

Each domain is there for one need:
- **`results-receiver.actions.githubusercontent.com`:** a run's logs, which `gh run view --log-failed` downloads from it.
- **`tuf-repo-cdn.sigstore.dev`:** mise's check of pnpm's provenance when it installs pnpm. Without it, `mise install` fails and stops the setup script, so sessions don't get mise's Node and pnpm.
- **`cdn.playwright.dev` and `fastdl.mongodb.org`:** Chromium and `mongod`, so a session can run `pnpm test:e2e`, as the `ci-failure` routine does when the `e2e` check fails. The setup script downloads both, so they're in the snapshot, and a session fetches them only if the script's download failed.
- **The other five:** the release notes and guides of the libraries that the `dependency-updates` routine's `upgrade-assessor` subagent assesses. It also assesses Luxon, whose docs it reads from `docs/` in `moment/luxon` on GitHub, which the session can already reach.

**Variables:** the dummy values from `checks.yml` (see `docs/ci.md`, "The App's Variables"), plus `CLAUDE_ENV_FILE`, the path of a file Claude Code runs before each command in the session, which the setup script writes. There's no `GH_TOKEN` or `GITHUB_TOKEN`: a token set here would pass into the session, where Claude and its commands could read it, and the GitHub proxy needs none.

```text
DB_URL=mongodb://localhost:27017/ci
BETTER_AUTH_SECRET=ci-dummy-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=ci-google-client-id
GOOGLE_CLIENT_SECRET=ci-google-client-secret
RESEND_API_KEY=ci-resend-api-key
RESEND_FROM_EMAIL=ci@example.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ci-google-client-id
CLAUDE_ENV_FILE=/opt/mise-session-env.sh
```

**Setup script:** it runs before Claude Code starts, and only the files it writes carry over into sessions. Its comments say why each part is there, and `docs/ci.md`, "The Repo Declares Its Tools", says how it fits with `mise.toml`.

```bash
#!/bin/bash
# Setup script for the `Meal Planning Routines` cloud environment. Its record is in docs/services.md, "The Cloud Environment".
set -euo pipefail

# mise's own download hosts aren't on the Trusted list, so it comes from npm.
npm install -g @jdxcode/mise

# mise's default backend for pnpm downloads from GitHub releases, which the GitHub proxy blocks for
# repos not attached to the session. With it off, mise installs pnpm from npm.
export MISE_DISABLE_BACKENDS=aqua
# Sessions need only node and pnpm. Without this, mise looks up the other tools' latest versions on hosts the
# session can't reach, such as GitHub, which returns a 403.
export MISE_DISABLE_TOOLS=rtk,age,rclone,http:mongodb-database-tools

# Find the cloned repo, to install the versions its mise.toml names.
repo=""
for f in $(find / -maxdepth 4 -path /proc -prune -o -name mise.toml -print 2>/dev/null); do
  if grep -q '"name": "meal-planner"' "$(dirname "$f")/package.json" 2>/dev/null; then
    repo=$(dirname "$f")
    break
  fi
done
if [ -z "$repo" ]; then
  echo "setup: can't find the meal-planning repo, so there's no mise.toml to install from" >&2
  exit 1
fi
echo "setup: repo found at $repo"
cd "$repo"
mise trust mise.toml
mise install node pnpm

# Claude Code runs this file before each Bash command (CLAUDE_ENV_FILE, set in the environment's
# variables), so the session runs mise's Node and pnpm, not the image's /opt/node22.
shims="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims"
cat > /opt/mise-session-env.sh <<EOF
export MISE_DISABLE_BACKENDS=aqua
export MISE_DISABLE_TOOLS=rtk,age,rclone,http:mongodb-database-tools
export PATH="$shims:\$PATH"
EOF

# Warms the pnpm store for the cached snapshot. Each session installs again after its checkout.
# The install also downloads mongod for the E2E tests' database, through mongodb-memory-server's postinstall.
export PATH="$shims:$PATH"
pnpm install --frozen-lockfile || echo "setup: pnpm install failed; each session installs on its own" >&2

# pnpm test:e2e downloads Chromium itself, but not the system libraries it needs, which --with-deps installs
# through apt. Installing both here puts them in the snapshot. apt needs root, and this script runs as root.
pnpm exec playwright install --with-deps chromium || echo "setup: Chromium install failed, so sessions may lack the system libraries pnpm test:e2e needs" >&2
```

### Routines
Each routine's configuration on claude.ai (its prompt, trigger, model and environment) is in the `routine.md` beside its skill, and `docs/ci.md`, "Routines", says what each one is for. A routine runs the skill committed on the default branch (see "The Default Branch").

A workflow that starts a routine reads its `/fire` URL and bearer token from two Actions secrets named after the routine: `ROUTINE_<NAME>_URL` and `ROUTINE_<NAME>_TOKEN`, such as `ROUTINE_CI_FAILURE_URL`. Neither value is written anywhere in the repo. Each routine's `routine.md` names its two secrets.

Both come from the routine's API trigger on claude.ai (open the routine → Edit → **Select a trigger** → **API**). The token is shown only once, when it's generated, so it goes straight into the secret. If it's lost, **Regenerate** makes a new one, which revokes the old one, and the new one replaces the secret's value.

To add a routine, go to https://claude.ai/code/routines → **New routine**. The form adds a **Pull request: Opened** GitHub trigger by default. Remove it with ✕, then add the trigger the routine needs with **+ Add another trigger**. To try a routine that reads the `text` it's sent, call its API trigger with `curl`, as the trigger's sample command shows. **Run now** has no text field.

### The Desktop App's Branch Prefix
The Claude desktop app names each worktree branch from its branch prefix (Settings → Claude Code), which is `feature/`, so a story's or `/tooling` change's branch is `feature/<generated name>`. A prefix of `claude/`, the app's default, would break CI's reporting: `start-ci-failure` and `vercel-deploy-errors.yml` treat a `claude/` branch as a routine's own fix and start no session for it, so a story's failed check or failed preview would start nothing.

# Who You Pay
- **Cloudflare:** the domain, renewing 2027-03-02 with auto-renew on. R2 bills only beyond its free allowance of 10 GB stored, which a week of the database's backups stays far below.
- **Anthropic:** the Claude Max subscription.

Nothing else is known to be paid: Vercel is on its Hobby plan, Atlas on a Free cluster, and Resend and PostHog on their free plans.

# Setting Up a New Environment
A new environment, such as one for previews apart from production, needs its own database user, `DB_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and Resend key. It shares the Google OAuth client: you add the environment's URLs to the client, and it uses the same client ID and secret.

The steps go service by service, in the order they depend on each other, starting with the database. The dashboards' menus change, so each step links the service's own doc.

1. **Create its database user in Atlas.** Go to Database & Network Access → Database Users → **Add New Database User**. Choose Password, enter a username and use **Autogenerate Secure Password**. Under Specific Privileges, add `readWrite` on the new environment's database only, the same role production's `staging` user has. That keeps the environment away from every other environment's data. Then click **Add User** ([Atlas: Configure Database Users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/)). The database itself needs no setup, since MongoDB creates it on the app's first write.
2. **Let it reach the cluster.** If it's a Vercel deployment, skip this step: it already gets in through the `0.0.0.0/0` entry. If it runs on a new machine, add the machine's address: Database & Network Access → IP Access List → **Add IP Address**, with a comment that says whose it is ([Atlas: Configure IP Access List Entries](https://www.mongodb.com/docs/atlas/security/ip-access-list/)).
3. **Build its `DB_URL`** from the new user, its password and the new database's name. The cluster's host stays the one in the other environments' `DB_URL`, since the app has one cluster. The seed runs only against `test` and `test-<n>` (`seed/databaseNames.ts`), so any other environment's database starts empty.
4. **Generate its `BETTER_AUTH_SECRET` and set its `BETTER_AUTH_URL`.** Generate the secret with `openssl rand -base64 32`. better-auth asks for a high-entropy value of at least 32 characters, and this gives one ([better-auth: Installation](https://better-auth.com/docs/installation)). Set `BETTER_AUTH_URL` to the environment's own URL, which is where its email links point.
5. **Add its URLs to Google's OAuth client.** An origin can't hold a path, and needs `https` unless it's on `localhost`. It can't hold a wildcard either, so each entry has to be one exact origin. If the environment's origin changes with each deployment, as a preview's does, it can't be added. Otherwise, on the Google Auth Platform's Clients page, open `meal-planning-web-app`. Add the environment's origin under Authorized JavaScript origins, and its `/api/auth/callback/google` URL under Authorized redirect URIs. See [Google Cloud: Manage OAuth Clients](https://support.google.com/cloud/answer/15549257).
6. **Create its Resend API key** on Resend's API Keys page, with sending access, which can be limited to `meal-planning.net`. Copy the value then, because Resend never shows it again ([Resend: API Keys](https://resend.com/docs/dashboard/api-keys/introduction)). Choose a sender address at `meal-planning.net` for `RESEND_FROM_EMAIL`.
7. **Put the values where the environment reads them,** along with the Google client's ID and secret.
   - **If it's local:** put them in its `.env.local`.
   - **If it's deployed:** put them in Vercel's Settings → Environment Variables. If the new environment is Preview, first edit each existing variable so it applies to Production only, because today every one except PostHog's three is set for both. Then set each new variable for the new environment only, and redeploy ([Vercel: Managing Environment Variables](https://vercel.com/docs/environment-variables/managing-environment-variables)).
8. **Record it here.** Add the environment to "The Environments", and its users, keys and URLs to each service's entry.
