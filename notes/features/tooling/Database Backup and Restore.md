---
type: infra
status: idea
blocked-by:
  - "[[Services and Environments Audit]]"
  - "decision needed: how much data loss is acceptable, whether a release takes a backup, and the backup method"
confirmed: 2026-10-06
---
# Where It Stands

Next: /decide. Decision 3 waits on [[Services and Environments Audit]] ^status

Shaped 2026-10-06 as an infra story: a backup of production's database, a tested restore and a routine that re-tests it. Three decisions are open for /decide. Decision 3, the backup method, waits on the Audit confirming what production's database runs on. Then /infra-design writes the Goals, Design and Build Order.

# Inbox

# Purpose
Set up a known, tested way to back up and restore the production database. It's a Done When item of [[Dev Foundations]]. It's standard practice before shipping releases regularly, since a bad migration or deploy can't be undone without it.

A restore is run by hand when something goes wrong. "Tested" means a real restore into a scratch database, never over production, with a check that the data came back.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Goals
Questions for this section:
- Is one test restore enough, or should the restore be re-tested regularly?
  - **Decided 2026-10-06:** a routine re-tests the restore every few months. Sarah's call.

# Open Decisions
1. How much recent data can production afford to lose in a restore, and how far back should backups go? A daily snapshot loses everything since it was taken, while point-in-time restore loses almost nothing but costs more or takes more to build. The answer feeds decision 3. Found by `/shape` (2026-10-06).
2. Should a backup also be taken right before each release into `main`? If so, this story adds that step to the release process. If this story builds the step before [[Branching and Releases]] builds the release process, then once the step is built, this story adds an Inbox item to Branching and Releases saying its release process has to include the step. Found by `/shape` (2026-10-06).
3. Use Atlas's built-in backups, or build our own? Which Atlas backups are available depends on the cluster's tier, and [[Services and Environments Audit]] will find out what production actually uses. Right now Sarah isn't sure whether it's a different database from local. Found by `/shape` (2026-10-06).
   - Atlas's built-in backups (snapshots, and point-in-time restore on some tiers)
   - Our own scheduled `mongodump` job, with dumps stored somewhere off the cluster, restored with `mongorestore` (MongoDB Database Tools)

# Design

# Conventions

# Setup Outside the Repo

# Out of Scope
- Backing up dev or test data.
- Backing up the settings of other services, such as Vercel or Resend.
- Schema-migration tooling.
- An automatic rollback tied to deploys or releases.
