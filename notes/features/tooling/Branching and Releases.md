---
type: infra
status: spec
blocked-by: ["[[Notes Vault Repo]]"]
confirmed: 2026-10-05
---
# Where It Stands

Design approved. Blocked by [[Notes Vault Repo]]; then /plan-steps ^status

Shaped as one infra story covering parallel story branches in worktrees, protection for `develop` and `main`, hotfixes and a release process. /infra-design wrote the Goals, Design, Conventions and Setup Outside the Repo on 2026-10-05, settling 22 more decisions along the way (8-29). Nothing is planned or built yet. /plan-steps runs once [[Notes Vault Repo]] is built, since the Design names the paths it leaves.

# Inbox
- A second route into `main`, for the design: [[Vercel Deploy Errors]] decision 2 (2026-10-05) has its routine open a `claude/` fix PR into `main` when a production deploy fails with a code cause, which Sarah merges and back-merge carries into `develop`. That changes decision 29 ("a hotfix is an ordinary bug story") for this case. The Flow ("A hotfix" or "When something fails") and `docs/branching.md`'s "When something goes wrong" (Piece 32) describe only releases and hotfixes reaching `main`, so they'd need this route. The rulesets don't change, since a PR from `claude/` into `main` already fits them. Found by /infra-design on Vercel Deploy Errors.

# Purpose
Let Sarah work on two product features at once with agents, protect `develop`, and give a finished goal a way to ship as a release.

[Sarah] - I have sadly reached the point I probably need feature branches. I'm pretty consistently working two different features at a time. That's not a big deal when one feature is something that can go to `main` half-baked, like `e2e` tests. But it means I can't have two different product features being worked at once. That being said, I haven't got a goddamn clue how to handle feature branches with an agent. I'm vaguely familiar with worktrees, but the one time I tried it it didn't seem to work great. If that's the solution, I need a crash course in using them with agents. If that's not the solution I need to know what is. And regardless of what the solution is it needs documented. Edit: Sep 30 - We would also need to protect `develop` in CI should we make this change. Assuming the CI Checks story is done of course.

# Goals
- [ ] Sarah can work on two stories at once, such as two product features, each in its own worktree session on its own branch, without either one blocking the other.
- [ ] A guide tells Sarah what to do at each step of working on a story in a worktree, from starting it to cleaning up after its PR merges, and what to do when something goes wrong.
- [ ] A direct push to `develop` is rejected, from Sarah's account and so from a routine too.
- [ ] A PR into `develop` can't be merged while any of the four checks (`lint`, `type-check`, `unit-tests`, `build`) is failing.
- [ ] A story's code reaches `develop` in one PR from its own branch, opened only once all its steps are built and reviewed.
- [ ] A story is marked done, in its note and on the Roadmap, only after its PR merges into `develop`.
- [ ] A `/tooling` change works on its own branch and reaches `develop` through its own PR.
- [ ] `/final-review` proposes the story's code range from its branch, in place of the interim date-based start that [[Notes Vault Repo]] gives it.
- [ ] Before anything ships, a release checks the finished goal: that nothing in it is left undone, a code review across all of its stories, and, where it applies, whether its new features are covered by E2E tests and `docs/`.
- [ ] A release ends with a PR from `develop` into `main` named after the goal, opened only once the checks have passed, the goal note is closed and the Roadmap is cleaned up.
- [ ] A goal whose last story closes has a next step: `/close` no longer marks it "waiting on a release process", and Note Conventions' row for it names that step.
- [ ] An urgent fix reaches `main` without shipping anything else that's on `develop`.
- [ ] Once an urgent fix is on `main`, it also reaches `develop` and the open story branches, so the next release doesn't undo it.

