---
name: dependency-updates
description: Handles the new dependency versions and security advisories the dependency check found. Use when the dependency-updates routine starts a session with findings in a routine-fire-payload block.
---

Handle the findings described in the `routine-fire-payload` block. This session is a routine's session, so read the `routine-sessions` skill first.

The session puts the patches, minors and security fixes in one pull request into `develop`, from the `claude/dependency-updates` branch, and sees the pull request's checks through on GitHub. Only one such pull request is ever open, and each run adds to it. A major is never applied, and an update that breaks a check is dropped.

## 1. Read the Payload
The block names the run and its findings in this shape, one finding per line:

```text
<hourly|weekly> run <run ID> <run URL>
new:
<finding>
<finding>
reminders:
<advisory>
```

Each finding is one of:
- `patch <package>@<version>`, `minor <package>@<version>` or `major <package>@<version>`: a new version of a package in `package.json`.
- `advisory <ID> <severity> <package>`: a security advisory, such as `advisory 1121187 high undici`.

The lines under `new:` are the findings no earlier run has reported. The lines under `reminders:` are advisories an earlier run reported that are still unfixed. A part with nothing in it holds the single line `none`.

When the weekly run's check itself failed, the block holds the run line and one more line instead, and no findings:

```text
weekly run <run ID> <run URL>
check failed
```

Then follow `failed-weekly-check.md` in this folder, instead of steps 2 to 7.

If the block is missing a part, or has a line in none of these shapes, such as a reminder that isn't an advisory, stop. Say which part or line it was and what the block held.

## 2. Check Out the Branch
Fetch the latest `develop` and look for an open pull request from `claude/dependency-updates`:

```bash
git fetch origin develop
gh api -X GET "repos/{owner}/{repo}/pulls" -F head="{owner}:claude/dependency-updates" -f base=develop -f state=open --jq '.[] | "\(.number) \(.html_url)"'
```

### An Open Pull Request
If it lists one, keep its number and link for step 5. Check out its branch and bring it up to date with `develop`:

```bash
git fetch origin "+refs/heads/claude/dependency-updates:refs/remotes/origin/claude/dependency-updates"
git checkout -b claude/dependency-updates origin/claude/dependency-updates
git merge --no-edit origin/develop
```

If the merge conflicts, what to do depends on which files conflict:
- **Only `pnpm-lock.yaml`, `notes/Roadmap.md` or both:** resolve each file as its bullet says and `git add` it. Once they're all added, run `git commit --no-edit` to finish the merge.
  - **`pnpm-lock.yaml`:** run `pnpm install --no-frozen-lockfile`, which resolves a conflict in the lockfile.
  - **`notes/Roadmap.md`:** keep both sides' lines, since each side's lines are separate work. If both sides hold the same line, keep one copy, as `develop` has it, since `develop` renumbers Next's lines.
- **Any other file:** run `git merge --abort`. Skip steps 3 and 5, and leave the pull request as it is.

The branch as the merge left it is the **starting point** for step 3: the open pull request's updates on top of the latest `develop`. Keep its commit, from `git rev-parse HEAD`.

### No Open Pull Request
If it lists none, cut the branch fresh from `develop`. A closed pull request's branch may still be on GitHub, and step 5 replaces it, so first read the commit it's on:

```bash
git ls-remote origin refs/heads/claude/dependency-updates
git checkout -b claude/dependency-updates origin/develop
```

Keep the commit `git ls-remote` prints for step 5. If it prints nothing, keep that fact instead, since step 5's push depends on it. Here the **starting point** for step 3 is `origin/develop`.

### Install the Dependencies
Run `pnpm install --frozen-lockfile`, then `pnpm lefthook install`.

## 3. Apply the Updates
If the payload holds no patch, minor or advisory, skip this step.

Apply the security fixes first, then the patches, then the minors. Each update is its own commit, so the user can revert one alone and `git bisect` can find one that breaks a check.

Write each message in the style of `git log`, such as `security: bump mongoose 9.0.2 → 9.7.2 for advisories 1118996, 1139503` or `deps: bump resend 6.10.0 → 6.32.0`. A message always names the old and new versions, because step 5 builds the pull request's body from the messages.

### Security Fixes
If the payload holds an advisory, follow `security-fixes.md` in this folder.

### Patches and Minors
For each patch, then each minor:
- **If `package.json` already has that version,** such as when a security fix moved it there: list it as already in the pull request.
- **Otherwise:** run `pnpm update "<package>@<version>"` and commit it.

### Overrides That No Longer Do Anything
Take out of `pnpm-workspace.yaml` each override that no longer does anything, such as when a parent update now asks for a fixed version.

For each entry under `overrides`, remove it and run `pnpm install --no-frozen-lockfile`. Then look at `git diff pnpm-lock.yaml`. What to do depends on what changed:
- **Only the lockfile's own `overrides:` section:** the override did nothing. Commit its removal on its own, such as `deps: remove the undici override, which no dependency needs any more`. If it was the last one, remove the `overrides:` key too.
- **Anything else:** the override is still at work. Put it back (`git checkout -- pnpm-workspace.yaml pnpm-lock.yaml`, then `pnpm install --frozen-lockfile`).

