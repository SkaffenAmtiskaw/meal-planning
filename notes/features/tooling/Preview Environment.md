---
type: infra
status: idea
blocked-by: []
confirmed: 2026-11-04
---
# Where It Stands
Next: /infra-design ^status

# Inbox

# Purpose
Preview deployments use all of production's Vercel values: its database, Resend key, sender address, Google client and better-auth secret, plus its `BETTER_AUTH_URL`. So unmerged code runs against real data, and a preview's invite and email-change links open production. Found 2026-11-04 by [[Services and Environments Audit]].

Previews get their own values for all of these, and a preview's links stay on that preview. Previews stay usable: Sarah can sign in and click around on one.

# Goals

# Design
Found by `/shape` (2026-11-04), for `/infra-design`:
- `BETTER_AUTH_URL` builds the links in `src/_actions/sharing/inviteUser.ts` and `src/_actions/user/requestEmailChange.ts`. Preview URLs change per deployment, so one fixed Preview value may not be enough.
- Production's `DB_URL` signs in as the `staging` user, which can reach only the `staging` database, so a preview database needs its own user or a wider one.
- [[Branching and Releases]] widens the seed's guard (`seed/devDatabase.ts`) to `test` or `test-<anything>`, which matters if a preview database's name starts with `test`.
- Vercel Authentication already keeps strangers off preview URLs. The plan is Hobby.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Making Google sign-in work on previews. The OAuth client lists no preview URLs, so it can't work there today.
- Local's `atlasAdmin` user, production sharing a Free cluster with dev, and production's database being named `staging`: each has its own Roadmap line.
- Backups: [[Database Backup and Restore]].
- Resend's single key's name, and local and production sharing it: its own Roadmap line. A separate key for previews, if the design picks one, is part of this story.
