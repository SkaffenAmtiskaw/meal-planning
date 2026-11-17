# Release Tasks
This doc is for anyone writing a story that changes production's stored data, and for running that change when the story ships. It assumes you know how a release works (see `docs/branching.md`, "A Release") and that production's data lives in the `staging` database (see `docs/services.md`, "MongoDB Atlas").

A release task is a one-off change to production's data that has to run when the release that ships its story goes out, such as a migration to a new shape or a backfill of a missing field. Each task is a TypeScript script in `scripts/release-tasks/`, added by the story whose code needs it. The folder is the list of what the next release runs. A task lands on `develop` with its story and is deleted once it has run.

# Writing a Task
A task runs in two ways: by hand, from your Mac, against production at release, and on its own, with no one watching, on the `test` database at each session start (see "The Dev Database"). The script is the only thing standing between a mistake and production's data, so it has to make each run safe on its own, without asking anything. These hold for every task:
- **It takes `db:restore`'s flags:** `--to <connection string>`; `--db <database>`, which defaults to `staging`; and `--production`. Without `--production` it refuses to write to `staging`, so a run pointed at production by mistake stops before it writes.
- **`--dry-run` prints what it would change and writes nothing.** The run at release starts with a dry run, so you see what will change before anything does.
- **A second run changes nothing,** such as by selecting only documents still in the old shape. Nothing records which tasks have run, so a task may be run more than once.
- **Its opening comment says how it's run, checked and cleaned up:** what it changes, whether it runs before or after the release PR merges, any task it has to run after and why, the story that added it, where the story's code handles the old shape, and the check that shows it worked, such as a count query and the result to expect. The sessions that run the task and remove it work from this comment.

A task runs after the merge unless its comment says otherwise. The merge takes the release backup (see `docs/backups.md`), so a task that goes wrong can be undone by restoring a backup from just before it ran. A task that has to run before the merge says why in its comment, and you take a backup by hand before running it.

Tasks run in filename order, so each file name starts with a date, `YYYY-MM-DD-`, such as `2026-11-15-storedDataCleanup.ts`. If a task has to run after another task with the same or a later date, such as one that writes ids the new task converts, give the new task a later date than the other's. Otherwise, use the day you write it. Today's date doesn't depend on what's already in the folder, while a number would let two stories written at the same time both take the next one.

A task opens its own raw database handle on the URI it's given, with `openDatabase` from `src/_models/database/openDatabase.ts`. It doesn't use the checked collection wrappers, because the data it reads doesn't match the schemas until it's moved, so a checked write would refuse it (see `docs/project_conventions.md`, "Stored Data"). The task runs under plain `node`, so it imports that file by its relative path, with its `.ts` extension.

## The Code Around a Task
A task's data change and its story's code never ship at the same moment. Previews share production's database, so from the story's merge into `develop` until the task runs, previews run the new code against data in the old shape. Production does the same between the deploy and the task. So the story's code has to read both shapes until the task has run. A task that runs before the merge reverses this: production's current code meets the new shape until the deploy, so either that code already reads it or the task waits for the merge. This is the parallel change pattern (Martin Fowler, "ParallelChange"). Once the task has run, the code that handles the old shape is dead, and it's removed in the same PR that deletes the task.

> [!NOTE]
> A short break in previews is acceptable when the story says it's expected, because previews are for checking work, not for users. Production never gets that allowance, since its users see the break.

## Rehearsing a Task
Rehearse the task before its story merges, because once it's on `develop` the next release runs it, and a mistake should show up on a copy rather than on production. Restore a recent backup into a local MongoDB on your Mac with `pnpm db:restore --to <uri> --db <name>`. Check the story's code against the data in the old shape, then run the dry run, the task and its check. Use a local MongoDB rather than a database on the Atlas cluster, for the reason `scripts/restoreTest.ts` gives.

## The Dev Database
At each session start, if the main checkout is on `develop` with no uncommitted changes, the SessionStart hook fast-forwards it, then runs each task in the folder on the `test` database, in filename order (see `scripts/sync-develop.sh`). It does this whether the session starts in the main checkout or a worktree. `test` holds your dev data, and local runs on `develop` read it, so it needs each task as much as production does. The dev data takes the new shape at the first session start after the story's PR merges. If a task fails there, the start-up message shows its output and the tasks after it don't run. The next session start runs them all again.

> [!NOTE]
> Until the release deletes a task, it runs at each session start and finds nothing left to change. A worktree's database needs none of this, because it starts empty and the seed writes the current shape (see `docs/seed.md`, "Worktrees").

# Running Tasks at Release
`/ship-goal` lists the release's tasks in the release PR's description, and its session walks you through each one. A task that runs after the merge waits for both the release backup and the deploy, so the new code is live before the data changes. First, copy production's connection string from Vercel, as `docs/backups.md`, "Restoring Production", step 2, describes, because the database user in your `.env.local` can't reach `staging`. Then run the tasks in filename order. For each, in a terminal in the main checkout, which is on the latest `develop` and so has the task:
1. **Run the dry run,** with the connection string in single quotes so the shell leaves the characters in its password alone, and check that what it would change matches the task's comment. If it doesn't, stop: nothing has been written yet.
2. **Run the task** with `--production` instead of `--dry-run`.
3. **Run its check** and compare the result with the one its comment expects.

If a task's check fails, restore production from the backup taken just before the task ran, as `docs/backups.md`, "Restoring Production", describes. For a task run after the merge, that's the release backup. The restore also undoes every task run since that backup, so those tasks stay in the folder to run again.

Once the tasks have run, the session puts up a **New session** card. In its own worktree, that session deletes the tasks that ran from `scripts/release-tasks/` and removes the old-shape code each task's comment names, in one PR. Git history keeps them.
