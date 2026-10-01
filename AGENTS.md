# Agent Instructions

## Project
A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

Work is planned and tracked as notes in the Obsidian vault in `notes/`.

`.opencode/` holds the old OpenCode agents and their files, kept only until the move to Claude Code finishes. If a task moves an OpenCode agent to Claude Code, or a skill names a file there (such as the test login `running-the-app` uses), read what it needs. Otherwise, leave `.opencode/` out of searches, and don't report problems you see in it.

## Working with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on.
- **Self-contained questions.** Put what a question is about inside it: the note, the file, the step. She may see only the question, not the text before it.
- **Open choices are hers.** When an instruction or plan leaves a real choice open (two reasonable readings, and nothing written picks one), ask instead of choosing.
- **Approval covers the edits.** Once Sarah approves a change, carry it out, and don't show her the edits it leads to for a second approval. An edit with only one possible form, such as a link swap or a Roadmap line that replaces the one it came from, goes in your summary. If carrying out the change turns up a real choice she hasn't made, such as where a new Roadmap line goes, ask her about that choice alone.
- **Open questions in notes are hers too.** An open question in a note (an Open Decisions question, an "Open questions:" list in an item, a `decision needed` entry) holds only what Sarah hasn't decided and wants to think about or research. If the code or docs can answer a question, look it up. If you aren't sure what she meant or what she'd pick, ask her right then. Only if she says she wants to think it over or research it, write it into the note.
- **Her decisions can change.** Her decisions, the rules and designs she approves, and her own lines in notes are her best call with what was known at the time, not fixed for all time. They stand until she changes them, so don't reopen one without a reason. If new information makes one look less sensible, such as a better option, a tool or feature she didn't know about, or a fact that changes a trade-off, don't set the new information aside because it conflicts. Show her what you found on its merits, what it solves and what it costs, name the decision, rule or line it would change, and let her decide. This covers a decision made earlier in the same session, a **Decided** line, an approved Rule or Design, and a line she wrote. For example, if a line says "[Sarah] When we start using [tool] we need to remember to do X" and a later session finds a better tool, the line doesn't tie the project to the first one.
- **Recommendations:** if she asks for a recommendation, always give one. Otherwise, give one when best practice supports it, and name the practice. When a choice comes down to her preference, say so and don't guess.
- **Security risks:** weigh a security risk against what the work actually exposes. If it could reach production (code that ships in the app's build, production data or secrets), or the story is about that risk, such as a story that secures sign-in, raise it. Otherwise, leave it out, along with any hardening against it. Dev tooling that only runs on Sarah's machine against her dev database is the usual case: at worst it reaches dev data. Weigh a risk a subagent reports the same way before you pass it on.
- **Doc gaps:** the moment you notice something that belongs in `docs/` (a convention the docs don't cover, or a rule that's wrong or out of date), deal with it right then. Don't save it for a report or a later pass.
  - **A wrong or out-of-date rule with one right fix, in a doc this story already edits:** it's a Boy Scout fix, as "Out-of-scope work" describes. Don't ask.
  - **Anything else:** stop and ask her whether it should become doc. If it should:
    - **The default, for any change that isn't big:** recommend drafting it now, because docs that wait for later rarely get updated. If she says to do it later, remind her of that preference. If she still says later, add it to `notes/features/tooling/Docs Updates.md`.
    - **A big change** (it needs more than one decision from her, or touches more than one file): give her a neutral choice between doing it now and adding it to Docs Updates, and do what she picks.
    - **Drafting it:** match the doc's existing style, show her the draft and write it once she approves.

## Editing notes
Any change to a note in `notes/` follows these rules:
- **Sarah's comments:** a line where her name is a tag or a signature (`[Sarah] I want X instead.`, `Change this to Y - Sarah`) is her own words. Never write in her voice or sign as her, and record her decisions in the third person ("Sarah decided 2026-09-25 that ..."). What you may do with one of her lines depends on the case:
  - **It's done or out of date:** show it to her and ask whether to remove it.
  - **It needs a workflow marker:** add a `🎯 [[Goal]]` link to its end or a `**Blocked by [[Story]]:**` prefix to its start, without asking. They sit outside her words, so adding one isn't editing them.
  - **Otherwise:** never edit it.
- **A note that's wrong or out of date** is handled by where the mistake is and what it changes. ⚠️ Check Drift callouts are only for drift: a story waited while the code, the conventions or other stories moved on, so parts of it no longer hold. Only `/check-drift` writes them, and it says how. No other session writes one or offers to, unless Sarah tells it to.
  - **The story you're working on has a mistake that changes its remaining work** (what gets built, or how), such as a wrong assumption in its approach, a detail an earlier skill got wrong, or wording that conflicts with a choice Sarah just made: fix the text directly, and name the fix in your summary.
  - **Your change affects another story's remaining work,** such as a tooling change that alters what one of its steps needs: leave that note alone. Tell Sarah in your summary what the change means for that story, and let her decide.
  - **The build differs from a step:** add an **As built:** note under the step.
  - **Only a name or path changed,** and the plan still works as written, such as a moved file or a renamed function: correct the name or path in place. Sarah approved the intent, not the path.
  - **It changes nothing about the work,** such as a wrong detail in a finding: if it's a line an agent wrote in a note you're working on, and not plan text, correct it. Otherwise, leave it.
- **Where It Stands** is the first section of every note except a goal or standing goal, right after the frontmatter, in its template's format. If a note has none, add it. It's a summary Sarah can read at a glance, and it holds only two things:
  - **The `^status` line** (the line ending in ` ^status`) says what work the story needs next or what it's waiting on, and nothing else. Never describe the story there. The story's line in `notes/Roadmap.md` embeds it after the link, `[[Note]] ![[Note#^status]]`, so Sarah can scan what each story needs. Add the embed if it's missing.
  - **Below it, a short summary** of what work has been done and what remains, in a few sentences. It doesn't describe the story, because Purpose does that.

  Whoever moves a story forward updates both. When the next step is settled, write them without asking and mention it in your summary. When there's a real choice, such as what the story is blocked on, show Sarah the line and wait for her approval.

  In an older note, Where It Stands may hold other things, such as background, findings or a list of questions. When you work on the note, rather than just editing it in passing, move each one where it belongs: a question for a later step to the top of the section that step writes, and anything else to the Inbox.
- **The Inbox** comes right after Where It Stands in every story and hub. It holds items for a later step to act on that have no section of their own. Sarah adds items there when something occurs to her. Sessions and agents add things like background from another story, a new piece for a redesign or a retype line. A question for a later step isn't an Inbox item: it goes at the top of the section that step writes, as `/shape` describes.
  - **Adding an item:** say what it is and where it came from. If the note has no Inbox, add one right after Where It Stands.
  - **Working on a note:** read its Inbox, and decide which items are your step's to act on. Act on each one. Then, if it's one of Sarah's lines, handle it as "Sarah's comments" above describes. Otherwise, delete it. Leave items that belong to a later step.
- **A note with the wrong type.** If a note's type doesn't fit its work, tell Sarah which type fits and why, and offer to retype it. If she agrees, retype it as the `retyping-a-note` skill describes, then stop.
- **Roadmap order is Sarah's call.** Never reorder `notes/Roadmap.md`. Ask her where a new line goes. If the notes or the Roadmap make the spot clear, suggest it and say why. Otherwise, ask without a suggestion. Never guess one.
- **A blocker outside the queue.** If a story in Next gets a story in its `blocked-by` that isn't in Now or Next, propose pulling that story into Next directly ahead of it, with the same markers, and say why.
- **Starting on a story in the backlog.** Sarah running a skill on a story means she's moving forward with it. If the story's Roadmap line is in Later or Ideas when a skill starts on it, ask her whether it moves into Next. If it does:
  - check its goals as the `roadmap-placement` skill describes
  - give it a 🎯 link for each goal she names; if none of them is active, ask her whether it gets 📌 and with what reason
  - ask her where in Next it goes, as "Roadmap order" above describes

  This doesn't apply to `/implement`, which moves the line into Now itself, or to `/tooling`, which finishes its change in one session.
- **A new item in a collecting note.** When you add one, check which goals it serves and link it as the `roadmap-placement` skill describes. An item that `/check-drift` moves back or `/kickoff` rolls over isn't new, so it keeps the links it has.
- **A `ready` note goes back to `spec`** when its design or steps change, until Sarah re-reviews it. Three changes don't count, because they leave the plan as she approved it: a corrected name or path, a Boy Scout fix (see "Out-of-scope work") and a routed impact's acceptance check (see `.claude/agents/scope-router.md`).
- **Template comments** (the `%% ... %%` guidance in `notes/templates/`) never stay in a note. The template keeps them, and the skill that writes each section carries its rules.
  - When you create a note from a template, leave out every comment, along with any line that held only a comment, such as an empty checkbox. A section a later step writes stays as a bare heading.
  - When you work on a note that still has template comments, rather than just editing it in passing, remove them.
- **Embedded sections** (`![[Note#Section]]`) are part of the note. A raw file shows only the link, so open each one and read it as part of the note.
- **Before you finish** a session that changed any note, run `sh scripts/vault-lint.sh`. It checks the notes changed since the last commit, and the whole vault, for the rules above that a script can check, such as a missing `^status` line or status embed, a broken link or a `blocked-by` entry for a closed story. Fix what it reports in the notes this session changed, following the rules above. If it reports something in a note this session didn't change, tell Sarah instead of fixing it.
- **Anything bigger, outside a skill:** a skill carries what it needs for the notes it changes. Without one, read `notes/Note Conventions.md` before creating, moving, closing or deleting a note, or changing its `status`.

## Out-of-scope work
Keep a running list of anything that looks like it belongs outside the story or step you're working on, whether you, a subagent or Sarah found it. If Sarah gives feedback on how a skill, subagent or the workflow itself behaves, and this session isn't working on that same skill or subagent, it always goes on the list, even when it's also saved as a memory. Don't stop to deal with items as they come up.

**Work the story needs isn't an item.** If the story can't meet its own Purpose without some piece of work, such as gitignoring the output of a tool the story adds, that work is part of the story, even when a subagent reports it as outside its rules or no rule covers it. If the story's steps are written, add it to the step that needs it. Otherwise, add it to the section that lists what the story changes, such as its Suggested Approach, Fix, Migration Checklist or Design. Name it in your summary.

**Immature stories aren't items.** A note or Roadmap line that isn't shaped yet, such as Sarah's jotted thoughts with no frontmatter or Where It Stands, a Roadmap line with a description after its status embed, or a story that is only a Roadmap line, stays off the list. `/shape` and the skills after it turn it into a unit of work and format it. If something is wrong with it beyond that, such as a wrong fact or a real conflict, it goes on the list.

**Boy Scout fixes aren't items either.** A story leaves the files it edits a little cleaner than it found them. If a problem that you, a subagent or Sarah has found is small, needs no decision and sits in a file this story already edits (production code, tests or docs alike), the fix joins the story on its own. Don't go looking for problems to fix. This is only for ones found while working. Where the fix goes depends on how far the story has got:
- **Its steps are written:** the fix goes with the step that edits the file. If that step isn't built yet, add "Boy Scout fix: <the problem>, found <how and when>" to its **Source:**. Otherwise, make the fix now and record it the way your skill records its other changes, such as an As built note in `/implement`.
- **Otherwise:** add it, starting "Boy Scout fix:", to the section that lists what the story changes, such as its Suggested Approach, Fix, Migration Checklist or Design, so `/plan-steps` puts it in the step that edits the file.

Name each Boy Scout fix in your summary, so Sarah can take one out.

**Sarah decides what's out of scope.** Before you show her the result she approves, go through the list so far with her, **one item at a time**. Each skill names the point where this happens. For each item, show what it is, where it was found and why it looks outside this work. Then offer the choices below. If the skill has no story to pull into, offer only route or drop. Otherwise, offer all three:
- **Pull it in:** it becomes part of this story. She may have thought it was in scope, or want it done while this work is here. The skill says how it enters the story.
- **Route it:** it belongs somewhere else. If she names where, put it there now, without the router, written the way `.claude/agents/scope-router.md` describes for that kind of home.
- **Drop it:** take it off the list and don't record it anywhere.

Triage items that turn up after that point the same way, at the end.

Then route the items she routed without naming a home:
1. Send them to the `scope-router` subagent. For each item, include what it is, where it was found (`file:line`, or the note and section) and why it's outside this work. The router suggests a home for each item. It doesn't change anything.
2. Go through its suggestions with Sarah **one item at a time**: show the item and the suggested home with its reason, wait for her to approve, change or drop it, apply that one change to the notes, then move to the next.

## Subagent reports and scratch files
Save each subagent's report, unedited, to `.scratch/<note name> - <what it is>.md`, and link it when you show Sarah its findings. `.scratch/` is gitignored, and each commit deletes the files in it that haven't been written to for a day, so it only holds working files for one session. Anything a later session needs goes in the note itself, and a note never links to a scratch file.

## Docs
Read the docs a task touches when it needs them, not all up front:
- `docs/project_conventions.md` and `project_structure.md`: before planning or writing code
- `docs/style_guidelines.md` and `theme.md`: before UI work
- `docs/unit_tests.md`: before writing tests or mocks
- `docs/e2e_tests.md`: before writing E2E tests
- `docs/ci.md`: before changing a workflow or a routine

## Library APIs
The libraries in this project are newer than your training data. Never use an API from memory. Every API you use needs a source:
- **The same API already used in this codebase,** the same way.
- **Next.js:** the version-matched docs in `node_modules/next/dist/docs/`.
- **Mantine:** to look up a prop on a component already used the documented way, the type definitions in `node_modules/@mantine/*/lib/` are enough. Otherwise, the first time you use a component, or use one for a new purpose, read its mantine.dev page, found through https://mantine.dev/llms.txt. Its docs show how Mantine intends the component to be used, which the types don't.
- **better-auth:** https://better-auth.com/llms.txt, then the page for the API you need.
- **Anything else:** the installed package's docs for that version, or its type definitions.

Look up only what the task uses: one component, one function, one page.

## Commands
- `pnpm lint`: Biome. It **writes fixes** to the files, not just reports.
- `pnpm lint:ci`: Biome, report only. The lint check CI runs.
- `pnpm check:types`: generates Next's route types, then runs TypeScript with no emit.
- `pnpm test:coverage`: runs every unit test with coverage, as CI does.
- `pnpm test:agent <path>`: runs the tests for a file or folder, with coverage and output made for agents. For a break-it check on a unit test, run `pnpm vitest run <test file>` as the check says. Otherwise, use `pnpm test:agent` instead of calling `vitest` directly.
- `pnpm test:e2e`: builds the app and runs the Playwright E2E tests against a throwaway database. Pass a spec file or folder to run only those. `pnpm test:e2e:trace` does the same with a trace for every test, then opens the report. See `docs/e2e_tests.md`.
- `pnpm build`: Next.js production build.

## Git and files
- Don't commit unless Sarah asks. Stage files by path, never with `git add -A` or `git add .`.
- Before deleting a file, check its contents and `git status`. If it has uncommitted changes or isn't tracked, git can't bring it back, so ask Sarah first.
- **Project config** (`biome.jsonc`, `vitest.config.*`, `tsconfig*.json`, `lefthook.yml`): edit it only when Sarah explicitly asks for that config change.
- **Ignore comments** (a comment that switches off a lint, type or coverage check): add one only when Sarah tells you to ignore that error, and only on that one line. Telling you to ignore an error never means changing config.
