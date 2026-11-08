---
name: finish-goal
description: Starts a finished goal's release, with its audits and the release freeze. Use when a goal's line under Goals says Next: /finish-goal.
argument-hint: "[goal name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Start the release of the goal **$ARGUMENTS**: confirm with the user which audits apply, write an audit note for each, and start the release freeze.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Check the Goal Is Ready
Run `git rev-parse --path-format=absolute --git-dir --git-common-dir`. If the two paths differ, this is a worktree. Stop, and tell the user to run `/finish-goal` in a session in the main checkout. Step 5's cards open in this session's folder, and the audits have to run in the main checkout.

Read `Roadmap.md` and the goal's note in `goals/`, both in the notes repo, and invoke the `roadmap-rules` skill. Then the checks, in order:
1. **The goal's line under Goals ends with ` · Next: /finish-goal`.** If it doesn't, tell the user what the line says, and stop.
2. **Nothing on `main` is missing from `develop`.** Run `git fetch origin`, then `git rev-list --no-merges origin/develop..origin/main`. If it lists a commit, a hotfix's back-merge failed, and the release would undo the hotfix. Tell the user which commits are missing and that `docs/ci.md`'s "Back-Merge" section says how to bring them back by hand, and stop.
3. **Nothing in the goal is left undone.** No open line sits under the goal's heading in Later or carries its 🎯 link. No line ends with 🔁. Such a line was added after the goal's line got ` · Next: /finish-goal`. If the release started now, the freeze would hold the line back, and the goal would ship without it. If one is there, tell the user which lines, and stop.

## 2. Confirm Which Audits Apply
Read the release's range, `origin/main..origin/develop`: which stories it merges and what it changes. Then read the goal's Done When.

The audits, in the order to go through them, each with the kind to write in its note and what it covers:
- `security` - server actions, reads and auth.
- `accessibility` - the release's screens, against WCAG.
- `ux` - the release's screens, including phone use and styles: whether the screens are consistent with each other and with `docs/style_guidelines.md` and `docs/theme.md`.
- `e2e-coverage` - whether the release's user flows are covered by E2E tests.
- `docs-coverage` - whether `docs/` covers what the release added.
- `cross-story-review` - a code review across the goal's stories, for leftovers, duplicated logic and patterns that drifted between stories.

Go through them with the user one at a time. For each, propose whether it applies and its scope, with the reason from the range or the Done When. A scope is the release's range, the whole app or a named part of the app, and it differs by audit. For example, a release that changes no screens needs no accessibility audit, while a security audit may need the whole app to see how the release's actions fit with the rest.

## 3. Write the Audit Notes
For each audit the user confirmed, in step 2's order:
1. **The note:** create it in `features/releases/` in the notes repo from `.claude/note-templates/Audit.md`, named for the goal and the audit, such as `Dev Foundations Security Audit`. Write its kind exactly as step 2 lists it, because `/audit-release` picks its instructions by the kind.
2. **Its Roadmap line:** add `[[<note>]] ![[<note>#^status]] 🎯 [[<goal>]]` to Next, below the audit lines already added and above every other line, so the audit lines sit at the top of Next in step 2's order. Renumber the lines below them.

## 4. Start the Release Freeze
The steps, in order:
1. **The `# Release` section:** add it at the end of the goal note, with a bullet linking each audit note.
2. **The goal's line:** change ` · Next: /finish-goal` on the goal's line under Goals to ` · releasing`. This starts the freeze.

## 5. Put Up the Cards
For each audit note, put up a New session card with `start_session`, with `initiation` "own_initiative", `context` "fresh", `use_worktree` false, `/audit-release <note name>` as its `prompt` and a sentence on the goal's release as its `background`.

## 6. Report
Tell the user which audit notes you wrote and that the release freeze has started, so only the audits and their fix stories can be built until the release PR merges into `main`. If both the UX and the accessibility audits were written, tell the user to run them one after another, because they walk the running app and share the main checkout's server and database. The other audits can run at the same time.
