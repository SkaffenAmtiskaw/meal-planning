---
name: ci-failure
description: Looks into a failed check on a pull request, then fixes it or reports what it found. Use when the ci-failure routine starts a session on a failed run named in a routine-fire-payload block.
---

Look into the failed check described in the `routine-fire-payload` block. This session is a routine's session, so read the `routine-sessions` skill first.

## 1. Read the Payload
The block names the failed run in this shape:

```text
PR #<number>, head branch <branch>, run <run ID> <run URL>, failed jobs: <job>, <job>
```

If the block is missing any of these values, stop, and say which ones are missing and what the block held.

## 2. Check Out the Failed Commit
The routine starts on `develop`, and its clone may hold no other branch. Fetch the head branch, find the commit the failed run tested, and check it out:

```bash
git fetch origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
gh run view "<run ID>" --json headSha --jq .headSha
git checkout --detach "<head SHA>"
```

This is the **failed commit**. If the checkout fails because the commit isn't in the clone, such as after a force-push, run `git fetch origin "<head SHA>"` and check it out again.

Then run `pnpm install --frozen-lockfile` and `pnpm lefthook install`.

## 3. Run the Failed Jobs' Scripts
Each failed job's script is the last `run:` line of that job in this commit's `.github/workflows/checks.yml`. Run each one once, because a flake is settled by the re-run on GitHub rather than here. Keep each one's output, and run them all before you decide what to do next. What to do depends on the result:
- **Any script fails:** go to step 4.
- **Every script passes:** go to step 5.

## 4. Fix a Failure That Reproduces
Follow `.claude/skills/routine-sessions/fixing-a-failure.md`. The pull request's title is `Fix <failed jobs> on <branch>`, and its body links the original pull request and the failed run.

## 5. Re-run a Job Whose Script Passes
Follow `.claude/skills/routine-sessions/rerunning-a-failure.md`. Where it says to fix the failure, go to step 4.