## 4. Majors and Uncleared Advisories
This step takes what the session couldn't put in the pull request: each major, and each advisory no fix cleared. An advisory whose only fix is a major counts as a major of the package with the advisory, at its lowest fixed version. This skill calls it a **security major**.

**The assessed libraries** are React (`react`, `react-dom`), Next (`next`), Mantine (`@mantine/*`), better-auth (`better-auth`), luxon (`luxon`) and Zod (`zod`). The app leans on them most, so a major of one gets an assessment for the user to plan from.

**The release notes link** is the package's GitHub releases page. If it has none, as with a package from `DefinitelyTyped`, link its npm page and say it has no GitHub releases page.

**Reading release notes:** read `github.com` pages through WebFetch, since `gh` and `curl` reach only this repo there. Read `raw.githubusercontent.com` through WebFetch or `curl`. A `CHANGELOG.md` can be a symlink that returns only its target's path, so fetch that path. A releases page shows only the newest releases, of every package in the repo, so if the version you need isn't there, go on to the next pages (`?page=2`). Or read the changelog, which in a repo of several packages sits in the package's folder, such as `packages/plugin-react/CHANGELOG.md`.

What to do with each major and uncleared advisory, by case:
- **If it's a major of one of the assessed libraries:** have the `upgrade-assessor` subagent assess it, with one call per library, even when several of its packages have a major. Give the subagent each package's version in `package.json` and its new version, any major of the library's `@types/*` package in this run, and a security major's advisory ID. Keep its report for the summary. If it's a security major, also follow `sweep-rule.md` in this folder, which writes its Roadmap line.
- **Otherwise:** follow `sweep-rule.md`.

## 5. Push and Open or Update the Pull Request
If steps 3 and 4 left no commit on the branch, skip this step.

### The Body
The body starts with `From dependency check run <run URL>.`, then lists what's in the pull request and what was dropped, in the same groups and shapes as the summary's **In the pull request**, **Dropped**, **Sweep items** and **Roadmap lines**. If a check fails on the starting point, the body says why, with the line of its output.

If a pull request is already open, the body lists everything in it, not only what this run added. Build it from these sources:
- **Updates:** the commits on the branch that aren't on `develop`: `git log --no-merges --reverse --format=%B origin/develop..claude/dependency-updates`. A package two runs both updated is one line, from its version before the first update to its version after the last.
- **Advisories' severity:** for an earlier advisory, the current body, read with `gh api "repos/{owner}/{repo}/pulls/<number>" --jq .body`.
- **Sweep items and Roadmap lines:** `git diff origin/develop...claude/dependency-updates -- notes`.
- **Dropped:** only this run's dropped updates.
- **The end:** leave out everything the current body has after its lists, such as an earlier session's link and Claude Code's footers. Claude Code's footer on an edit has no session link, so end the body with `Session: <link>`. Read this session's link from the latest commit with a `Claude-Session` trailer: `git log --no-merges --format='%(trailers:key=Claude-Session,valueonly)' | grep -m1 .`

### A Rejected Push
If a push is rejected, the branch changed on GitHub during this session, such as when another run's session pushed to it. Don't push again or force it, and open or edit no pull request.

### An Open Pull Request
Push the branch, then rewrite the pull request's body:

```bash
git push origin claude/dependency-updates && gh api -X PATCH "repos/{owner}/{repo}/pulls/<number>" -F body=@- --jq .html_url <<'EOF'
<body>
EOF
```

### No Open Pull Request
Push the branch over any branch a closed pull request left behind, then open a pull request into `develop`. The lease holds the commit from step 2, or is empty if `git ls-remote` printed nothing, as in `--force-with-lease="claude/dependency-updates:"`:

```bash
git push -u --force-with-lease="claude/dependency-updates:<commit from step 2>" origin claude/dependency-updates && gh api -X POST "repos/{owner}/{repo}/pulls" -f base=develop -f head=claude/dependency-updates -f title="Dependency updates" -F body=@- --jq .html_url <<'EOF'
<body>
EOF
```

### Wait for the Pull Request's Checks
If nothing was pushed, skip this. Otherwise, find the run for the commit you pushed (`git rev-parse HEAD`). Run this loop as one command with a 10-minute timeout. Run it at most three times, about 30 minutes in all:

```bash
for i in $(seq 9); do
  state=$(gh run list --workflow checks.yml --commit "<pushed commit>" --json databaseId,status,conclusion,url --jq '.[0] | "\(.databaseId) \(.status) \(.conclusion) \(.url)"')
  echo "$state"
  case "$state" in *" completed "*) break ;; esac
  sleep 60
done
```

Until GitHub starts the run, the loop prints `null`. If the run hasn't finished after the third loop, stop waiting. Keep its link for the summary, or, if no run started, that fact.

