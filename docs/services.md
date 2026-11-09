# Services and Environments
This doc records everything the app and its development rely on outside the repo: each environment the app runs in, each service and account, where every secret is stored, and who gets paid for what. It's for anyone who needs to change one of those settings, or to set up a new environment. It assumes you know the app's variables are declared in `src/env.ts`, and nothing more.

It records only where each secret lives, never its value. The repo is public, so it also leaves out the IP addresses on Atlas's access list and the cluster's host name.

`docs/ci.md` records the setup that exists only so a workflow or routine works, such as the Actions secrets and the claude.ai cloud environment. This doc links to each piece from the service it belongs to. "Which Doc Records a New Setting" at the end says how the two divide.

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

Every variable set on Vercel's Environment Variables page, except PostHog's three, applies to both Production and Preview with one shared value, so a preview runs with production's database, Resend key, sender address, Google client and better-auth secret. Because `BETTER_AUTH_URL` is shared too, a link in an email sent from a preview, such as an invite, opens production.

PostHog's three variables, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and the build's `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` (see below), are set on Vercel for Production only, because only production reports errors (see "PostHog"). `NEXT_PUBLIC_VERCEL_ENV` isn't set by hand: Vercel provides it as a system variable. The app reports only when `NEXT_PUBLIC_VERCEL_ENV` is `production` and the project token is set. Local leaves `NEXT_PUBLIC_VERCEL_ENV` unset, so a token in `.env.local` sends nothing.

CI's dummies live in `checks.yml` and the cloud environment's variables, as `docs/ci.md` records. The E2E values are set at the top of `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables").

`BETTER_AUTH_SECRET` is the app's own secret rather than a service's: it signs better-auth's sessions and tokens.

`.env.local` also holds `PORT` and `SIGN_IN_PORT`, which aren't app variables: they set the ports `pnpm dev` and `pnpm sign-in` listen on.

`POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` aren't app variables either. `next.config.mjs` reads them at build time to upload source maps to PostHog, and skips the upload unless both are set. The main checkout's `.env.local` holds them, and `scripts/worktree-setup.sh` copies that file into each new worktree, so a local `pnpm build` uploads source maps too. The app it builds still reports nothing, because `NEXT_PUBLIC_VERCEL_ENV` isn't `production` there.

# How Production Differs From Local
Production and local use the same Atlas cluster, the same Resend API key and the same Google OAuth client. What differs:

| | Local (main checkout) | Production |
|---|---|---|
| Database | `test` | `staging` |
| Database user | `seadams` (`atlasAdmin`) | `staging` (`readWrite` on `staging`) |
| `BETTER_AUTH_SECRET` | its own value | a different value |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://www.meal-planning.net` |
| Sender address | `tester@meal-planning.net` | `noreply@meal-planning.net` |

Previews have every production value in this table.

Because local signs in as an admin user, it could reach production's `staging` database. What keeps local work off production's data is the database name in `DB_URL`, and the seed's check of that name before it connects (see `docs/seed.md`).

# The Services

## Vercel
Vercel hosts production and the previews, on the Hobby plan. Its GitHub integration deploys each push: a push to `main` goes to Production, and a push to any other branch makes a preview. Production's branch is set in the project's Settings → Environments → Production → Branch Tracking, and stays `main` whatever GitHub's default branch is. The integration also creates the `Preview` and `Production` environments on GitHub, where each deployment shows up.

Production's domain is `www.meal-planning.net`. The bare `meal-planning.net` redirects to it with a 307, so the bare domain needs no entry anywhere else, such as Google's OAuth client.

Deployment Protection has Vercel Authentication on, set to Standard Protection, so opening a preview needs a Vercel login. Production's domain stays public.

The project's Environment Variables page has **Enable access to System Environment Variables** ticked. That gives each deployment Vercel's system variables, such as `NEXT_PUBLIC_VERCEL_ENV`, which turns error reporting on in production. With the setting off, production silently reports nothing: no build or check fails.

**Secrets:** every app variable, and the build's two PostHog variables, in the project's Settings → Environment Variables. PostHog's three, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID`, are set for Production only, with `POSTHOG_API_KEY` marked Sensitive. Every other one is set for both Production and Preview with one value. A changed value reaches only deployments made after the change, so redeploy to pick it up.

`docs/ci.md`, "The Vercel Token", records the access token `vercel-deploy-errors.yml` uses to read failed deployments' build logs.

## MongoDB Atlas
Atlas holds the app's data, on one Free cluster running MongoDB 8.0.36. The E2E tests' memory server runs the same 8.0 series (see `docs/e2e_tests.md`).

Free clusters get no standard cloud backups, and the cluster's Backup page hasn't been checked, so assume production's data has no backups.

