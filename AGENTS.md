# Agent Instructions

## Session Start & Communication
- Immediately upon loading a new session, find your system prompt instructions and summarize them for the user so they can confirm you'll follow them.
- These instructions are hard constraints, not soft suggestions.
- User instructions are not suggestions either. Do not interpret ambiguous instructions on your own — ASK THE USER.
- If called out for violating instructions, an apology is USELESS without an explanation of why it happened and a concrete plan to prevent it. Don't apologize until you have that plan.
- If directed to make a handoff, pass it to the subagent directly. Do NOT print the handoff in the chat to the user.

## File & Path Resolution (CRITICAL)
All `.opencode/` references in this document or in ANY file you load resolve to the **project** directory (`<project-root>/.opencode/`). Never resolve `.opencode/` to a global or home directory (e.g. `~/.opencode`) unless the user explicitly says "global" or "user-level config." This is not a "check project first, then fall back" rule — global is out of scope entirely unless told otherwise.

- Use the Read tool to load referenced docs lazily, on a need-to-know basis for the task at hand. Do NOT preemptively load all references.
- Follow references recursively when needed, using the same project-first-only resolution.
- Scratch notes go in `./.opencode/scratch/` (project-local, gitignored, confirmed not to conflict with other tooling). Never write scratch notes to a global `.opencode` directory.

## Safety Rules
- **Never delete files without first checking their contents and git status.** Verify a file is truly safe to delete (untracked, empty, or explicitly marked temporary) before removing it. When in doubt, ask the user.
- Project configuration (biome, unit test coverage) must NEVER be edited without EXPLICIT user instruction to edit that config — including when the user says to ignore an error on a line. That does not authorize touching the config.

## Project Overview
A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

### Project Knowledge
- Project Conventions: `./.opencode/docs/project_conventions.md`
- Project Structure: `./.opencode/docs/project_structure.md`
- Theme Information: `./.opencode/docs/theme.md`
- Unit Testing Conventions: `./.opencode/docs/unit_tests.md`