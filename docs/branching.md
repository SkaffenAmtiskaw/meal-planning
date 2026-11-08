# Branching and Releases
This guide is for you, working on the project through Claude Code sessions in the Claude desktop app. It says how branches, worktrees, PRs, releases and hotfixes work here, and what you do at each point. Agents read it too, for the flow around their work. What an agent does at each point is in its skill. It assumes you know what a git branch and a PR are, and that planned work lives as notes in the `meal-planning-notes` repo (see "Notes" in `docs/project_structure.md`).

The short version: planning runs in the main checkout, which always sits on the latest `develop`. Every change to the code is made in a worktree session on its own branch, and reaches `develop` through a PR whose checks passed. Once a goal is finished, a release merges `develop` into `main`, which deploys.

"How It Fits Together" explains the setup. The sections after it walk through each kind of work, and the last one covers what to do when something goes wrong.

# How It Fits Together
## Branches
There are four kinds of branch, each with its own job:
- **`develop`** is where finished work collects. It's the default branch on GitHub, and every story branch starts from it.
- **`main`** is production. Vercel deploys every merge into it. You merge each PR into it yourself, so every deploy is your click.
- **`feature/<generated name>`** holds one story, `/tooling` change or other piece of work, from start to finish. The desktop app names it when it makes the worktree.
- **`hotfix/<slug>`** holds an urgent fix, cut from `main` by hand, so the fix ships without anything else that's on `develop`.

GitHub's rulesets on `develop` and `main` refuse a direct push to either branch, and a PR can't merge while any of the four checks fails. The one exception is the back-merge, which brings a hotfix from `main` into `develop` (see "A Hotfix"). The rulesets' settings and reasons are in `docs/ci.md`, "The Rulesets on `develop` and `main`".

## Checkouts
The main checkout is the `meal-planning` folder itself. It stays on `develop` and is never edited, so the SessionStart hook can fast-forward it to the latest `develop` at every session start. Planning skills, such as `/shape`, `/plan-steps` and `/close`, run there and edit only notes. Notes live in their own repo and are never branched. Skills that change code stop if you run them there, and tell you to start a worktree session.

A worktree is a second folder checked out from the same repo, on its own branch. The desktop app makes each one in `.claude/worktrees/<name>`, inside the main checkout. It copies into it each gitignored file that `.worktreeinclude` lists, which is only `.env.local`. Each worktree gets a slot from 1 to 5, which gives it its own ports, hostname and database, so two worktrees can run the app side by side without touching each other's data or sign-in. The slot's URLs and database are in `docs/seed.md`, "Worktrees".

A worktree session loads its skills and hooks from the main checkout. So a change to a skill reaches worktree sessions once its PR merges into `develop` and the next session start fast-forwards the main checkout.

## What Each Session Start Does
At the start of every local session, the SessionStart hook runs four scripts, in order. Their messages appear in the session, and the agent passes on anything that needs you:
1. **`sync-develop.sh`** fetches from GitHub, and in the main checkout fast-forwards `develop`.
2. **`worktree-sweep.sh`** removes each worktree whose PR has merged, with its local branch and database (see "Cleaning Up After a Merge").
3. **`worktree-setup.sh`**, in a worktree, copies the main checkout's `.env.local` if the worktree has none, trusts its `mise.toml` and installs its dependencies, which also installs the pre-commit hook.
4. **`worktree-slot.sh`**, in a worktree, gives it a slot if it has none and prints its URLs and database.

# A Story
These are the points where you act, from planning to cleanup:
1. **Plan in the main checkout.** `/shape`, `/decide`, the design skills and `/plan-steps` all run there.
2. **Start the first build session in a new worktree.** In the Code tab, pick the `meal-planning` folder with the project folder control under the prompt box, turn on **Worktree**, and run `/implement <note>`, or `/infra-build <note>` for an infra story. The app makes the branch and folder, and the hook sets the worktree up and prints its slot.
3. **Review and commit each step.** Each skill first merges `develop` into the branch. That way the branch picks up other merged work, including any hotfix, while conflicts are still small. If the merge is clean, the skill commits it. If it conflicts, the skill stops and resolves it with you. Then it builds the step, and you review the changes and commit them.
4. **Start each later step in the same worktree.** When a step finishes, the session puts up a **New session** card for the next command, such as the next step or `/final-review`, already set to this worktree's folder. Click it. To start one by hand instead, see "Opening an Existing Worktree".
5. **Get the PR opened.** Tweaks and sweeps are kinds of story small enough to skip a review session. If the story is one of them, `/implement` opens the PR at its last step. Otherwise, run `/final-review` in the worktree. It reviews the branch's own changes. Once you've committed its fixes, it pushes the branch and opens a PR into `develop`, titled with the story's name, with auto-merge on. GitHub then squashes the PR into `develop` once its checks pass.
6. **Run `/close` in the main checkout once the PR has merged.** It checks on GitHub that the PR merged, then marks the story done and closes its note.
7. **Let the next session start clean up.** See "Cleaning Up After a Merge".

