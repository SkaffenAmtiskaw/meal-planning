# Seeing the Release Through
The release tasks run by hand against production, and the After Deploy checks need setup only production has, so this session stays with the user from the PR's opening until both are done.

These rules hold for every step below:
- **Walking the user through a task:** do it as `docs/release_tasks.md`, "Running Tasks at Release", describes. The user runs each command in their own terminal, because it carries production's connection string. Compare what they paste back with what the task's comment expects. If a task's check fails, stop the remaining tasks and walk the user through the restore that section names.
- **Watching a backup run:** use `gh run watch <id> --exit-status`. If it fails, don't start any task. Point the user to `docs/backups.md`, "When a Backup Fails", for what to check, and once the cause is fixed, have them take a backup by hand, as step 1 describes. Go on once it passes.

The steps, in order:
1. **Tasks that run before the merge:** if any task's opening comment says it runs before the merge, the user first takes a backup by hand, so there's one to roll back to. Have them run it from Actions → **Database Backup** → **Run workflow**, and watch the run. Then walk them through each of these tasks. If one's check fails, the user doesn't merge until the restore is done and the task is sorted out.
2. **The merge:** tell the user to merge the PR on GitHub once its checks pass. Wait in the background until `gh pr view <number> --json state -q .state` prints `MERGED`.
3. **The release backup:** if no task runs after the merge, skip to step 5. Otherwise, the merge starts the backup at the same time as the deploy, and a task can't run until the backup exists. Find the run with `gh run list --workflow backup.yml --event pull_request --limit 1`, and watch it. A task also needs the new code live, so ask the user to confirm that Vercel shows the merge's production deployment as Ready.
4. **Tasks that run after the merge:** walk the user through each one. If the tasks' comments give an order, follow it.
5. **The After Deploy checks:** walk the user through each check.
6. **Removing the tasks:** if any task ran and its change still stands, put up a New session card with `start_session`, with `initiation` "own_initiative", `context` "fresh" and `use_worktree` true. Its prompt names each of those tasks and says the user asked for them to be deleted from `scripts/release-tasks/`. It also says the user asked for the old-shape code each task's opening comment names to be removed, and to open one PR into `develop` for both, as `.claude/skills/building-code/opening-the-pr.md` describes. A task that didn't run, or that a restore undid, stays in the folder, so the next release runs it.
7. **Report:** tell the user which tasks ran, which a restore undid and which checks passed or failed. Tell them to run `/roadmap` in a new session, which makes the planning goal the building goal.
