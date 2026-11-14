---
name: ci-failure
description: Looks into a failed check on a pull request, then fixes it or reports what it found. Use when the ci-failure routine starts a session on a failed run named in a routine-fire-payload block.
---

Look into the failed check described in the `routine-fire-payload` block. This session is a routine's session, so read the `routine-sessions` skill first.

The session starts above the `meal-planning` and `meal-planning-notes` clones, so `cd` into the `meal-planning` clone before anything else. Every command in this skill runs there unless it names the notes clone.

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
Each failed job's script is the last `run:` line of that job in this commit's `.github/workflows/checks.yml`. Run each one once, because a flake is settled by the re-run on GitHub rather than here. Run them one after another, never at once, because `pnpm build` and `pnpm test:e2e` write to the same `.next` folder. Keep each one's output, and run them all before you decide what to do next. What to do depends on the result:
- **`pnpm test:e2e` couldn't download Chromium or `mongod`:** the tests never ran, so that failure isn't reproduced. Name the host it couldn't reach in the summary you stop with, since that host has to be added to the cloud environment's allowed domains. If another script also failed, go to step 4 for that one only: don't sort the E2E failure, and leave `pnpm test:e2e` out of the scripts you run there, since it can't pass until the host is allowed. Otherwise, stop.
- **Any script fails:** go to step 4.
- **Every script passes:** go to step 5.

## 4. Sort and Fix a Failure That Reproduces
If `pnpm test:e2e` failed, sort its failure first, as `e2e-failure.md` in this folder describes.

To fix a failure, follow `.claude/skills/routine-sessions/fixing-a-failure.md`. The pull request's title is `Fix <failed jobs> on <branch>`, and its body links the original pull request and the failed run.

## 5. Re-run a Job Whose Script Passes
Follow `.claude/skills/routine-sessions/rerunning-a-failure.md`. Where it says to fix the failure, go to step 4.
