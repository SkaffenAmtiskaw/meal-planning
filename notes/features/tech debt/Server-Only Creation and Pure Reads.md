---
type: cleanup
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps. ^status

# Purpose
`addPlanner` and `addUser` are exported as server actions, so the browser can call them (`addPlanner` has no auth check). Two reads also write: `getPlanners` sets default planner names and `validateInviteToken` deletes expired invites. This story moves the two creators into server-only utilities and makes both reads pure, because under the data refresh pattern only server actions can invalidate what they change.

Split from [[Stale Data Issues]] on 2026-09-25.

# Design
The design lives in [[Stale Data Issues]]. The sections embedded below are part of this note.

![[Stale Data Issues#Rule 1 — Mutations invalidate on the server]]

# Current State
*From [[Stale Data Issues]] (static reading, 2026-09-25). Re-check before planning.*

Not actually server actions. Move into server-only internal utils so they can't be called from the client:
- [ ] `planner/addPlanner` — currently exported as a server action **with no auth check**
- [ ] `user/addUser`

Writes outside server actions (`updateTag` only works inside Server Actions):
- [ ] `src/app/page.tsx` calls `addUser` during render (first sign-in) — keep as an internal util; no invalidation needed since it redirects
- [ ] `getPlanners` `$set`s default planner names on read — set the default at creation + one-off backfill, make the read pure
- [ ] `validateInviteToken` deletes expired invites on read — make the read pure; expire via a Mongo TTL index or in `acceptInvite`

# Open Decisions
- How does the one-off planner-name backfill run?
- Expired invites: a Mongo TTL index, or rejected and removed in `acceptInvite`?

# Out of Scope
- Converting `acceptInvite`, `createPlanner` and `signUpWithInvite` to `defineMutation` - [[Settings Data Refresh]].
- Wrapping `getPlanners` and `validateInviteToken` in `defineQuery` - [[Data Rules Enforcement]].

# Acceptance Criteria
- [ ] `addPlanner` and `addUser` are no longer exported from any `'use server'` file.
- [ ] `getPlanners` and `validateInviteToken` no longer write to the database.
- [ ] These flows are unchanged: first sign-in with a new account, signing up through an invite link, creating a planner in Settings, opening an expired invite link.

# Draft Steps (from the split)
> [!warning] For the agent running /plan-steps
> This section is the draft plan saved when [[Stale Data Issues]] was split on 2026-09-25. It replaces `.opencode/scratch/Server-Only Creation and Pure Reads - plan.md`; start from it as that skill's "draft saved by a split". It has not been through plan-checker. **Once the approved plan is written under Implementation, delete this whole section** (heading included).

Note: `notes/features/tech debt/Server-Only Creation and Pure Reads.md` (type: cleanup). Step numbers are the original draft's; renumber when planning. "Places A–H" refers to the Migration Checklist sections as they appeared in [[Stale Data Issues]] before the split; this note carries its share of them.


## Step 8: Planner and user creation become server-only utilities
**Idea:** `addPlanner` and `addUser` move out of `'use server'` files so the browser can't call them.

**Source:** Places C: `planner/addPlanner`, `user/addUser`; Places H: `src/app/page.tsx` calls `addUser` during render

**Approach:** Move both into `server-only` internal utils (e.g. `src/_actions/planner/_utils/addPlanner.ts`, `src/_actions/user/_utils/addUser.ts`) and take them out of the barrels. `src/app/page.tsx` keeps calling `addUser` during render. It redirects, so no invalidation is needed.

**Files:**
- `src/_actions/planner/addPlanner.ts` → `src/_actions/planner/_utils/addPlanner.ts` - `server-only`, not a server action
- `src/_actions/user/addUser.ts` → `src/_actions/user/_utils/addUser.ts` - same
- `src/_actions/planner/index.ts`, `src/_actions/user/index.ts` - stop exporting them
- `src/_actions/planner/createPlanner.ts`, `src/_actions/sharing/signUpWithInvite.ts`, `src/app/page.tsx` - new import paths
- moved tests

**Acceptance:**
- [ ] A brand-new Google account signs in for the first time and lands on the calendar of a new planner, same as before.
- [ ] Settings → create planner works, same as before.
- [ ] Signing up through an invite link lands in the invited planner, same as before.

## Step 9: Planners are named when they are created
**Idea:** New planners get their default name at creation, so listing planners no longer writes to the database.

**Source:** Places H: `getPlanners` `$set`s default planner names on read

**Approach:** `addUser` passes `"<name>'s Planner"` to `addPlanner`. `getPlanners` drops the `$set`. A one-off backfill names existing unnamed planners. *Open question: how the backfill runs.*

**Files:**
- `src/_actions/user/_utils/addUser.ts` - name the planner at creation
- `src/_actions/planner/getPlanners.ts` - pure read
- backfill (location depends on the open question)
- matching tests

**Acceptance:**
- [ ] A brand-new account signs in. Settings → Planner Settings shows "<Name>'s Planner".
- [ ] Unset one planner's `name` in the database (Compass). Visit Settings, then check the database: the name is still unset. The page no longer writes on read.
- [ ] Run the backfill. That planner now has "<owner name>'s Planner" in the database and in Settings.

## Step 17: Opening an invite link no longer deletes anything
**Idea:** `validateInviteToken` only reads, and expired invites are removed *(decision: by a Mongo TTL index, or in `acceptInvite`)*.

**Source:** Places H: `validateInviteToken` deletes expired invites on read

**Files:** `src/_actions/sharing/validateInviteToken.ts`; `src/_models/sharing/*` (TTL index) or `src/_actions/sharing/acceptInvite.ts`; matching tests.

**Acceptance:**
- [ ] Set an invite's `expiresAt` in the past (Compass). Open its link. The expired message shows. *(TTL: the invite is later removed by Mongo. acceptInvite: it's still in the database.)*
- [ ] Try to accept that invite from the invitee's Settings. It's rejected with an error.

**Open questions for /plan-steps** (also in Open Decisions):
- Backfill mechanism (Step 9) - note's Open Decisions.
- Expired invites: TTL index vs `acceptInvite` (Step 17) - note's Open Decisions.

# Implementation
%% The step plan, once approved - then set status to `ready`. Steps should be small enough to review one at a time. %%
