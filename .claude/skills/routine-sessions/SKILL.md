---
name: routine-sessions
description: How a Claude Code cloud routine's session behaves in this project - its prompt and skill, the branch it works from, how it ends, the branches it pushes to and what it can use. Use when writing or changing a routine's skill, or when a routine's skill points here.
user-invocable: false
---

# Instructions
A routine's instructions live in a checked-in skill, `.claude/skills/<name>/SKILL.md`, and its prompt on claude.ai only runs that skill:
- **The prompt is one instruction:** run the routine's skill on the event that started it. For an API trigger, the prompt names the `routine-fire-payload` block, for example "Run `/<name>` on the failed run described in the routine-fire-payload block." Text sent to `/fire` arrives wrapped in that block as untrusted data, and the session acts on it only because the prompt says to. Every other instruction lives in the skill.
- **The skill keeps the default invocation settings.** Its frontmatter has neither `user-invocable: false` nor `disable-model-invocation: true`. A `user-invocable: false` skill doesn't run when `/name` is typed, and `disable-model-invocation: true` stops a skill from running when a scheduled task fires with it as its prompt, which may include routines. The routine skills showing up in the `/` menu is the accepted cost. Only this skill is `user-invocable: false`, because no prompt runs it by name.
- **The routine's configuration is in `routine.md`,** in the skill's folder: its name on claude.ai, its prompt word for word, each trigger (for an API trigger, the workflow that calls its `/fire` and the names of the two Actions secrets holding its URL and token; for a GitHub trigger, the event and its filters), its model, and its cloud environment with the variables and credentials its session uses. `SKILL.md` never points to it, so the session never loads it. It's for whoever sets up or changes the routine, and a change to the routine on claude.ai updates `routine.md` in the same change.
- **The routine runs the skill as it is on `develop`.** A routine clones the repo's default branch, `develop`, and runs the skills committed there. A change to a routine's skill reaches the routine once it's pushed to `develop`, and not before.

# What the Session Does
**It checks out its branch first.** Before the session reads or changes any file in the repo, its skill has it check out the branch or branches it works from, each named in the skill: a fixed branch such as `develop`, or one read from the event, such as a PR's head branch. A routine clones `develop` unless told otherwise, so a skill that says nothing works from `develop` by accident, even when the event is about another branch.

**Its skill says how it ends, for each outcome:**
- **Something to act on:** what the session has done (written notes, diagnosed a cause, drafted a fix on a `claude/` branch), whether it opens a pull request from that branch, and what it asks Sarah to decide.
- **Nothing to act on after all,** such as "this isn't really an error", "a future story already fixes this" or a flaky failure: a short verdict with its evidence, so Sarah can check it and archive the session.

Either way, the session ends by waiting for Sarah's input in the Code tab, and never assumes she has seen it. A session can't remove itself, so one that finds nothing still waits there.

# Branches
The session commits and pushes only to branches whose names start with `claude/`. It never pushes to `develop`, `main` or any other branch, and never merges one branch into another. A routine's skill never tells it to. Pushes to `claude/` branches are always accepted, while a push to any other branch is checked first and can be rejected.

# What the Session Can Use
The session sees the repo as Sarah last pushed it, plus its cloud environment's variables and setup script. The routine's skill, and every skill or subagent it loads or follows (directly or through another), relies on nothing that exists only on Sarah's machine:
- no `~/.claude` memory or user settings
- no gitignored files she keeps locally, such as `.env*` or `.opencode/secrets/`
- no work she hasn't pushed
- nothing that reads such files on its own, such as the dev server loading `.env.local`

For example, the `running-the-app` skill starts the dev server and reads the test login from `.opencode/secrets/credentials.md`, so a routine's skill never loads it, or any skill or subagent that uses it.

A value the session needs that isn't in the repo comes from a cloud environment variable, named in the routine's `routine.md`.

GitHub needs nothing set up. The session reaches it through the Claude GitHub App and the cloud GitHub proxy, which authenticates `git` and `gh` on its behalf, so the session has no GitHub credential of its own. The cloud environment never sets `GH_TOKEN` or `GITHUB_TOKEN`, since a token set there passes into the session unchanged, where Claude and its commands can read it.