The cluster holds these databases:
- **`staging`:** production's data, which previews share.
- **`test`:** the main checkout's dev data and seed.
- **`test-1` to `test-5`:** one for each worktree slot.

Its database users, both signing in with a password (SCRAM):

| User | Role | Who signs in as it |
|---|---|---|
| `seadams` | `atlasAdmin`, on every database | local dev, from the main checkout and every worktree |
| `staging` | `readWrite` on `staging` only | production and previews |

The IP access list (Database & Network Access → IP Access List) has five entries. One is `0.0.0.0/0`, commented "Vercel Dynamic IP". It lets Vercel's deployments in, because a Hobby deployment has no fixed address. It also allows every other address, so the database user's password is the only thing keeping anyone out. The other four are single addresses with no comment. When the list was read on 2026-11-04, one of them was your address, and whose the other three are isn't known.

**Secrets:** each user's password is part of `DB_URL`, so local's is in `.env.local` and production's is in Vercel.

## Google Cloud
Google sign-in and One Tap (`oneTap()` in `src/_auth/auth.ts`) go through one OAuth client, `meal-planning-web-app`, on the Google Auth Platform's Clients page. It's a web application, and local, production and previews all use it.

A sign-in's origin and callback have to match an entry on these lists exactly:
- **Authorized JavaScript origins:** `http://localhost`, `http://localhost:3000` and `https://www.meal-planning.net`.
- **Authorized redirect URIs:** `/api/auth/callback/google` on `http://localhost:3000` and on `https://www.meal-planning.net`.

No preview URL and no worktree's `<folder>.localhost` origin is on either list.

The app's Audience is set to External, with publishing status Testing and no test users. The **Publish app** button stays greyed out until the Branding page is complete.

**Secrets:** `GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (the same ID, for One Tap in the browser) and `GOOGLE_CLIENT_SECRET`, in `.env.local` and Vercel. The client has two secrets. Google warns that the older one should be disabled and deleted once the app is confirmed to use the newer one. Which one `.env.local` and Vercel hold hasn't been checked.

## Resend
Resend sends the app's emails, such as invites and email-change links, on the free plan. Its one domain is `meal-planning.net`, which is verified. Local sends from `tester@` there, and production and previews from `noreply@`.

It has one API key, named `meal-planning-test`, with sending permission. Local, production and previews all use it, so revoking or rotating it changes all three at once.

**Secrets:** the key is `RESEND_API_KEY`, in `.env.local` and Vercel. Resend shows a key's value only when it's created.

## PostHog
PostHog's error tracking collects the app's errors, on the free plan. The account is on US Cloud and has one project, which the app reports to only from production. Previews send nothing, because the free plan's one project would group their errors with production's. PostHog sends no alert of its own when a new issue opens. What the app reports, and why the browser's reports go through the app's own `/relay` route, is in `docs/project_conventions.md`, "Error Reporting".

The project has a personal API key, scoped to this project with write access on error tracking only. Production's build uses it to upload source maps, so a reported stack trace points at the original source.

**Secrets:** the personal API key is `POSTHOG_API_KEY`, in the main checkout's `.env.local` and Vercel's Production, where it's marked Sensitive. The project token, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, and the project ID, `POSTHOG_PROJECT_ID`, are in the same places but aren't secret: the browser bundle carries the token, and the ID only identifies the project.

## Google Fonts
`next/font/google` in `src/app/layout.tsx` downloads the app's fonts from Google Fonts when the app builds. It needs no account or secret.

## Cloudflare
Cloudflare is the registrar for `meal-planning.net` and serves its DNS. The domain renews on 2027-03-02, with auto-renew on.

Its DNS records are all set to "DNS only", so Cloudflare proxies none of the traffic:
- **Vercel:** an `A` record on the bare domain to `216.198.79.1`, a `CNAME` on `www` to a `vercel-dns` target, and two `_vercel` `TXT` records that verify the bare and `www` domains.
- **Resend:** a `resend._domainkey` `TXT` record (DKIM), and an `MX` and an SPF `TXT` record on `send`, pointing at Amazon SES.

The domain has no `_dmarc` record.

## GitHub
The code repo, `SkaffenAmtiskaw/meal-planning`, is public, and its default branch is `develop`. Vercel's GitHub integration and its environments are under "Vercel". What CI and the routines need from the code repo is in `docs/ci.md`: what the default branch means for routines and scheduled workflows, the rulesets on `develop` and `main`, the pull request settings, the `notes-pending` label, the Claude GitHub App, the back-merge App and the Actions secrets.

The notes repo, `meal-planning-notes`, is private, with default branch `main`. It holds the Obsidian vault, and the Obsidian Git plugin commits and pushes it from your machine (see `docs/project_structure.md`, "Notes").

## claude.ai
Your Claude Max subscription runs Claude Code, both on your machine and in the routines' cloud sessions. The cloud environment and the routines are in `docs/ci.md`, "The Cloud Environment" and "Routines". The Claude desktop app's branch prefix, which names each worktree's branch, is in "The Desktop App's Branch Prefix" there.

# Who You Pay
- **Cloudflare:** the domain, renewing 2027-03-02 with auto-renew on.
- **Anthropic:** the Claude Max subscription.

Nothing else is known to be paid: Vercel is on its Hobby plan, Atlas on a Free cluster, and Resend and PostHog on their free plans.

# Setting Up a New Environment
A new environment, such as one for previews apart from production, needs its own database user, `DB_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and Resend key. It shares the Google OAuth client: you add the environment's URLs to the client, and it uses the same client ID and secret.

