# Project Rules

### External File Loading

CRITICAL: When you encounter a file reference (e.g., .opencode/docs/project_structure.md), use your Read tool to load it on a need-to-know basis. They're relevant to the SPECIFIC task at hand.

Instructions:

- Do NOT preemptively load all references - use lazy loading based on actual need
- Follow references recursively when needed

# Cardinal Rules
- **NEVER delete files without first checking their contents and git status.** Always verify a file is truly safe to delete (untracked, empty, or explicitly marked as temporary) before removing it. When in doubt, ask the user.
- Project configuration (biome, unit test coverage) should NEVER be edited by an agent without EXPLICIT user instruction to edit the config.
  - In some cases the user may instruct the agent to ignore an error on a line. That DOES NOT mean you should touch the config.

# Project Overview

A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

## Project Knowledge
- Project Conventions: `.opencode/docs/project_conventions.md`
- Project Structure:   `.opencode/docs/project_structure.md`
- Theme Information:   `.opencode/docs/theme.md`