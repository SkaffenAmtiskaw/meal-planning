# Agent Instructions

## Project
A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

Work is planned and tracked as notes in the Obsidian vault in `notes/`.

## Working with the User
- **What to ask about.** Whether you ask depends on what a choice affects:
  - **What the app does or shows, what tooling, CI or a routine does for the user, or architecture, such as a new pattern or how code divides into modules:** if the choice is open, with two reasonable options and nothing written to pick one, ask rather than choosing.
  - **Only a low-level detail,** such as a file's location, how a file loads, or which API or command flags a script uses: make the call and name it in your summary, because the user doesn't want to decide these.
- **Questions.** Put what a question is about inside it, such as the note, the file or the step, because the user may see only the question. Use the question dialog (AskUserQuestion) only for a short choice whose full context fits in the question and its options, because it hides the chat text before it and its option previews don't show for them.
- **Recommendations:** if the user asks for a recommendation, always give one. Otherwise, give one when best practice supports it, and name the practice. When a choice comes down to their preference, say so and don't guess.
- **Drafts.** If the user has to approve a draft, such as note text, a file or a template, show it in the chat. At the end of the same message, ask in plain text whether they approve. How much you show depends on its size:
  - **If it's short:** show all of it.
  - **If it's long or holds many changes:** give a summary and a table of the changes, and show the text only for the parts they ask to see, because they miss things in a long draft.
- **Approval covers the edits.** Once the user has decided a change, what happens next depends on its form, even where a skill has an approval step:
  - **If its exact form was settled,** by their answer, their feedback or a design they approved, **or it's mechanical,** make it and name it in your summary, because approving what they've already decided costs them a review and adds nothing. A change is mechanical when it follows from one already made and leaves what the text means unchanged, such as rewording a link after a note was renamed.
  - **Otherwise, if writing it produced code or wording they haven't seen,** such as a new function or new doc text, ask them to approve it, as "Drafts" describes.
- **Decisions can change.** The user's choices are their best judgment with what was known at the time. Their choices are their decisions, the conventions, designs and plans they approve, and their own lines in notes, including a choice from earlier in the same session. If the user makes a new decision that changes an earlier one, they've already decided, so update the note that holds it, and don't ask about the earlier one or warn them about it. Otherwise, their choices stand until one of two things gives a reason to change one:
  - **The simplest way to do the work conflicts with one.** Deal with the conflict as soon as you see it, before you design around it. Never add workarounds, extra pieces or convoluted options to keep the choice.
  - **New information makes one look less sensible,** such as a better option, a tool or feature they didn't know about, or a fact that changes a trade-off.

  **Whose choice it is:** a choice is the user's call when they've shown it matters to them: an answer they gave with a reason of their own, a choice they said matters, a line they wrote, a piece of a Design, Convention or plan they asked for, or a story's scope. A story's scope is the work its note says the story takes on or leaves out, not the design or steps for doing that work. Everything else is only approved, such as an answer with no reason, a recommendation they accepted or a draft they approved.

  When you have a reason to change a choice, what you do depends on whose choice it is and what it affects:
  - **Only a low-level detail, even one marked "Sarah's call":** make the change and name it in your summary.
  - **Their call, what the app does or shows, or architecture:** stop and ask them. Tell them what the change solves, what it costs, and the decision, rule or line it would change. For example, if a line says "[Sarah] When we start using [tool] we need to remember to do X" and a later session finds a better tool, show them the better tool. The line doesn't tie the project to the first one.
  - **Otherwise, it's only approved:** make the change, and record it where the choice lives. How you tell them depends on its size:
    - **Big:** it changes what tooling, CI or a routine does for them, drops a piece from an approved Design, or reverses a **Decided** line. Open your summary with a bold ⚠️ line for it, saying what they approved, what it is now and why.
    - **Small:** anything else, such as order, structure or wording. Name it in your summary.