The steps go service by service, in the order they depend on each other, starting with the database. The dashboards' menus change, so each step links the service's own doc.

1. **Create its database user in Atlas.** Go to Database & Network Access → Database Users → **Add New Database User**. Choose Password, enter a username and use **Autogenerate Secure Password**. Under Specific Privileges, add `readWrite` on the new environment's database only, the same role production's `staging` user has. That keeps the environment away from every other environment's data. Then click **Add User** ([Atlas: Configure Database Users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/)). The database itself needs no setup, since MongoDB creates it on the app's first write.
2. **Let it reach the cluster.** If it's a Vercel deployment, skip this step: it already gets in through the `0.0.0.0/0` entry. If it runs on a new machine, add the machine's address: Database & Network Access → IP Access List → **Add IP Address**, with a comment that says whose it is ([Atlas: Configure IP Access List Entries](https://www.mongodb.com/docs/atlas/security/ip-access-list/)).
3. **Build its `DB_URL`** from the new user, its password and the new database's name. The cluster's host stays the one in the other environments' `DB_URL`, since the app has one cluster. The seed runs only against `test` and `test-<n>` (`seed/databaseNames.ts`), so any other environment's database starts empty.
4. **Generate its `BETTER_AUTH_SECRET` and set its `BETTER_AUTH_URL`.** Generate the secret with `openssl rand -base64 32`. better-auth asks for a high-entropy value of at least 32 characters, and this gives one ([better-auth: Installation](https://better-auth.com/docs/installation)). Set `BETTER_AUTH_URL` to the environment's own URL, which is where its email links point.
5. **Add its URLs to Google's OAuth client.** An origin can't hold a path, and needs `https` unless it's on `localhost`. It can't hold a wildcard either, so each entry has to be one exact origin. If the environment's origin changes with each deployment, as a preview's does, it can't be added. Otherwise, on the Google Auth Platform's Clients page, open `meal-planning-web-app`. Add the environment's origin under Authorized JavaScript origins, and its `/api/auth/callback/google` URL under Authorized redirect URIs. A change can take from 5 minutes to a few hours to apply ([Google Cloud: Manage OAuth Clients](https://support.google.com/cloud/answer/15549257)).
6. **Create its Resend API key** on Resend's API Keys page, with sending access, which can be limited to `meal-planning.net`. Copy the value then, because Resend never shows it again ([Resend: API Keys](https://resend.com/docs/dashboard/api-keys/introduction)). Choose a sender address at `meal-planning.net` for `RESEND_FROM_EMAIL`.
7. **Put the values where the environment reads them,** along with the Google client's ID and secret.
   - **If it's local:** put them in its `.env.local`.
   - **If it's deployed:** put them in Vercel's Settings → Environment Variables. If the new environment is Preview, first edit each existing variable so it applies to Production only, because today every one except PostHog's three is set for both. Then set each new variable for the new environment only, and redeploy ([Vercel: Managing Environment Variables](https://vercel.com/docs/environment-variables/managing-environment-variables)).
8. **Record it here.** Add the environment to "The Environments", and its users, keys and URLs to each service's entry.

# Which Doc Records a New Setting
When you set up something outside the repo, record it where it'll be found when it next needs changing. Which doc that is depends on what the setting is for:
- **If it exists only so a workflow or routine works,** such as an Actions secret: record it in `docs/ci.md`, beside that workflow or routine, and link it from its service's entry here.
- **If it serves both the app and a workflow or routine:** record it in the doc that covers the repo files it has to stay in step with. Then a change to those files and the update to its record land in the same commit.
- **Otherwise,** such as a setting the app or your machine depends on in any environment, an account or a bill: record it here, in its service's entry.

`docs/ci.md` gives the same rule at the opening of "Setup Outside the Repo", so a change to the rule goes in both docs.