## Opening an Existing Worktree
A worktree outlives its sessions, so a later session can pick up where the last one stopped. To carry on in an earlier session of the worktree, open it in the sidebar. To start a new session in the worktree, ask any session to start one there, such as a session in the main checkout, and name the story rather than the folder:

> Start a session in the worktree for <story>, with no new worktree, that runs `/implement <note>`.

The session finds the worktree from its branch name, which the app often builds from the first session's command, and from the titles of the sessions already in it. If more than one worktree matches, it asks you which. The project folder control can't do this, because the app lists each worktree under the `meal-planning` project rather than as a folder of its own.

The new session opens in the worktree's folder, on its branch, and appears in the sidebar for you to open. Its hook output gives the worktree's slot and its hostname, so you can confirm it's in the right one.

Several sessions can use one worktree, but only one at a time should edit code or commit. They share one folder and one git index, so two at once would mix their changes and commits.

## Checking a Worktree's App in the Browser
The `running-the-app` skill opens the worktree's own URLs, on its own host and ports. In a worktree, you sign in only through the seed's sign-in links. Google sign-in and One Tap work only on `localhost:3000` and production, since those are the only origins Google's OAuth client accepts.

# Work Outside a Story: `/tooling` Changes, Quick Fixes and Other Work
Work outside a story also gets its own worktree session, branch and PR. Start it as you would a story's first session, with **Worktree** on. Once you've committed the change, the session pushes the branch and opens a PR into `develop` with auto-merge, and the next session start after the merge removes the worktree.

Some `/tooling` changes come with notes work that has to wait for the merge, such as a Roadmap edit. Notes aren't branched, so an edit made earlier would record the change as done before it reaches `develop`. The PR lists that work under "Held until the merge" and carries the `notes-pending` label. The session waits for the merge, then does the work and takes the label off. If the session ends first, see "Cleaning Up After a Merge".

A quick fix can also go through GitHub's web editor. Edit the file on `develop`, choose **Create a new branch for this commit and start a pull request**, and turn on auto-merge on the PR.

# A Hotfix
A hotfix is an ordinary bug story, built on a branch from `main` instead of `develop`. The steps, in order:
1. **Make the worktree by hand,** since the app only branches from `develop`. In a terminal in the main checkout, run:

   ```bash
   git fetch origin
   ```

   ```bash
   git worktree add -b hotfix/<slug> .claude/worktrees/hotfix-<slug> origin/main
   ```
2. **Start a session in it,** as "Opening an Existing Worktree" describes. Name its `hotfix/<slug>` branch, since it has no sessions yet to match by title, and have the session run `/investigate <note>`. The hook copies `.env.local` into it, installs its dependencies and gives it a slot.
3. **Run the bug through its skills there:** `/investigate`, `/plan-steps`, `/implement` and `/final-review`. On a `hotfix/` branch, each skill merges in `main` rather than `develop`. The release freeze doesn't hold up a hotfix, since it covers only `develop`.
4. **Merge the PR yourself.** `/final-review` opens it into `main` without auto-merge. Once its checks pass, merge it with a merge commit, which deploys. A production fix PR that a routine opens into `main` takes the same path from here.
5. **Let the back-merge bring it into `develop`.** When `main` has commits that `develop` lacks, `back-merge.yml` merges `main` into `develop` and pushes. That keeps the next release from undoing the fix. Any story branch still open picks it up at its next session's merge of `develop`.
6. **Run `/close`** in the main checkout.

# A Release
A release ships one finished goal. While it's under way, the release freeze lets only the release's own audits and fixes change `develop`, so nothing unaudited ships. The points in a release, in order, and what you do at each:
1. **The goal's last story closes,** and its line on the Roadmap shows `Next: /finish-goal`.
2. **Run `/finish-goal <goal>` in the main checkout.** You confirm which audits apply and each one's scope. It writes a story for each audit, marks the goal ` · releasing`, which starts the freeze, and puts up a **New session** card for each audit.
3. **Start each audit's card.** `/audit-release` runs the audit and goes through its findings with you, and each finding you keep becomes a fix story. Run the two in-app audits (UX and accessibility) one after another, since they share the main checkout's server and database. Each fix goes through the story steps above.
4. **Once the audits and fixes have closed,** the goal's line shows `Next: /ship-goal`.
5. **Run `/ship-goal <goal>` in the main checkout.** It checks that nothing is left undone, goes through the goal's Done When with you, closes out the goal note and opens the PR from `develop` into `main`, named after the goal, without auto-merge.
6. **Merge the PR,** which deploys and ends the freeze. Then run `/roadmap` in a new session, which makes the next goal the building goal.

