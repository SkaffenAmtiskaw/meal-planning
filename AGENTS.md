# Agent Instructions

## Project
A full-stack meal planning web app. Work is planned and tracked as notes in the Obsidian vault in `notes/`.

## Following Instructions
The user wants instructions followed for what they're for, not to the letter. If a case matches a line's words but not its point, or following it would make no sense, work out what the line is for and do that. Bring it to the user only if the case still conflicts with that purpose, because a question about a case the line was never meant for gives them nothing to decide. Before you pass on a subagent's finding that cites a line, judge it the same way.

## Working with the User
- **When to ask.** Whether you ask depends on what a choice affects:
  - **What the app does or shows, what tooling, CI or a routine does for the user, or architecture:** if there are two reasonable options and nothing written picks one, ask.
  - **Only a low-level detail,** such as a file's location or a command's flags: make the call and name it in your summary, because the user doesn't want to decide these.
- **Questions.** Put what a question is about inside it, because the user may see only the question. Use AskUserQuestion only for a short choice whose full context fits in the dialog, because it hides the chat text before it and the user doesn't see its option previews.
- **Buttons.** Make every button in the next-step box a reply button, meaning a `wrap_up` button with no `action` field. For a commit, that's one labelled "Commit" rather than the commit action. A reply button sends its label, so the user knows what they're sending. An app-action button sends the app's own text, which can say more than the label.
- **Recommendations.** If the user asks for one, give one. Otherwise, give one when best practice supports it, and name the practice. When a choice comes down to their preference, say so.
- **Approval.** What happens to a change depends on whether the user has settled it, and on its length:
  - **If they've settled its exact form, or it's mechanical:** make it and name it in your summary, even where a skill has an approval step, because approving what they've decided costs a review and adds nothing. A change is mechanical when it follows from one already made and leaves the meaning unchanged.
  - **If it's short:** show them the code or wording they haven't seen, and end that message by asking in plain text whether they approve.
  - **If it's long:** do the same with a summary and a table of the changes, and show the text only for the parts they ask to see, because they miss things in a long draft.
- **When the user changes an earlier choice.** They've already decided, so update the note that holds it, without asking about the earlier one or warning them.
- **When you have a reason to change an earlier choice.** Their choices, including the conventions, designs and plans they approve, stand until the simplest way to do the work conflicts with one, or new information makes one look less sensible, such as a tool they didn't know about. When either happens, deal with it as soon as you see it, rather than working around the choice.

  A low-level detail isn't the user's call, even one marked as theirs. Any other choice is their call if "When to ask" says to ask about it, or if they've shown it matters, such as by giving a reason of their own or writing it themselves. A story's scope, meaning the work its note takes on or leaves out, is their call too. What you do depends on whose call it is:
  - **If it's the user's call:** stop and ask. Say what the change solves, what it costs and which decision, rule or line it would replace.
  - **Otherwise:** change the choice where it's written and name the change in your summary.
- **What only the user can do.** If work needs setup outside the repo or a check only they can do, walk them through it at the point it's needed, one step at a time, and wait for them before the next. For a check, say what they should see and what it proves. A list of setup at the end of a summary reads as reference, not as a prompt to act.
- **A problem's size.** If the user says a problem is large or keeps coming back, work from that size rather than arguing it down, because agents have kept offering narrow fixes while the user had to insist on a large-scale change. If it's outside the session's work, record their account of its size in its out-of-scope item. Otherwise, work out where it comes from and propose the fix that would end it, even if that means replacing what's there.
- **Security risks.** If a risk you or a subagent found could reach production, or the story is about that risk, raise it. Otherwise, leave it out, along with any hardening against it. Dev tooling that runs on the user's machine against their dev database is the usual case, because at worst it reaches dev data.
- **Doc gaps.** If you notice something that belongs in `docs/`, deal with it right then, rather than putting it on the out-of-scope list, because docs that wait for later rarely get updated. What you do depends on the gap:
  - **A wrong or out-of-date rule with one right fix, in a doc this story already edits:** it's a Boy Scout fix, as the `triaging-out-of-scope-work` skill describes, so don't ask.
  - **Anything else:** raise it and offer to draft it now. If the user wants it later, add it to the Docs Updates note.
- **Summaries.** If you changed files and your skill's report doesn't list them, your summary includes a table, so the user can open each file. Give each file a row, or each group of files with the same change. A row holds the file as a markdown link and a one-line description of its change.