- **Setup outside the repo.** If work needs something the user sets up by hand outside the repo, such as a GitHub setting or a claude.ai routine, walk them through it at the point it's needed, because a list of setup at the end of a summary reads as reference, not as a prompt to act. Give one piece at a time, and wait for them to say it's done, or to tell you what they saw, before you give the next. In the same way, walk them through any check only they can do, saying what they should see and what it proves.
- **A problem's size.** If the user says a problem is large or keeps coming back, work from that size rather than arguing it down, because agents have kept offering narrow fixes while the user had to insist on a large-scale change. If the problem is outside the session's work, record their account of its size in its out-of-scope item. Otherwise, work out where it comes from and propose the fix that would end it, even if that means replacing what's there.
- **Security risks:** weigh a security risk against what the work actually exposes. If it could reach production (code that ships in the app's build, production data or secrets), raise it. Do the same if the story is about that risk, such as a story that secures sign-in. Otherwise, leave it out, along with any hardening against it. Dev tooling that only runs on the user's machine against their dev database is the usual case: at worst it reaches dev data. Before you pass on a risk a subagent reports, weigh it the same way.
- **Doc gaps:** if you notice something that belongs in `docs/`, such as a convention the docs don't cover or a rule that's wrong or out of date, deal with it right then, because docs that wait for later rarely get updated. What you do depends on the gap:
  - **A wrong or out-of-date rule with one right fix, in a doc this story already edits:** it's a Boy Scout fix, as the `triaging-out-of-scope-work` skill describes. Don't ask.
  - **Anything else:** stop and ask whether it belongs in `docs/`. If it does and it's a lot of work, give them a neutral choice between drafting it now and adding it to `notes/features/tooling/Docs Updates.md`. Otherwise, recommend drafting it now, and add it there if they say later.
- **Summaries.** If you changed files and your skill's report doesn't already list them, your summary includes a table, so the user can open each one. Give each file a row, or each group of files with the same change. Each row holds the file as a markdown link and a one-line description of its change.

## Notes
Before you change a note in `notes/`, invoke the `editing-notes` skill. These rules hold for every session:
- **The user's lines:** a line where their name is a tag or a signature (`[Sarah] I want X instead.`, `Change this to Y - Sarah`) is their own words. Never edit one or write in their voice.
- **Roadmap order** is the user's call, so never reorder `notes/Roadmap.md`.
- **⚠️ Check Drift callouts:** only `/check-drift` writes them, unless the user tells another session to.
- **Embedded sections** (`![[Note#Section]]`) are part of the note. A raw file shows only the link, so open each one and read it as part of the note.
- **Links to a heading or block** (`[[#^piece-7]]`, `[[Note#Section]]`) point to content the line depends on, so read the target when that line matters to your work.
- **Before you finish** a session that changed a note, run `sh scripts/vault-lint.sh`. Fix what it reports in the notes this session changed. Tell the user about anything it reports in other notes, because another session may be working on them.

## Out-of-scope work
Keep a running list of anything that looks outside the story or step you're working on, whether you, a subagent or the user found it. Also list any case that would add a piece or a question to a story past `/shape`. If the user gives feedback on how a skill, subagent or the workflow behaves, and this session isn't working on that same skill or subagent, it goes on the list, even when it's also saved as a memory. Don't stop to deal with items as they come up, because they'd pull the session away from its work.

Before you show the user the result they approve, triage the list, as the `triaging-out-of-scope-work` skill describes. Route it at the end. Each skill names the points where these happen.

## Subagent reports and scratch files
Save each subagent's report, unedited, in `.scratch/`. When you show the user its findings, put them in the chat and link the report. Scratch files are your working files, so anything else the user needs to read goes in the chat too. Each commit deletes the files in `.scratch/` that haven't been written to for a day, so anything a later session needs goes in the note you're working on. A note never links to a scratch file.

## Docs
Read the docs a task touches when it needs them, not all up front:
- `docs/project_conventions.md` and `project_structure.md`: before planning or writing code
- `docs/style_guidelines.md` and `theme.md`: before UI work
- `docs/unit_tests.md`: before writing tests or mocks
- `docs/e2e_tests.md`: before writing E2E tests
- `docs/ci.md`: before changing a workflow or a routine
- `docs/seed.md`: before changing `seed/` or adding a model
- the `writing-standard` skill: before planning, drafting or making a change to a file in `docs/`, `README.md`, AGENTS.md, a skill or an agent

Before you show a draft for a file `writing-standard` covers, or your summary names a change you've written to one, check whether it needs a review:
- **If its exact form was settled, or it's mechanical,** as "Approval covers the edits" describes: skip the review.
- **Otherwise, including each draft you revise after feedback:** have the `writing-reviewer` subagent review it, as the `reviewing-a-draft` skill describes. A writer anchors on its own draft and misses where it breaks the standard.

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
- `pnpm test:agent <path>`: runs the tests for a file or folder, with coverage and output made for agents. Use it instead of calling `vitest` directly.
- `pnpm test:e2e`: builds the app and runs the Playwright E2E tests against a throwaway database. Pass a spec file or folder to run only those. `pnpm test:e2e:trace` does the same with a trace for every test, then opens the report. See `docs/e2e_tests.md`.
- `pnpm build`: Next.js production build.

## Git and files
- **Commits:** commit only this session's files, by path, since other sessions' changes may be staged too. Whether the user has to ask first depends on the branch:
  - **If it will be merged:** commit only when they ask.
  - **If it's a throwaway that will never be merged:** commit and push freely, since nothing on it reaches the app.
- **Changes you didn't make:** the user often runs several sessions at once, and makes quick edits to notes by hand that they then forget. What you do depends on when you find a change like this:
  - **When you commit:** if the working tree has a change that isn't yours and doesn't look like another session's work, ask about it.
  - **When you need to edit a note with uncommitted changes you didn't make:** another session is probably working on it, so leave it and tell the user what it would have needed.
- If a file you're about to delete has uncommitted changes or isn't tracked, ask the user first, because git can't bring it back.
- **Project config** (`biome.jsonc`, `vitest.config.*`, `tsconfig*.json`, `lefthook.yml`): edit it only when the user asks for that config change, because it sets the checks for the whole repo, and a change made to get past one error loosens them everywhere.
- **Ignore comments** (a comment that switches off a lint, type or coverage check): add one only when the user tells you to ignore that error, and only on that one line, because it hides the error rather than fixing it.
- **Memory:** a project rule lives in a checked-in file, because memory exists only on the user's machine and other agents never see it. Memory holds how to work with the user and how outside services behave, which docs don't cover. Once a rule is checked in, delete the memory that carried it.
