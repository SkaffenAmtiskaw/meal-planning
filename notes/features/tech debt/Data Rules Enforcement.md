---
type: pattern
status: spec
blocked-by:
  - "[[Calendar and Recipes Data Refresh]]"
  - "[[Settings Data Refresh]]"
  - "[[Server-Only Creation and Pure Reads]]"
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps. Building waits on the other three [[Stale Data Issues]] stories. ^status

# Purpose
Once every mutation follows the data refresh pattern, nothing yet stops a future story from drifting back. This story marks every read with `defineQuery`, adds the conventions meta-test and a lefthook command that always runs it, and documents the rules in the project conventions. It can only pass once every `'use server'` export is wrapped and every `router.refresh()` is gone, so it comes last.

Split from [[Stale Data Issues]] on 2026-09-25.

# Open Decisions
- `checkAuth` is listed below but isn't a `'use server'` file, and `defineMutation` uses it internally. Wrap it, or drop it from the list?

# Rules
The design lives in [[Stale Data Issues]]. The sections embedded below are part of this note.

![[Stale Data Issues#Confirmed Approach]]

# Enforcement
![[Stale Data Issues#Enforcement]]

# Migration Checklist
Already built: tag registry, `invalidate()`, `defineMutation` by [[Calendar and Recipes Data Refresh]]; `'self'` / `'public'` access by [[Settings Data Refresh]].

## A. Infrastructure
- [ ] `defineQuery` wrapper
- [ ] `src/dataConventions.test.ts`
- [ ] lefthook pre-commit command for the conventions test
- [ ] `.opencode/docs/project_conventions.md` — document Rules 1–3 and the tag model

## D. Read Actions → `defineQuery`
- [ ] `getPlanner`, `getPlannerClient`, `getPlanners`, `getSavedItem`
- [ ] `getUser`, `getUserInvites`, `getPendingInvites`, `getPlannerMembers`
- [ ] `checkAuth`, `checkEmailStatus`, `validateInviteToken`

`getPlanner`, `getPlannerClient` and `getSavedItem` leave `'use server'` in [[Unchecked Planner Reads]]. If that has landed, don't wrap them here.
`getUserInvites` leaves `'use server'` in [[Unchecked Invite Lookup]]. If that has landed, don't wrap it here.

# Draft Steps (from the split)
> [!warning] For the agent running /plan-steps
> This section is the draft plan saved when [[Stale Data Issues]] was split on 2026-09-25. It replaces `.opencode/scratch/Data Rules Enforcement - plan.md`; start from it as that skill's "draft saved by a split". It has not been through plan-checker. **Once the approved plan is written under Implementation, delete this whole section** (heading included).

Note: `notes/features/tech debt/Data Rules Enforcement.md` (type: pattern). Step numbers are the original draft's; renumber when planning. "Places A–H" refers to the Migration Checklist sections as they appeared in [[Stale Data Issues]] before the split; this note carries its share of them.


## Step 19: Reads are marked with defineQuery
**Idea:** Every read server action is built with `defineQuery`.

**Source:** Wrapper Shape (`defineQuery`); Places A: `defineMutation` / `defineQuery` wrappers; Places D

**Files:**
- `src/_actions/_utils/defineQuery.ts` (new)
- `getPlanner`, `getPlannerClient`, `getPlanners`, `getSavedItem`, `getUser`, `getUserInvites`, `getPendingInvites`, `getPlannerMembers`, `checkAuth`, `checkEmailStatus`, `validateInviteToken` + tests

**Acceptance (all "same as before"):**
- [ ] Calendar loads with meals (desktop month and week, phone list).
- [ ] Recipes list loads. The edit modal opens pre-filled.
- [ ] Settings: Planner Settings lists planners, members and invites. User Settings shows the right Security block for a password and a Google-only account.
- [ ] The navbar planner switcher lists all planners. The user menu invite indicator shows for a user with invites.
- [ ] Sign-in: entering an email goes to the right next step. An invite link shows the planner name.

## Step 20: Commits that break the data rules are blocked
**Idea:** Future stories are kept from breaking the data rules.

**Source:** Enforcement → conventions meta-test, Lefthook, not programmatically enforced (Rule 2 doc); Places A: `src/dataConventions.test.ts`, lefthook command, `project_conventions.md`

**Files:**
- `src/dataConventions.test.ts` (new) - static scan for the three checks
- `lefthook.yml` - always run the conventions test when any `src/**/*.{ts,tsx}` file is staged (authorized in the note, 2026-09-25)
- `.opencode/docs/project_conventions.md` - Rules 1–3 and the tag model; Rule 2 marked as not tool-enforced

**Acceptance:**
- [ ] Add `router.refresh()` to any component and try to commit. Pre-commit fails, naming the file. Revert.
- [ ] Add a plain `export const foo = async () => {}` to a `'use server'` file in `src/_actions` and try to commit. Pre-commit fails, naming the export. Revert.
- [ ] Import `revalidatePath` from `next/cache` in any action and try to commit. Pre-commit fails. Revert.
- [ ] Commit a change to one unrelated `.tsx` file. The conventions test runs and passes.
- [ ] `project_conventions.md` describes Rules 1–3 and the tag model, and says Rule 2 isn't checked by tooling.

**Open questions for /plan-steps** (also in Open Decisions):
- `checkAuth` in Places D (Step 19) - note's Open Decisions.

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