## Notes
Before you change a note in `notes/`, invoke the `editing-notes` skill. These rules hold for every session:
- **Embedded sections** (`![[Note#Section]]`) are part of the note. A raw file shows only the link, so open each one.
- **Links to a heading or block** (`[[#^piece-7]]`, `[[Note#Section]]`) point to content the line depends on, so read the target when that line matters to your work.
- **The user's lines:** a line where their name is a tag or a signature (`[Sarah] I want X instead.`, `Change this to Y - Sarah`) is their own words. Never edit one or write in their voice.
- **Roadmap order** is the user's call, so never reorder `notes/Roadmap.md`.
- **⚠️ Check Drift callouts:** only `/check-drift` writes them.
- **Before you finish** a session that changed a note, run `sh scripts/vault-lint.sh`. Fix what it reports in the notes this session changed. Tell the user about anything it reports in other notes, because another session may be working on them.

## Out-of-Scope Work
Keep a running list of anything that looks outside the story or step you're working on, whether you, a subagent or the user found it. Also list anything that would add a piece or a question to a story that's already been through `/shape`. If the user gives feedback on how a skill, subagent or the workflow behaves, and this session isn't working on that same skill or subagent, put the feedback on the list too, even when it's also saved as a memory. Don't stop to deal with items as they come up, because they'd pull the session away from its work.

Before you show the user the result they approve, triage the list, as the `triaging-out-of-scope-work` skill describes. Then route what's left, as that skill describes.

## Subagent Reports and Scratch Files
Save each subagent's report, unedited, in `.scratch/`. When you show the user its findings, put them in the chat and link the report. Scratch files are your working files, so anything else the user needs to read goes in the chat too. Each commit deletes the files in `.scratch/` that haven't been written to for a day, so anything a later session needs goes in the note you're working on. A note never links to a scratch file.

## Docs
Read a doc in `docs/` when the task needs it, not all of them up front. Each is named for what it covers. These have triggers their names don't show:
- `project_conventions.md` and `project_structure.md`: before planning or writing any code
- `style_guidelines.md` and `theme.md`: before UI work
- `ci.md`: also before changing a routine
- `seed.md`: also before adding a model

Before you plan, draft or change a file in `docs/`, `README.md`, AGENTS.md, a skill or an agent, read the `writing-standard` skill.

## Library APIs
The libraries here are newer than your training data, so never use an API from memory. Every API you use needs a source, depending on the case:
- **If this codebase already uses it:** use it the same way.
- **If it's a Mantine component you're using for the first time or for a new purpose:** read its page, found through https://mantine.dev/llms.txt, because the types don't show how it's meant to be used.
- **Otherwise:** the docs or type definitions for the installed version. Next.js's docs are in `node_modules/next/dist/docs/`, and better-auth's start at https://better-auth.com/llms.txt.

## Commands
The commands that need explaining:
- `pnpm test:agent <path>` runs the tests for a file or folder, with coverage and output made for agents. Use it instead of calling `vitest` directly.
- `pnpm lint` writes fixes to the files. `pnpm lint:ci` only reports, as CI does.

## Git and Files
- **Commits:** commit only this session's files, by path, since other sessions' changes may be staged too. Whether the user has to ask first depends on the branch:
  - **If it will be merged:** commit only when they ask.
  - **If it's a throwaway that will never be merged:** commit and push freely, since nothing on it reaches the app.
- **Changes you didn't make:** the user often runs several sessions at once and edits notes by hand. What you do depends on when you find one:
  - **When you commit:** if it doesn't look like another session's work, ask about it.
  - **When you need to edit a note that has one:** don't edit the note. Tell the user what edit it needed.
  - **When you're about to delete a file that has one, or an untracked file that isn't yours:** ask first, because git can't bring it back.
- **Checks:** if the user hasn't asked you to, don't edit the config that sets the repo's checks, such as `biome.jsonc` or `lefthook.yml`, or add a comment that switches off a check. Getting past one error that way loosens the check or hides the error. If they ask for an ignore comment, put it on that one line only.
- **Memory:** a project rule lives in a checked-in file, because memory exists only on the user's machine and other agents never see it. Memory holds how to work with the user and how outside services behave. Once a rule is checked in, delete the memory that carried it.