When it finishes, what to do depends on its result:
- **It passed:** keep its link for the summary.
- **It failed:** follow `failed-on-github.md` in this folder.
- **It was cancelled,** such as by another session's push to the branch: don't re-run it. Keep its link for the summary.

## 6. Minors in the Pull Request
If step 2 aborted the merge of `develop` or a push was rejected, skip this step, since this run's updates go under **Not applied**.

A version bump doesn't show what a minor adds, so the summary tells the user what it adds and whether the app should adopt any of it.

For each minor from this run that's still on the branch, unless its package is one of the assessed libraries:
1. Read the release notes for every version after the one in `package.json` on `origin/develop`, up to the new one, as "Reading release notes" in step 4 describes. The cases with nothing to read, and what to do in each before going on to the next minor:
   - **The package publishes none,** as with a package from `DefinitelyTyped`: keep for the summary that it has none.
   - **You can't read them:** keep for the summary that you couldn't, and name the site you couldn't reach.
2. Search the code for where anything those versions add would apply.
3. Keep what those versions add, with links, for the summary. Also keep a line or two on whether anything is worth a story to adopt, naming the files where it would apply.

## 7. The Summary
End with a summary for the user, in this order. Leave out a group or section with nothing in it. If the block's `new:` part is `none`, say there were no new findings.

1. **The pull request,** by how the run went:
   - **Step 2 aborted the merge of `develop`:** the open pull request's link, the files that conflicted, and that nothing from this run was applied.
   - **A push was rejected:** that it was, and that no pull request was opened or changed. If an earlier push in this run went through, give the pull request's link instead, and say it still holds the update that breaks the check.
   - **Neither step 3 nor step 4 left a commit on the branch:** that no update went in, that nothing was pushed, and that no pull request was opened or changed.
   - **Only step 4 left a commit on the branch:** its link, whether this run opened it or added to the one that was open, and that no update went in.
   - **Otherwise:** its link, and whether this run opened it or added to the one that was open.

   If this run pushed, also give **the checks on GitHub**, by how they went:
   - **Still going when you stopped waiting, or never started:** say so.
   - **Finished:** the last run's link, then either that they passed, or which failed and what came of each, as `failed-on-github.md` describes.
2. **What this run applied,** by whether it reached the pull request:
   - **If step 2 aborted the merge or a push was rejected: Not applied.** Give each patch, minor and advisory from this run, in the shapes below. Also give the full text of each sweep item and Roadmap line this run would have written, and where it would have gone. This is its only record, since the check won't report those versions again until a newer one comes out. Leave these out of **Sweep items** and **Roadmap lines**.
   - **Otherwise: In the pull request.** Group them by kind, in these shapes:
     - security fixes: each package once, as `<package>`: advisory `<ID>` (`<severity>`), repeating the advisory part for each one it fixes. Then say how it was fixed, as one of `<package>` `<old>` → `<new>`, a lockfile bump to `<version>`, `<parent>` `<old>` → `<new>`, or an override to `^<version>`
     - patches: each as `<package>` `<old>` → `<new>`
     - minors: each as `<package>` `<old>` → `<new>`
     - overrides removed: each override's key, as `'<package>@<range>'`
3. **Dropped:** each update taken off the branch, as above, with the check it broke, the line of its output that shows why, and the sweep its item went to or where its Roadmap line is. If a push was rejected, say its item or line is under **Not applied** instead.
4. **Not fixed:** each new advisory the session didn't fix, as `<package>`: advisory `<ID>` (`<severity>`), and why: already fixed, no fix released yet, or no fix cleared it, with what was tried.
5. **Sweep items:** each item this run added or updated, as `<package>` `<old>` → `<new>`: added to or updated on `<sweep>`, with the work in one sentence. If an item went on the Roadmap because its sweep is missing, list it here and say the sweep is missing. If a package's item is in a kicked-off copy, list the package here, naming the copy and the newer version.
6. **Roadmap lines:** each flagged package, as `<package>` `<old>` → `<new>`: the section or heading its line is in, then the reason its line gives. Name any unchecked sweep item for the package beside it.
7. **Reminders:** each reminder the session didn't fix, as `<package>`: advisory `<ID>` (`<severity>`), and why: no fix released yet, its Roadmap line, or already fixed in the open pull request.
8. **Minors:** each minor from step 6, as `<package>` `<old>` → `<new>`, then what step 6 kept for it.
9. **Majors:** the assessed libraries' majors from step 4, last because a report is long, by kind:
   - **A major with a report:** `<package>` `<old>` → `<new>`. If it's a security major, flag it as a security fix, with its advisory ID. Otherwise, mark it "not applied". Beside it, list any major of the library's `@types/*` package in this run, as part of that upgrade. Then show the report unedited, and offer to create a note for the upgrade.
   - **A major of an assessed library's `@types/*` package, with no major of its library in this run:** `<package>` `<old>` → `<new>`: not applied, with its release notes link and the library it belongs to.