# Cleaning Up After a Merge
At the next session start, the sweep removes each worktree whose PR has merged, with its local branch and its database, and prints a line for each. GitHub has already deleted the branch on GitHub at the merge.

The sweep leaves a merged worktree in place in three cases. For the last two, it prints a line saying which:
- **It's the worktree the session runs in.** The next session that starts in a different folder removes it.
- **It has uncommitted changes.** Commit them on a new branch for a new PR, or throw them away. Once the folder is clean, the next session start removes it.
- **Its PR carries `notes-pending`,** so its held notes work isn't done. The sweep finds merged PRs only through the worktrees still on disk, so keeping the worktree is what keeps the PR named at each session start until the work is done. The session offers you a new session in the main checkout that runs `/tooling #<PR>`. That session does the work the PR lists and takes the label off, and the next session start removes the worktree.

You archive the story's sessions in the sidebar when you like.

# When Something Goes Wrong
Each entry is a failure you might meet, grouped by when it comes up, with what happens and what you do.

## Starting a Session
**A worktree's install fails,** such as when a merge leaves the lockfile out of date. The hook prints the error into the session. Until it's fixed, the worktree has no dependencies, and commits skip the pre-commit checks. Once the lockfile is right, have the session run `pnpm install`.

**All five slots are taken.** The hook says so, and the new worktree has no ports or database, so it can't run the app. The sweep has already removed every merged worktree it could. A slot frees up once another worktree's PR merges and the sweep removes it.

**A story's worktree is missing or broken,** such as when its folder was deleted. Ask a session to rebuild it on the story's branch. It first checks the old worktree for uncommitted changes and tells you of any, since removing it loses them. Then it removes the old worktree, or clears git's record of one whose folder is gone, makes a new one on the same branch with `git worktree add .claude/worktrees/<name> <branch>`, and starts a session there. The branch, its commits and its PR carry over, since only the folder is new.

**A skill stops because a release is under way.** Only the release's audits, their fixes and any gaps `/ship-goal` found may be built until the release PR merges into `main`. The work waits for the next goal. A hotfix isn't held up, since the freeze covers only `develop`.

**A session's merge of `develop` (or `main`, on a hotfix) conflicts.** The skill stops before its step and resolves the conflict with you. Once you approve the resolution, it commits the merge and carries on.

## Building
**A worktree's port is taken by something else.** `pnpm dev` fails rather than move to another port, since the worktree's URLs and sign-in links are tied to its slot's ports. `running-the-app` tells you what's on the port. Stop that process, or find the worktree it belongs to.

**A push to `develop` or `main` is refused.** Both branches take changes only through a PR, from your account and from a routine alike. Push the work to its own branch and open a PR instead.

## The PR
**A check fails on a story's or `/tooling` change's PR.** Auto-merge waits. The `ci-failure` routine starts a session, which you'll find under **Routines** in the sidebar. That session looks into the failure and opens a fix PR into the story's branch. Merge that fix PR once its checks pass. The story's PR then runs its checks again, and auto-merge goes ahead once they pass.

**A PR says it's out of date with `develop`.** Another PR merged since its checks ran, and the `develop` ruleset holds every PR to the latest `develop`. Click **Update branch** on the PR, or ask a session to run `gh pr update-branch <number>`. The checks run again, and auto-merge goes ahead once they pass.

## After the Merge
**`/close` says the PR hasn't merged.** Wait for the PR to merge, then run `/close` again. A failed check or an out-of-date branch can hold the merge up (see "The PR").

**A merged worktree has uncommitted changes.** The sweep leaves it in place and says so. What to do is in "Cleaning Up After a Merge".

**A session ends before its held notes work is done.** The `notes-pending` label stays on the merged PR, and the next session start offers you a session that does the work. "Cleaning Up After a Merge" says more.

## Hotfixes and Releases
**The back-merge fails with a conflict.** It pushes nothing, so the hotfix isn't on `develop` yet. Until it is, `/finish-goal` and `/ship-goal` won't start. Bring it back by hand in a worktree session, as `docs/ci.md`, "Back-Merge", describes.

**`/roadmap` won't start the next goal.** A PR from `develop` into `main` is still open, so the release hasn't shipped. Merge it, then run `/roadmap` again.