# Open Decisions
1. How does Sarah work on two features at once with agents: worktrees (possibly the Claude desktop app's built-in worktree sessions), separate clones or something else? She tried worktrees once, and it didn't seem to work great.
   - **Decided 2026-10-02:** worktrees, made by the Claude desktop app's worktree sessions. Sarah's call after research: it's Claude Code's documented way to run parallel sessions, it shares memory, approvals and commits with the main checkout, and a later session can open an existing worktree's folder (Sarah checked in the app).
     - Rejected: worktrees made by hand with `git worktree add` - setup and cleanup are manual; kept only as the fallback for checking out an existing branch.
     - Rejected: separate clones - no shared memory, commits move only through a push and fetch, and two `develop` checkouts can drift apart.
     - Rejected: one checkout with feature flags - two agents in one folder share a git index and the pre-commit build, so it doesn't meet the goal.
2. How do `notes/` and the Roadmap work when each branch has its own copy? `/decide` should lay out options and think through how each would work day to day.
   - **Decided 2026-10-04:** the notes vault moves to its own git repo, in a folder beside the code repo (outside its checkouts). Obsidian points at it, every session reaches it through Claude Code's `additionalDirectories` setting, and notes are never branched. Sarah's call after research: one copy of every note keeps Obsidian and the Roadmap current while story branches are open, and it works with worktree isolation, which blocks a worktree session from editing the main checkout.
     - Rejected: notes only on `develop` in the main checkout - `/implement` in a worktree can't write them, so every note update needs a second session or a way around isolation, and notes-only commits pile onto `develop`.
     - Rejected: notes travel with the story branch - Obsidian shows in-progress stories as they were before they started, and `Roadmap.md` conflicts at most merges.
     - Rejected: notes as a git submodule - each worktree checks out its own copy, so notes are branched again.
     - Rejected: notes synced outside git (iCloud, Obsidian Sync) - loses the history `/check-drift`, `vault-lint.sh` and `/final-review` rely on.
3. Once `develop` is protected, does all work reach it through a PR, or can some changes, such as notes-only commits, still be pushed directly?
   - **Decided 2026-10-04:** all work reaches `develop` through a PR. Sarah's call: decision 2 moves the notes out of the code repo, so the notes-only exception she had wondered about no longer comes up.
4. What is a release, and how does it work when `develop` holds stories from more than one goal? Sarah decided 2026-09-28 that a goal wrapping up is a release. But if stories merge into `develop` one at a time, merging `develop` into `main` when one goal wraps up can ship another goal's unfinished stories. Sarah is torn on this, and the answer may change the 2026-09-28 decision. Pieces a release might include, raised while designing goals (none decided):
   - a review across all of the goal's stories: leftovers between stories, duplicated logic, patterns that drifted between stories
   - checking each of the goal's Done When items in the running app
   - checking that `docs/` covers what the goal added
   - merging `develop` into `main`, deploying, and possibly release notes or a version tag
   - closing the goal note, and handling any Roadmap lines still under it
   - **Partly answered 2026-10-02:** Settled: with one goal built at a time (decision 6), `develop` holds only the goal in progress plus work outside any goal, and a release is `develop` merged into `main` once the goal is finished, which keeps the 2026-09-28 decision. An urgent fix reaches `main` on a hotfix branch; a semi-urgent one goes into `develop` and ships with the next release. Still open: which of the pieces listed above a release includes. Waits on: nothing.
   - **Decided 2026-10-04:** a release runs in this order. First, checks of the finished goal: that nothing in it is left undone, a code review across all of its stories (leftovers, duplicated logic, patterns that drifted between stories) and, where it applies, an audit of whether the new features are covered by E2E tests and `docs/`. Once those pass, the goal note is closed and the Roadmap cleaned up. Only then is the PR from `develop` into `main` opened; merging it starts Vercel's deployment, so no agent deploys. Sarah's call.
5. Does a release get a version and release notes? Sarah isn't sure what versioning gains an app with one maintainer, but isn't opposed if there's a reason. If yes, are they written by hand or with a tool? Candidates: release-please, Changesets, semantic-release.
   - **Decided 2026-10-04:** no versions or release notes for now; they're for a future story, if Sarah adds an in-app "what's changed" notification. Sarah's call, checked against the code and notes: until then version numbers add nothing, nothing in the code or planned work needs one, and adding them later is cheap.
6. Is a branch one story or one goal? Sarah wants to finish a goal and release it to `main` all at once, which may mean each goal's stories collect on their own branch, apart from other ongoing goals. The answer sets how long a worktree lives, what a branch is named, and how work reaches `develop` (decisions 3 and 4).
   - **Decided 2026-10-02:** a branch is one story. Only one goal is built at a time: the next goal's stories can be shaped, decided and designed, but not implemented until the goal before it is done. A story's branch merges into `develop` once the whole story is done, so `develop` only gets full pieces of work, and when the goal is finished, `develop` is released to `main`. Sarah's call after two checks: `develop` never holds another goal's unfinished work, so a finished goal releases all at once; which goal goes first and how big it is are her prioritization calls.
     - Rejected: a branch per goal - each branch would live for a whole goal, and tooling, two-goal stories and urgent fixes would have no branch.
7. Does moving the notes vault to its own repo (decision 2) happen inside this story, or as its own story that this one waits on? The move changes about 114 `notes/` references across 29 files (skills, agents, scripts, AGENTS.md, `docs/project_structure.md`) and the routines' repo access.
   - **Decided 2026-10-04:** its own story, which this story waits on. Sarah's call, checked against the code and notes: the move rewrites about 30 files (mostly skills, agents and scripts, plus AGENTS.md and `docs/project_structure.md`) and needs setup outside the repo, too big for this story or one `/tooling` session.
8. Which skill opens a story's PR into `develop`, and when? Found by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** `/final-review` opens it as its last step, once Sarah has committed the review's fixes, titled with the story's name. Sarah's call after research: an open PR always means reviewed and ready, and the PR is only the integration gate (GitHub flow), since the step reviews and `/final-review` are the human review.
     - Rejected: the last `/implement` session opens a draft PR and `/final-review` marks it ready - two skills manage one PR, and a failed check on the draft starts `ci-failure` before the review.
     - Rejected: a new skill between `/final-review` and `/close` - a whole session for a few `gh` commands, and one more step on every story.
9. Who merges a story's PR into `develop`? Found by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** GitHub auto-merge, which `/final-review` turns on when it opens the PR, so GitHub merges once the required checks pass. Sarah's call after research: required checks plus auto-merge is GitHub's documented "merge when green", CI is the only gate left once the review is done, and `develop` doesn't deploy. Needs the repo's "Allow auto-merge" setting.
     - Rejected: Sarah merges on GitHub - a manual step on every story that adds no review.
     - Rejected: a skill waits on the checks with `gh` and merges - the session sits idle through CI, and on a failure it and `ci-failure` both act.
10. How do story PRs merge into `develop`? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** squash for story and `/tooling` PRs; releases into `main` stay merge commits. A hotfix coming back from `main` merges with a merge commit, so the `develop` ruleset allows both methods. Sarah's call after research: each story lands as one commit dated when it lands, so `/plan-steps`' and `code-drift-checker`'s `git log --since=<confirmed>` keep working, and branch-side merges of `develop` stay off it (trunk-based development). Step commits stay readable in the PR, and `leftovers-checker` reads them on the branch before the merge.
      - Rejected: merge commits for story PRs - step commits keep their branch dates and slip past the date-based drift checks, and every merge of `develop` into the branch lands on `develop`.
11. Who merges `develop` into an open story branch, and when? (The Design's "early and often" decision left this open.)
    - **Decided 2026-10-05:** the first step of every `/implement` and `/final-review` session merges `develop` into the story branch (a merge, not a rebase), with the desktop app's sync-with-base-branch tool where the session has it and `git merge` otherwise. A clean merge is committed by the skill itself, as a stated exception to "Don't commit unless Sarah asks"; a conflict stops the skill to resolve it with Sarah, and uncommitted changes stop it. Sarah's call after research: integrating at every step keeps merges small (Fowler, "Integration Frequency"), and a merge leaves reviewed step commits untouched.
      - Rejected: Sarah merges by hand - "early and often" would rest on memory.
      - Rejected: a SessionStart hook - it can't ask about a conflict, and it runs on sessions that aren't building.
12. Which skill marks a story done, now that it happens after its PR merges? Found by /infra-design (2026-10-05), from the Inbox item on [[Notes Vault Repo]] decision 4.
    - **Decided 2026-10-05:** `/close`. `/final-review` leaves the story `in-review`, with a status line saying its PR merges when the checks pass and `/close` comes next. `/close` checks the PR on GitHub: if it has merged, it sets `done` and does a done close; if not, it stops and says so. Sarah's call after research: the merge happens outside any session, so the first skill after it checks it, against the PR's merged state on GitHub.
      - Rejected: the skill that merges sets `done` - no skill merges, since auto-merge does (decision 9).
      - Rejected: `/final-review` keeps setting `done` - it would come before the merge.
13. Where do code-repo changes made outside a story go, and where do sessions that change no code run? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** the main checkout stays on `develop` and is never edited. Planning skills run there and edit only notes. Every code-repo change (`/tooling`, note-less work, quick fixes) starts a worktree session with its own branch and PR, or for a quick fix, GitHub's web editor. `/close` and `/check-drift` lose their `docs` permission. A doc gap found in a planning session is drafted and approved on the spot, then written either in a new worktree session right away or as a Docs Updates item carrying the approved draft. Sarah's call after research, accepting the change to AGENTS.md's "Doc gaps" rule: a branch belongs to a change, not a session (GitHub flow), and a clean main checkout tracking `develop` is the usual worktree layout.
      - Rejected: every session starts in a worktree - a worktree and throwaway branch for every planning session, and a PR and CI run for each doc fix.
14. What keeps the main checkout's `develop`, and `origin/develop`, current after PRs merge on GitHub? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** a SessionStart hook in the tracked `.claude/settings.json`. In every local session it runs `git fetch origin`; in the main checkout, on `develop` with no uncommitted changes, it also fast-forwards `develop`. It's quiet, never blocks the session on failure, and skips cloud sessions. Sarah's call after research: required setup should run every time rather than rest on memory, and the app reuses a fetch less than 24 hours old as a new worktree's base.
      - Rejected: `/close` pulls `develop` - misses `/tooling` and quick-fix merges, and the worktree base.
      - Rejected: Sarah pulls by hand.
15. Who applies `/tooling`'s held Roadmap edits once its PR merges? [[Notes Vault Repo]]'s convention holds them until then. Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** only when it has held edits, `/tooling` waits for its own PR: it watches the checks, and once GitHub shows the PR merged, it applies the edits and runs `vault-lint.sh`. If a check fails, it stops, and its report lists the edits still to apply once the fix merges. Sarah's call after research: the wait only happens on the rare change that needs it, and a step that always runs beats one that rests on memory.
      - Rejected: Sarah comes back to the session once the PR merges - forgetting leaves the Roadmap out of step with the skills.
      - Rejected: an item in a collecting note for a later `/tooling` - the edits can wait a long time.
16. What are story branches named? (The Design's branch-name question; Sarah's 2026-10-02 leaning was `feature/<name>`.)
    - **Decided 2026-10-05:** the desktop app's generated names, with its branch prefix setting changed from `claude/` to `feature/`, for every branch cut from `develop` (stories, `/tooling` changes and note-less work). Hotfix branches, made by hand from `main`, are `hotfix/<slug>`. The PR title names the story. Sarah's call after the leaning was checked: the app makes each name from its one prefix plus a generated tail, and renaming a branch risks the app no longer tracking its PR or auto-archive. `feature/` and `hotfix/` follow git-flow, where every branch off the development branch is a feature branch.
      - Rejected: a skill renames the branch to `<type>/<story-slug>` (or `feature/<story-slug>`) before its first push - the app isn't guaranteed to keep tracking a renamed branch.
      - Rejected: a script makes each worktree already named and the app opens its folder - it changes decision 1, and cleanup moves off the app.
17. Where do worktrees live? (The Design's worktree-setup question.)
    - **Decided 2026-10-05:** in the app's default location, `.claude/worktrees/` inside the repo, which `.gitignore` gains in place of its leftover `.worktrees/` line. `vitest.config.ts` excludes `.claude/**`, and `next.config.mjs` sets Next's root to the project's own folder, so neither tool reaches into a nested worktree or out to the main checkout. Sarah's call: both config changes make sense on their own, not only for worktrees, and this decision is her instruction to make them.
      - Rejected: worktrees outside the repo through the app's "Worktree location" setting - Sarah prefers fixing the two tools' file searches.
18. How does a new worktree get what it needs? (The Design's worktree-setup question.)
    - **Decided 2026-10-05:** a one-line `.worktreeinclude` makes the app copy `.env.local` into each new worktree, and the SessionStart hook (decision 14), in a worktree, runs `mise trust` on its `mise.toml` and then `pnpm install --frozen-lockfile`. Sarah's call after research: without `node_modules`, lefthook's shim exits 0 and a commit silently skips every check, so the install runs every time rather than resting on an instruction. Sarah's mise is 2026.5.15, older than 2026.7.5, which shares the main checkout's trust with worktrees, and the hook's `mise trust` works with any version.
      - Rejected: an instruction in AGENTS.md to install first - forgetting costs a commit with no checks, and it misses Sarah's own commits.
      - Rejected: upgrading mise and relying on its shared trust - a version requirement nothing in the repo records or checks.
19. How is a story's worktree removed once its PR merges? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** `/close`, once it has confirmed the PR merged, removes the story's worktree and local branch with git from the main checkout, and stops to ask Sarah first if the worktree has uncommitted changes. Sarah archives the story's sessions in the app when she likes, and GitHub's "Automatically delete head branches" setting removes the branch on GitHub at merge. Sarah's call after research: the docs don't say what archiving does when several sessions share one worktree, and agents handle branch cleanup.
      - Rejected: the app's archive and auto-archive - relies on undocumented behavior for a worktree several sessions share.
20. How do two worktrees run the app side by side? (The Design's side-by-side question.)
    - **Decided 2026-10-05:** each worktree gets its own dev and sign-in ports, its own hostname (`<slug>.localhost`) and its own database. The main checkout keeps ports 3000 and 3001, `localhost` and `test` with Sarah's own data, and E2E picks a free port per run. Whatever assigns them writes the worktree's `.env.local` values and `launch.json`, and the database is dropped when `/close` removes the worktree. `pnpm dev` runs on a fixed port so it fails instead of moving, and `running-the-app` checks that a server belongs to its own worktree. No `src/` change. Sarah's call after research: the standard guidance for parallel agents in worktrees gives each its own ports and database, and a separate host is the only cookie isolation that needs no app change (RFC 6265 §8.5).
      - Rejected: one worktree runs the app at a time - fails Goal 1 whenever both stories need the browser.
      - Rejected: own ports and hostname with a shared `test` - one worktree's `pnpm seed` resets the other's users and planners mid-check.
      - Rejected: automatic preview ports with a per-worktree cookie prefix - changes auth config that ships, where a wrong value signs every user out.
21. Where do the worktree databases live? Found by /infra-design (2026-10-05), from decision 20.
    - **Decided 2026-10-05:** on the Atlas cluster, as `test-<slug>` beside `test`. The seed's guard (`seed/devDatabase.ts`) widens from exactly `test` to `test` or `test-<anything>`, and `/close` drops the worktree's database. Sarah's call after research: far fewer moving parts than a local database per worktree, and the guard keeps its job with one more pattern, provided production's database name doesn't start with `test`. Production's name isn't confirmed yet: Sarah decided that `/implement` asks her for it (Vercel → Settings → Environment Variables → `DB_URL`, Production) before the step that widens the guard.
      - Rejected: a local MongoDB per worktree - a database process to start and stop for each worktree, and a version that may differ from Atlas's.
22. Does the ruleset on `develop` require a PR to be up to date with `develop` before it merges? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** yes, strict. The `develop` ruleset is its own ruleset, apart from `main`'s, and also requires a pull request with 0 approvals, requires the four checks, allows squash and merge commits, blocks force pushes, restricts deletion, and has a bypass list holding only the back-merge App (decision 25). Sarah's call after research: every PR is tested against the latest `develop` before it merges, so two PRs that each pass alone can't break the branch every worktree and routine starts from (GitHub's strict status checks). She accepted the cost: after a merge into `develop`, each other open PR needs **Update branch** (or `gh pr update-branch`) and one more check run before auto-merge goes ahead.
      - Rejected: loose, as on `main` - `develop` can go red from two PRs that each passed alone.
23. Does the ruleset on `main` also require a pull request? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** yes, with 0 approvals and merge commits as the only allowed method. Sarah's call after research: today a commit whose checks passed elsewhere can be pushed straight to `main`, and once a hotfix comes back into `develop`, a story or `claude/` branch could be pushed there and deployed. Nothing reaches production except through a PR (least privilege), it costs nothing since releases and hotfixes are PRs already, and merge commits keep the record of what shipped (decision 5). No ruleset setting stops a routine from merging a PR as Sarah; `routine-sessions`' "never merges" instruction is the only guard.
      - Rejected: leaving `main` as it is - a passed branch could be pushed straight to production.
24. How does a hotfix get back into `develop` once it's on `main`? From Sarah's Inbox question on a hotfix process and decision 4's Partly answered line.
    - **Decided 2026-10-05:** a GitHub workflow, on every push to `main` that brings commits `develop` doesn't have (so not a release merge), merges `main` into `develop` and pushes the merge straight to `develop`, with no PR (decision 25 says how it's allowed to). The hotfix itself is cut from `main` by hand as `hotfix/<slug>` in a hand-made worktree (the app only branches from `develop`), and reaches `main` through a PR with a merge commit. Open story branches pick the fix up through decision 11's merge at the start of each session. Sarah's call after research: she doesn't want to have to remember the way back, which is also her Dev Tooling Tidy-Ups item ("automatic recursive merges from `main` to `develop`").
      - Rejected: a second PR of the hotfix branch into `develop` (git-flow) - it's a step to remember.
      - Rejected: cherry-picking from `develop` onto `main` - the urgent fix waits on `develop`, is tested on the wrong base, and the change exists twice.
25. How is the back-merge workflow allowed to push to `develop`? Found by /infra-design (2026-10-05), from decision 24.
    - **Decided 2026-10-05:** a small GitHub App of Sarah's own, with write access to this repo's contents, is the only entry on `develop`'s bypass list, and the workflow mints its token for each run to push the merge. Sarah's call after research: routines push as Sarah's account, so an exception tied to her account would let them through (Goal 3), and the workflow's built-in token can't be a bypass actor, so an App is the only actor that can be excepted alone. It's set up once, and nothing expires. The merge result doesn't run the checks; both sides already passed theirs.
      - Rejected: the App opens a back-merge PR instead - Sarah prefers the direct push.
      - Rejected: the built-in token with an "Approve workflows to run" click on each back-merge PR - a step to remember.
      - Rejected: a fine-grained personal access token - it expires, and renewing it is a step to remember.
26. How is a release run? (The Design's release question.)
    - **Decided 2026-10-05:** a release skill runs the whole release in one session and stops at the open PR from `develop` into `main`, named after the goal, which Sarah merges. It checks that nothing in the goal is left undone, runs a code review across all of the goal's stories (`leftovers-checker` in a goal mode, over `develop` since the last release) and an E2E and `docs/` coverage audit, goes through the findings with Sarah, then closes out the goal note and the Roadmap before opening the PR. A fix goes on its own branch with a PR into `develop`, and the release waits for it to merge. The goal's Roadmap line shows the skill as its next step in place of "waiting on a release process". Sarah's call after research: the repeatable parts are agent checks, which only a skill can run, and building the release into tooling makes every release run the same way (Google SRE book, Release Engineering). Sarah named it `/ship-goal`: `/release` would share its prefix with the built-in `/release-notes`, and names starting `/goal` clash with the built-in `/goal`.
      - Rejected: a checklist in a doc - order and completeness rest on memory, and a doc can't run the checks.
      - Rejected: a workflow that opens the PR, plus a skill - a file and permissions for one `gh pr create`.
      - Rejected: spreading it across `/final-review` and `/close` - neither fits, and a goal note has no status to carry the order.
27. When does the next goal start building: before or after the release PR merges? Found by /infra-design (2026-10-05), from decision 26.
    - **Decided 2026-10-05:** after. The release skill closes the goal note and removes its Goals line, but leaves promoting the planning goal to `/roadmap`, and ends by telling Sarah to merge the PR, then run `/roadmap`. `/roadmap` checks GitHub for an open PR into `main` and won't promote while there is one. Until then `/implement` won't build the next goal's stories, since they don't serve the building goal. Sarah's call after research: it keeps next-goal work out of the release (decision 6) with one check and no new branch type.
      - Rejected: a `release/<goal>` branch cut from `develop` for the PR (git-flow) - another branch type, for a head start that's rarely needed.
28. Does a release's "nothing in it is left undone" include checking each Done When item in the running app? Found by /infra-design (2026-10-05), from decision 4.
    - **Decided 2026-10-05:** no. The release skill checks mechanically that no Roadmap line or collecting-note item for the goal is still open, then goes through the goal's Done When with Sarah one item at a time, showing what covered each. She says whether it's met, and an item nothing covers goes to `/roadmap <goal>` as a gap and stops the release. Sarah's call after research: each story's acceptance checks already ran in the app, and the release's job is the cross-story view.
      - Rejected: an in-app check per Done When item - repeats the stories' checks, and most of a goal like Dev Foundations isn't app behavior.
29. Who merges a hotfix's PR into `main`? Found by /infra-design (2026-10-05).
    - **Decided 2026-10-05:** Sarah, as with a release PR. A hotfix is an ordinary bug story on a `hotfix/<slug>` branch cut from `main`: the skills merge `main` into it rather than `develop`, and `/final-review` opens its PR into `main` without auto-merge. Sarah's call after research: every deploy stays her click (decision 4).
      - Rejected: auto-merge, as for a story PR - a deploy would happen with nobody choosing it.
30. When is `develop` merged into an open story branch? Moved from the Design's questions by /infra-design (2026-10-05); decision 11 settles who does it and when.
    - **Decided 2026-10-04:** early and often. Sarah's call: story branches stay up to date, and conflicts are caught while they're small.
31. `/tooling` commits straight to `develop` today. With all work reaching `develop` through a PR (decision 3), how do its changes get there? Moved from the Design's questions by /infra-design (2026-10-05).
    - **Decided 2026-10-04:** the same way as a feature story: `/tooling` works on its own branch and reaches `develop` through a PR. Sarah's call.

# Design
Built after [[Notes Vault Repo]], so paths below are the ones it leaves: notes in the notes repo, Note Conventions at `.claude/rules/note-conventions.md`, the Roadmap's rules in the `roadmap-rules` skill, and `.claude/settings.json` already tracked.

## Pieces
**On GitHub**
1. **The ruleset on `develop`** - Settings → Rules → Rulesets, a new ruleset named `develop`, targeting `develop` by name. Keeps every change to `develop` going through a checked PR (decision 22): require a pull request (0 approvals; squash and merge commits allowed), require `lint`, `type-check`, `unit-tests` and `build` with "Require branches to be up to date" on, block force pushes, restrict deletions. Its bypass list holds only the back-merge App (Piece 4).
2. **The ruleset on `main`** - gains "Require a pull request" (0 approvals, merge commits only), so nothing reaches production except through a PR (decision 23). Its other rules stay.
3. **The repo's pull request settings** - Settings → General → Pull Requests. Say how PRs merge: merge commits and squash allowed, rebase off; "Allow auto-merge" on (decision 9); "Automatically delete head branches" on (decision 19); the default merge commit message is the PR title, so `main`'s history lists the goals shipped (decision 5's finding); the default squash message is the PR title with its commit details, so a story's step messages survive on `develop` (decision 10).
4. **The back-merge GitHub App** - Sarah's own GitHub App, installed on this repo only, with Contents read and write. The one actor that may push to `develop` (decision 25). Its ID and private key are the Actions secrets `BACK_MERGE_APP_ID` and `BACK_MERGE_APP_PRIVATE_KEY`.
5. **`.github/workflows/back-merge.yml`** (new) - brings a hotfix on `main` back into `develop` (decision 24). On a push to `main`, it checks out the full history; if `git rev-list --no-merges origin/develop..origin/main` is empty (a release merge), it stops. Otherwise it mints the App's token with `actions/create-github-app-token`, merges `origin/main` into `develop` with `--no-edit` and pushes. Its own token stays `contents: read`. If the merge conflicts, the job fails and pushes nothing.

**Worktrees**
6. **`.worktreeinclude`** (new) - one line, `.env.local`, so the app copies it into each worktree it makes (decision 18).
7. **`.gitignore`** - ignores `.claude/worktrees/` in place of the leftover `.worktrees/` (decision 17), and `.claude/launch.json` (Piece 11). Boy Scout fix: its `.pnpm-store` line goes; pnpm's store is in `~/Library/pnpm/store` and nothing makes one in the repo (found by the worktree research, 2026-10-05).
8. **`vitest.config.ts`** - excludes `.claude/**`, so the main checkout's tests never pick up a worktree's (decision 17).
9. **`next.config.mjs`** - sets Next's root to the project's own folder, as Next's version-matched docs describe (`turbopack.md`, "root"), so a nested worktree builds from itself (decision 17).
10. **The SessionStart hook in `.claude/settings.json`** - on `startup`, runs Pieces 11, 12 and 13 in that order. Each script exits at once when `CLAUDE_CODE_REMOTE` is `true` (a cloud session, whose setup script already installs), prints what went wrong on failure, and never stops the session (SessionStart hooks can't block one; code.claude.com/docs/en/hooks).
11. **`scripts/sync-develop.sh`** (new) - keeps `develop` current after PRs merge on GitHub (decision 14). It runs `git fetch origin` in any checkout. In the main checkout, on `develop` with no uncommitted changes, it also fast-forwards `develop` (`git merge --ff-only`).
12. **`scripts/worktree-setup.sh`** (new) - makes a worktree buildable (decision 18). In a worktree (its `git rev-parse --git-dir` differs from `--git-common-dir`), it copies the main checkout's `.env.local` if it has none (a hand-made hotfix worktree, which `.worktreeinclude` doesn't cover), runs `mise trust` on its `mise.toml`, then `pnpm install --frozen-lockfile`, which also reinstalls lefthook's hook. In the main checkout it does nothing.
13. **`scripts/worktree-slot.sh`** (new) - gives each checkout its own ports, hostname and database (decisions 20 and 21), and writes the checkout's gitignored `.claude/launch.json`: `dev` and `sign-in` at its ports, opening its URL.
    - **The main checkout** keeps ports 3000 and 3001, `localhost` and `test`, and its `.env.local` isn't touched.
    - **A worktree with no slot yet** (no `PORT` in its `.env.local`) takes the lowest free pair of ports from 3010 up, in steps of 10, skipping the pairs other worktrees' `.env.local` files hold (found through `git worktree list`). Its hostname is `<worktree folder>.localhost` and its database `test-<worktree folder>`. It writes `PORT`, `SIGN_IN_PORT`, `BETTER_AUTH_URL` (`http://<hostname>:<PORT>`) and `DB_URL` (with the database name swapped) into its own `.env.local`.
    - **A worktree that has a slot** keeps it, and only rewrites `launch.json` if it's missing.
14. **The `dev` and `sign-in` commands** (`package.json`) - run on the checkout's `PORT` and `SIGN_IN_PORT` from `.env.local`, defaulting to 3000 and 3001, always as a fixed port, so a taken port fails instead of moving to the next one (decision 20).
15. **`seed/signInServer.ts`** - listens on `SIGN_IN_PORT` (default 3001) instead of a fixed 3001, and redirects to `BETTER_AUTH_URL` as today.
16. **`seed/devDatabase.ts`** - the seed's guard accepts `test` or a name starting `test-`, and nothing else (decision 21). Before the step that changes it, `/implement` asks Sarah for production's database name (Vercel → Settings → Environment Variables → `DB_URL`, Production); if it starts with `test`, building stops and the finding goes to her.
17. **`seed/dropWorktreeDatabase.ts`** (new) and its `package.json` script - drops one worktree's database, refusing any name that doesn't start with `test-`, through the same connection rules as `seed/devDatabase.ts`. `/close` runs it (decision 21).
18. **`playwright.config.ts`** - picks a free port once per run and passes it to the workers through `process.env`, as the file already passes its other values, instead of a fixed 3100, so two checkouts can run E2E at once (decision 20).
19. **The `running-the-app` skill** - opens the checkout's own URLs from its `.claude/launch.json`. A server already on the port is reused only if it's this checkout's: for `dev`, the PID in this checkout's `.next/dev/lock`; for `sign-in`, the listener's working folder. Otherwise it stops and tells Sarah what's on the port (decision 20).

**Skills and agents**
20. **`/implement`** (`.claude/skills/implement/SKILL.md`) - builds only on a story branch.
    - If it's run in the main checkout, it stops and tells Sarah to start a worktree session (decision 13).
    - Its first step brings the branch up to date with its base, `main` for a `hotfix/` branch and `develop` otherwise, with the app's sync-with-base-branch tool where the session has it and `git merge` otherwise. It commits a clean merge itself; a conflict stops it to resolve with Sarah; uncommitted changes stop it (decisions 11 and 29).
21. **`/final-review`** (`.claude/skills/final-review/SKILL.md`) - reviews the branch and opens its PR.
    - The same first step as `/implement`, and the same stop in the main checkout.
    - Step 2's range is the branch's own: from `git merge-base origin/<base> HEAD` to `HEAD`, plus uncommitted changes. The split into files a step names and everything else stays, for edits made while resolving a merge. [[Notes Vault Repo]]'s date-based start and its interim note go (Goal 8).
    - Its last step, once Sarah has committed the review's fixes: push the branch and open its PR into the base, titled with the story's name (decision 8). Into `develop`, it turns on auto-merge with squash (decisions 9 and 10). Into `main`, it doesn't, and tells Sarah to merge it (decision 29).
    - The story stays `in-review` (decision 12). Its `^status` line says the PR, as in "Reviewed. PR #12 merges once its checks pass. Next: /close once it merges", or for a hotfix "Reviewed. Next: merge PR #12, then /close".
22. **`/close`** (`.claude/skills/close/SKILL.md`) - closes a story once its PR has merged.
    - **An `in-review` story:** it reads the PR from the `^status` line and checks it on GitHub (`gh pr view`). If it has merged, it sets `done` and does a done close. If not, it stops and says so (decision 12). A `done` story (closed before this story) closes as today.
    - **After the note is closed:** it removes the story's worktree and local branch with git from the main checkout, and drops the worktree's database with Piece 17. If the worktree has uncommitted changes, it stops and asks Sarah first (decision 19).
    - **A goal:** "a goal closes through `/ship-goal`". Step 7 marks a goal with no open lines left `Next: /ship-goal` in place of "waiting on a release process", and step 9's report names it (Goal 11).
    - Its hook loses `docs`, and a doc gap is drafted, then written in a new worktree session or added to Docs Updates (decision 13).
23. **`/check-drift`** (`.claude/skills/check-drift/SKILL.md`) - its hook loses `docs`, with the same doc-gap handling (decision 13).
24. **`/tooling`** (`.claude/skills/tooling/SKILL.md`) - makes its change on its own branch.
    - If it's run in the main checkout, it stops and tells Sarah to start a worktree session (decisions 13 and 31).
    - Once Sarah has committed the change, it pushes the branch and opens a PR into `develop` with auto-merge and squash, titled with the change.
    - With Roadmap edits held back ([[Notes Vault Repo]]'s convention), it watches the checks, and once GitHub shows the PR merged, it makes the edits and runs `vault-lint.sh`. If a check fails, it stops, and its report lists the edits still to make (decision 15). This replaces the interim "the commit to `develop` is when the skills go live".
25. **`/ship-goal`** (new, `.claude/skills/ship-goal/SKILL.md`) - releases a finished goal, in one session in the main checkout, in this order (decisions 4, 26, 27 and 28):
    1. **Ready to ship:** the goal's Roadmap line says `Next: /ship-goal`. After `git fetch`, nothing on `main` is missing from `develop` (`git rev-list --no-merges origin/develop..origin/main` is empty); if something is, a back-merge failed, so it stops and says so.
    2. **Nothing left undone:** no Roadmap line in any section sits under the goal's Later heading or ends with its 🎯 link, and no unchecked collecting-note item, original or dated copy, carries its 🎯 link. Then the goal's Done When, one item at a time with Sarah, showing what covered each. An item nothing covers goes to `/roadmap <goal>` as a gap, and the release stops.
    3. **Review:** `leftovers-checker` in its goal mode over `origin/main..origin/develop`, with the list of story merges (`git log --first-parent`), and a check of the same range against `docs/project_conventions.md` and the docs it touches. Where it applies, an audit of whether each user-facing flow the range changed has an E2E test, and whether `docs/` covers each new folder, convention or tool.
    4. **Findings,** one at a time with Sarah, as `/final-review` steps 4-5 do: fix here, route or skip. A fix is made in a new worktree session with its own PR, and the release waits until it merges, then repeats step 1's check. A routed finding that serves the goal stops the release, since the goal isn't finished.
    5. **Close-out:** the goal note is deleted, its references handled as `/close` steps 2, 5 and 8 do; its Goals line and its Later heading come off the Roadmap. Promoting the planning goal is left to `/roadmap`.
    6. **The PR:** `gh pr create --base main --head develop`, titled with the goal's name, with no auto-merge. It ends by telling Sarah to merge the PR, which deploys, then run `/roadmap` in a new session.

    Its hook is the notes-only hook. It's user-invoked only.
26. **`leftovers-checker`** (`.claude/agents/leftovers-checker.md`) - gains a goal mode: given a range and its story merges instead of a note, it runs its checks across stories, and adds one: the same kind of thing done two ways in two stories.
27. **`/roadmap`** (`.claude/skills/roadmap/SKILL.md`) - before it promotes the planning goal, it checks GitHub for an open PR into `main` (`gh pr list --base main`), and if there is one, it says so and doesn't promote (decision 27).
28. **`scripts/vault-lint.sh`** - its Goals check recognizes the building and planning goals when text follows `- building` or `- planning`, such as ` · Next: /ship-goal`; today a marker after it hides the building goal and flags every Now and Next line.
29. **Note Conventions** (`.claude/rules/note-conventions.md`) - `in-review` says the PR is open and auto-merge is on; `done` is set by `/close` once the PR merges; the goal row ("a goal with no open stories or collecting-note items") names `/ship-goal`: check the goal, close the goal note and clean up the Roadmap, open the PR into `main`, then `/roadmap` (Goal 11).
30. **The `roadmap-rules` skill** - a finished goal's Goals line ends with ` · Next: /ship-goal`.
31. **AGENTS.md**:
    - **Git and files:** planning sessions run in the main checkout, which stays on `develop` and is never edited; every code-repo change is made in a worktree session on its own branch and reaches `develop` through a PR. The one commit a skill makes without being asked is `/implement`'s and `/final-review`'s merge of the base branch.
    - **Doc gaps:** in a session that can't edit the code repo, the draft is made and approved on the spot, then written in a new worktree session or added to Docs Updates with the approved text (decision 13).
    - **Docs:** `docs/branching.md` before work that touches branches, PRs, releases or hotfixes.

**Docs**
32. **`docs/branching.md`** (new) - the guide (Goal 2): how branches, worktrees, PRs, releases and hotfixes work here, with what Sarah does at each point of a story, a `/tooling` change, a quick fix, a hotfix and a release, and a "When something goes wrong" section for each failure in the Flow. It holds the hotfix commands: `git worktree add -b hotfix/<slug> .claude/worktrees/hotfix-<slug> origin/main`, then open that folder in the app.
33. **`docs/ci.md`** - "Setup Outside the Repo" records the two rulesets, the PR settings, the back-merge App and its two secrets, and the app's branch prefix; drops "you can still push straight to `develop`"; "`develop` Is the Default Branch" says a skill change reaches the routines once its PR merges into `develop`; its rule on renaming a check job covers both rulesets. A section for `back-merge.yml`.
34. **`docs/seed.md`** - each worktree's database `test-<worktree folder>`, the widened guard, ports from `.env.local`, and that `/close` drops a worktree's database.
35. **`docs/e2e_tests.md`** - its 3100 lines become "a free port per run".
36. **`docs/project_structure.md`** - the new files: `.worktreeinclude`, the three scripts, `seed/dropWorktreeDatabase.ts`, the workflow, `docs/branching.md`.

**Routines**
37. **The `routine-sessions` skill** - "The routine runs the skill as it is on `develop`" says a change to a routine's skill reaches the routine once its PR merges into `develop`, not once it's pushed there.

## Flow
**A story:**
1. `/shape`, `/decide`, the design skills and `/plan-steps` run in the main checkout, which the hook keeps on the latest `develop`, and edit only notes.
2. Sarah starts a Code-tab session with the worktree option and runs `/implement <note>`. The app makes `feature/<generated name>` in `.claude/worktrees/` from `origin/develop` (fetched by the hook) and copies `.env.local`. The hook trusts `mise.toml`, installs and gives the worktree its slot.
3. `/implement` merges `develop` in and builds the step; Sarah reviews and commits. Each later step is a new session opened on the same worktree folder, starting with the same merge. A first pass in the browser uses the worktree's own ports, host and database, so a second story's worktree runs beside it.
4. `/final-review` merges `develop` in, reviews the branch's own range, then pushes, opens the PR and turns on auto-merge. The story stays `in-review`.
5. The PR's checks run. If `develop` moved meanwhile, the PR needs **Update branch** first. Once they pass, GitHub squashes it into `develop` and deletes the branch.
6. Sarah runs `/close` in the main checkout. It confirms the merge, sets `done`, closes the note, removes the worktree and local branch, and drops its database. Sarah archives the story's sessions when she likes.

**A `/tooling` change, note-less work or a quick fix:** a worktree session on its own `feature/` branch; the change is committed, pushed and PR'd into `develop` with auto-merge. A quick fix can also go through GitHub's web editor, which offers a branch and PR. `/tooling` waits for the merge only when it holds Roadmap edits.

**A hotfix:**
1. Sarah makes the worktree from `origin/main` with the command in `docs/branching.md` and opens it in the app. The bug runs through `/investigate`, `/plan-steps`, `/implement` and `/final-review` there; the skills merge `main` in, not `develop`.
2. `/final-review` opens the PR into `main`, with no auto-merge. Sarah merges it once the checks pass, which deploys.
3. `back-merge.yml` sees commits `develop` lacks, merges `main` into `develop` and pushes. Open story branches pick the fix up at their next `/implement` or `/final-review` session.
4. `/close` closes the bug.

**A release:**
1. `/close` closes the goal's last story and marks the goal `Next: /ship-goal`.
2. Sarah runs `/ship-goal <goal>` in the main checkout: the checks, the findings, the close-out, then the PR from `develop` into `main`.
3. Sarah merges it, which deploys, then runs `/roadmap`, which promotes the planning goal once no PR into `main` is open.

**When something fails:**
- **A check fails on a story or `/tooling` PR:** auto-merge waits; `ci-failure` opens its fix PR into the story branch, and once that merges and the checks pass, auto-merge goes ahead.
- **`develop` moved since a PR's checks:** the PR shows it's out of date; Sarah clicks **Update branch** (or asks a session to run `gh pr update-branch`), and the checks run again.
- **A merge of the base conflicts at the start of a session:** the skill stops and resolves it with Sarah before the step.
- **The back-merge conflicts:** the workflow fails and pushes nothing. Sarah, in a worktree session, merges `origin/main` into a branch from `develop`, resolves it and opens a PR into `develop` that merges with a merge commit. Until then `/ship-goal` won't start.
- **A direct push to `develop` or `main`,** from Sarah's account or a routine: GitHub rejects it.
- **A worktree's install fails** (such as an out-of-date lockfile after a merge): the hook prints the error, and the session's first `pnpm` command or commit hits it; the session runs `pnpm install` once the lockfile is right.
- **A worktree's port is taken by something else:** `pnpm dev` fails on its fixed port instead of moving, and `running-the-app` tells Sarah what's on it.
- **`/close` runs before the PR has merged:** it stops and says the PR is still open.
- **`/roadmap` runs while the release PR is open:** it doesn't promote the planning goal.

# Conventions
- **A skill that changes code runs on a branch.** A new or changed skill that edits the code repo (as `/implement`, `/final-review` and `/tooling` do) stops if it's run in the main checkout and tells Sarah to start a worktree session. If it builds or reviews a story's code, its first step merges the branch's base in, as `/implement` does. Lands in `/tooling`'s bullet on new skills and agents.
- **Every check job is required on both branches.** When a check job in `checks.yml` is added, renamed or removed, the required checks of both the `develop` and `main` rulesets change in the same change, so every PR, into either branch, is held to the same checks. Lands in `docs/ci.md`, in the rule that today covers only `main`'s ruleset.

# Setup Outside the Repo
1. **The `develop` ruleset:** GitHub → Settings → Rules → Rulesets → New branch ruleset named `develop`, with Piece 1's rules. Recorded in `docs/ci.md`, "Setup Outside the Repo".
2. **The `main` ruleset:** "Require a pull request" (0 approvals, merge commits only) added to the existing ruleset. Recorded in the same section.
3. **The repo's pull request settings:** Settings → General → Pull Requests, with Piece 3's settings. Recorded in the same section.
4. **The back-merge GitHub App:** Sarah's Settings → Developer settings → GitHub Apps → New GitHub App, with Contents read and write and no webhook, installed on `meal-planning` only, with a private key generated; then added to the `develop` ruleset's bypass list. Recorded in `docs/ci.md`.
5. **Two Actions secrets:** `BACK_MERGE_APP_ID` and `BACK_MERGE_APP_PRIVATE_KEY`, under Settings → Secrets and variables → Actions. `docs/ci.md` records their names, never their values.
6. **The desktop app's branch prefix:** Settings → Claude Code → branch prefix, changed from `claude/` to `feature/`. Recorded in `docs/ci.md`.

Sarah decided 2026-10-05 to set these up by hand once, rather than keep the rulesets and settings as files applied by a script.

# Out of Scope
- Running the E2E tests in CI: [[E2E Tests in CI]].

# Implementation
