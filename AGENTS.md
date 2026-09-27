# Agent Instructions

## Project
A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

Work is planned and tracked as notes in the Obsidian vault in `notes/`.

## Working with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on.
- **Self-contained questions.** Put what a question is about inside it: the note, the file, the step. She may see only the question, not the text before it.
- **Open choices are hers.** When an instruction or plan leaves a real choice open (two reasonable readings, and nothing written picks one), ask instead of choosing.
- **Recommendations:** give one when best practice supports it, and name the practice. When a choice comes down to her preference, say so and don't guess. If she asks for a recommendation, always give one.
- **Doc gaps:** the moment you notice something that belongs in `.opencode/docs/` (a convention the docs don't cover, or a rule that's wrong or out of date), stop and ask her whether it should become doc. If it should, draft the change, show it to her and write it once she approves. Don't save it for a report or a later pass. If she wants it done later, it goes in `notes/features/tooling/Docs Updates.md`.

## Editing notes
Any change to a note in `notes/` follows these rules:
- **Sarah's comments:** a line where her name is a tag or a signature (`[Sarah] I want X instead.`, `Change this to Y - Sarah`) is her own words. Never edit it, and never write in her voice or sign as her. Record her decisions in the third person ("Sarah decided 2026-09-25 that ...").
- **Plans aren't rewritten.** When the build differs from a step, add an **As built:** note under the step. When a note no longer matches the code, add a `> ⚠️ **Check Drift YYYY-MM-DD:** ...` callout directly above the text it's about. Never edit the plan text itself.
- **The `^status` line** (the line ending in ` ^status` under Where It Stands) says what work the story needs next or what it's waiting on, and nothing else. Never describe the story there. The Roadmap embeds it so Sarah can scan what each story needs.
  - Whoever moves a story forward updates it. When the next step is settled, write it without asking and mention it in your summary. When there's a real choice, such as what the story is blocked on, show Sarah the line and wait for her approval.
  - Every note starts with Where It Stands, right after the frontmatter, in its template's format. If a note has none, add it.
  - The story's line in `notes/Roadmap.md` embeds it after the link: `[[Note]] ![[Note#^status]]`. Add the embed if it's missing.
- **Roadmap order is Sarah's call.** Never reorder `notes/Roadmap.md`. Ask her where a new line goes.
- **A `ready` note goes back to `spec`** when its design or steps change, until Sarah re-reviews it.
- **Embedded sections** (`![[Note#Section]]`) are part of the note. A raw file shows only the link, so open each one and read it as part of the note.
- **Anything bigger, outside a skill:** a skill carries what it needs for the notes it changes. Without one, read `notes/Note Conventions.md` before creating, retyping, moving, closing or deleting a note, or changing its `status`.

## Out-of-scope work
Keep a running list of anything that belongs outside the story or step you're working on, whether you, a subagent or Sarah found it. Don't stop to deal with items as they come up. At the end:
1. Send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found (`file:line`, or the note and section) and why it's outside this work. The router suggests a home for each item. It doesn't change anything.
2. Go through its suggestions with Sarah **one item at a time**: show the item and the suggested home with its reason, wait for her to approve, change or drop it, apply that one change to the notes, then move to the next.

## Subagent reports and scratch files
Save each subagent's report, unedited, to `.scratch/<note name> - <what it is>.md`, and link it when you show Sarah its findings. `.scratch/` is gitignored and wiped on every commit, so it only holds working files for one session. Anything a later session needs goes in the note itself, and a note never links to a scratch file.

## Docs
Read the docs a task touches when it needs them, not all up front:
- `.opencode/docs/project_conventions.md` and `project_structure.md`: before planning or writing code
- `.opencode/docs/style_guidelines.md` and `theme.md`: before UI work
- `.opencode/docs/unit_tests.md`: before writing tests or mocks
- `.opencode/docs/running_the_app.md`: before starting the app or checking something in the browser

## Library APIs
The libraries in this project are newer than your training data. Never use an API from memory. Every API you use needs a source:
- **The same API already used in this codebase,** the same way.
- **Next.js:** the version-matched docs in `node_modules/next/dist/docs/`.
- **Mantine:** the first time you use a component, or use one for a new purpose, read its mantine.dev page, found through https://mantine.dev/llms.txt. Its docs show how Mantine intends the component to be used, which the types don't. To look up a prop on a component already used the documented way, the type definitions in `node_modules/@mantine/*/lib/` are enough.
- **better-auth:** https://better-auth.com/llms.txt, then the page for the API you need.
- **Anything else:** the installed package's docs for that version, or its type definitions.

Look up only what the task uses: one component, one function, one page.

## Commands
- `pnpm lint`: Biome. It **writes fixes** to the files, not just reports.
- `pnpm check:types`: TypeScript, no emit.
- `pnpm test:agent <path>`: runs the tests for a file or folder, with coverage and output made for agents. Use it instead of calling `vitest` directly. The one exception is a break-it check, which runs `pnpm vitest run <test file>` as the check says.
- `pnpm build`: Next.js production build.

## Git and files
- Don't commit unless Sarah asks. Stage files by path, never with `git add -A` or `git add .`.
- Before deleting a file, check its contents and `git status`. If it has uncommitted changes or isn't tracked, git can't bring it back, so ask Sarah first.
- Never edit project config (`biome.jsonc`, `vitest.config.*`, `tsconfig*.json`, `lefthook.yml`) or add a comment that switches off a lint, type or coverage check, unless Sarah explicitly asks for that change. Telling you to ignore an error on a line doesn't count.
