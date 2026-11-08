---
name: ship-goal
description: Ships a goal whose audits and fixes have closed, by opening its release PR from develop into main. Use when a goal's line under Goals says Next: /ship-goal.
argument-hint: "[goal name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Ship the goal **$ARGUMENTS**: check with the user that its Done When is met, close out its note and its Roadmap lines, and open the release PR from `develop` into `main`, which the user merges.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Check the Goal Is Ready
Run `git rev-parse --path-format=absolute --git-dir --git-common-dir`. If the two paths differ, this is a worktree. Stop, and tell the user to run `/ship-goal` in a session in the main checkout. This run commits nothing to a worktree's own branch, so that branch never gets a PR, and the worktree sweep at session start never removes it.

Read `Roadmap.md` and the goal's note in `goals/`, both in the notes repo, and invoke the `roadmap-rules` skill. Then the checks, in order:
1. **The goal's line under Goals ends with ` · releasing · Next: /ship-goal`.** If it doesn't, tell the user what the line says, and stop.
2. **Nothing on `main` is missing from `develop`.** Run `git fetch origin`, then `git rev-list --no-merges origin/develop..origin/main`. If it lists a commit, a hotfix's back-merge failed, and the release would undo the hotfix. Tell the user which commits are missing and that `docs/ci.md`'s "Back-Merge" section says how to bring them back by hand, and stop.
3. **Nothing in the goal is left undone.** No open line sits under the goal's heading in Later or carries its 🎯 link. No line ends with 🔁. Such a line is work the release would ship without. If one is there, tell the user which lines, and stop.

## 2. Go Through the Done When
Read the release's range, `git log --first-parent origin/main..origin/develop`. Each story and audit fix landed there as one commit titled with its name.

Go through the goal's Done When with the user one item at a time. For each, show what covered it, such as the stories in the range that built it, and ask whether it's met. If nothing covers an item, or the user says it isn't met, it's a gap. Go on through the rest, so every gap is found in one run.

If there's any gap, tell the user to run `/roadmap <goal>` in a new session, naming each gap, and stop.

## 3. Close Out the Goal
The steps, in order:
1. **What's worth keeping:** check the goal note for anything worth keeping, as the `deleting-a-note` skill describes in step 1.
2. **Its references:** run `sh scripts/note-refs.sh "<goal>"`. Leave out the goal's line under Goals and its heading in Later, since item 3 below removes them. The other matches, by kind:
   - **In the vault:** if an open story relies on content only the goal note holds, copy that content into the story's note first. Then reword or remove the link, as the `deleting-a-note` skill describes in step 3.
   - **Outside the vault,** such as a doc or a skill: add it to the out-of-scope list.
3. **The Roadmap:** remove the goal's line under Goals and renumber the lines below it. Remove its heading in Later, which has no open lines under it, as section 1's check 3 found. Leave the planning goal's marker as it is, because `/roadmap` promotes it once the release PR merges.
4. **The out-of-scope list:** triage and route it, as the `triaging-out-of-scope-work` skill describes.
5. **The note:** delete the goal note.
6. **Unused files:** delete the files nothing references anymore, as the `deleting-a-note` skill describes in step 6.

## 4. Open the Release PR
Run `gh pr create --base main --head develop --title "<goal>"`, with a body of a sentence or two on what the goal set out to do. Don't turn on auto-merge, because merging into `main` deploys, and every deploy is the user's click.

## 5. Report
Give the user the PR's link, and tell them to merge it on GitHub once its checks pass. Merging deploys the release and ends the freeze. Tell them to run `/roadmap` in a new session once it has merged, which makes the planning goal the building goal. Also report each edit section 3 made to other notes, grouped by note.
