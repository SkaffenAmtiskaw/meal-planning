# A Failed Weekly Check
The run's `check` job failed. Find out why it failed, and fix it or explain it.

Find the branch and the commit the run tested, read the log of the step that failed, and check out that commit:

```bash
gh run view "<run ID>" --json headBranch,headSha --jq '"\(.headBranch) \(.headSha)"'
gh run view "<run ID>" --log-failed
git fetch origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
git checkout --detach "<head SHA>"
```

Then run the check, and keep its output: `pnpm install --frozen-lockfile`, then `pnpm lefthook install`, then `pnpm deps:check --weekly`.

Wherever you stop below, also tell the user that this week's findings and reminders weren't sent, unless a re-run sent them. New advisories still come from the hourly runs. Once any fix is merged, the rest comes with next Monday's run, or sooner if the user runs the workflow by hand with its weekly option.

In the files below, the failed job is `check`, its script is the check you just ran, the head branch is the run's branch, and the failed commit is the one you checked out. What to do depends on the check's result:
- **The check fails:** follow `.claude/skills/routine-sessions/fixing-a-failure.md`. The pull request's title is `Fix the weekly dependency check on <branch>`, and its body links the failed run.
- **The check passes:** follow `.claude/skills/routine-sessions/rerunning-a-failure.md`, with these changes:
  - When attempt 2 passes, also say what its `start-dependency-updates` job did, since the re-run also re-runs it. Read it with `gh run view "<run ID>" --attempt 2 --json jobs --jq '.jobs[] | "\(.name) \(.conclusion)"'`. If it passed, it sent the week's findings and reminders, which start a session of their own. If it was skipped, there was nothing to send.
  - When you diagnose a failure only GitHub's runner has, another difference is the reported list the run restored, which you don't have. If the log shows `pnpm deps:check` rejecting it, say so, and point the user to clearing it, as `docs/ci.md` describes under "The Reported List".
  - Where it says to fix the failure, fix it as "The check fails" above describes.
