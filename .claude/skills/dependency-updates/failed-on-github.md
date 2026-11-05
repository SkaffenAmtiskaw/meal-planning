# A Check That Fails on GitHub
Run each failed job's script here. If any fails here, find the update that breaks it and take that update off the branch. If they all pass, re-run the failed jobs on GitHub once.

In this file and in the file it hands off to, `<run ID>` is the `checks.yml` run, the first field the wait loop in step 5 of the skill printed, and `<run URL>` is that loop's last field. The payload's run is a different one.

List the jobs that failed:

```bash
gh run view "<run ID>" --json jobs --jq '.jobs[] | select(.conclusion == "failure") | .name'
```

Each one's script is the last `run:` line of that job in `.github/workflows/checks.yml`. What to do depends on the run:
- **This run left no update on the branch:** it changed only notes, so no update from it is to blame. Drop nothing, and go to "Finish".
- **Otherwise:** run every one of those scripts here, on the commit you pushed, before you choose a path.
  - **Any fails here:** go to "A Failure That Reproduces" with those jobs. The next run re-tests the others, so don't re-run them.
  - **All pass here:** go to "Re-Run the Failed Jobs".

## Re-Run the Failed Jobs
Follow `.claude/skills/routine-sessions/rerunning-a-failure.md`. The head branch is `claude/dependency-updates`, and the failed commit is the one you pushed. Two of that file's instructions change:
- Where it says to stop, leave that file rather than ending the session: keep what it would say, and its links, for the summary, and go to "Finish".
- Where it says to fix the failure, don't fix the code. Go to "A Failure That Reproduces".

## A Failure That Reproduces
Take the jobs one at a time. For each, first find out whether the script fails without this run's updates: check out the starting point from step 2 of the skill and run `pnpm install --frozen-lockfile`. Then run the script. If it failed only with a variable set, run it the same way here. What to do depends on the result:
- **The script fails on the starting point too:** no update from this run is to blame, so drop nothing. Keep the reason and the line of output that shows it, for the body and the summary. The reason depends on the starting point:
  - **It's `origin/develop`:** `develop` fails that job without any update.
  - **It's the open pull request's merge:** check out `origin/develop`, install and run the script the same way.
    - **It fails on `develop` too:** `develop` fails that job without any update.
    - **It passes on `develop`:** the cause is an update an earlier run put in the open pull request, which fails with the latest `develop` merged in. Leave that update in, so the user decides what to do with it.

  Then go back with `git checkout claude/dependency-updates` and `pnpm install --frozen-lockfile`, and take the next job. If none is left, go to "Finish".
- **The script passes on the starting point:** an update from this run breaks it. Take these steps, in order:
  1. Use `git bisect` to find the first commit that fails it, even when the cause looks obvious. A guess can drop the wrong update, since a library's minor can break lint through its types. If the failure needs a variable set, set it on the script, as in `GITHUB_ACTIONS=true pnpm <script>`.

     ```bash
     git bisect start claude/dependency-updates "<starting point>"
     git bisect run sh -c 'pnpm install --frozen-lockfile && pnpm <script>'
     git bisect reset
     ```
  2. Check out the first bad commit, install and run the script, reproducing the failure the same way. Keep each error or failure it prints, with its file, for the sweep rule. Keep the dropped update, the job it broke and the line of its output that shows why, for the summary. If the failure showed up here only after you recreated a difference from GitHub's runner, also keep what that difference is.
  3. Note the hash of each commit on the branch that changes only notes, since cutting the branch again removes them.
  4. Cut the branch again from the starting point with `git checkout -B claude/dependency-updates "<starting point>"`, then run `pnpm install --frozen-lockfile`.
  5. Run step 3 of the skill again, leaving out the updates you've dropped. Then `git cherry-pick` each of those notes commits, in order.
  6. Take the dropped update through `sweep-rule.md`, which commits its item or line.
  7. Push over the branch, with a lease on the commit you last pushed, so you never overwrite another session's push: `git push --force-with-lease="claude/dependency-updates:<pushed commit>" origin claude/dependency-updates`. If it's rejected, go to step 6 of the skill.
  8. Rewrite the pull request's body as step 5 of the skill describes for an open pull request, even if this run opened it.
  9. Wait for the new run, as step 5 of the skill describes under "Wait for the Pull Request's Checks". It replaces the old run, so leave the old run's other jobs. If it fails, start this file again with it. Otherwise, go to "Finish".

## Finish
If a script fails on the starting point and the body doesn't say why yet, rewrite the body as step 5 of the skill describes for an open pull request.

Then go to step 6 of the skill. Its summary gives the last run's link, then what came of each failed job:
- fails here too, and an update was dropped for it: the update (under **Dropped**), and the result of the next run, with its link
- fails on the starting point: why, with the line of output that shows it
- flaked: passed when re-run, with both attempts' links
- fails only on GitHub's runner: what differs there, then what came of it:
  - **An update was dropped for it:** the update (under **Dropped**), and the result of the next run, with its link
  - **The starting point fails it too:** say so
  - **You couldn't reproduce it:** what you found and tried
- not looked into, because the branch moved on or the run was cancelled, with the newer run's link if there is one
- failed, though this run changed only notes: which jobs
