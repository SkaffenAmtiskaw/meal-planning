# Project Rules

### External File Loading

CRITICAL: When you encounter a file reference (e.g., .opencode/docs/project_structure.md), use your Read tool to load it on a need-to-know basis. They're relevant to the SPECIFIC task at hand.

Instructions:

- Do NOT preemptively load all references - use lazy loading based on actual need
- Follow references recursively when needed

# Cardinal Rules
- Project configuration (biome, unit test coverage) should NEVER be edited by an agent without EXPLICIT user instruction to edit the config.
  - In some cases the user may instruct the agent to ignore an error on a line. That DOES NOT mean you should touch the config.

# Project Overview

A full-stack meal planning web app. Users sign in, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

## Project Knowledge
- Project Structure: `.opencode/docs/project_structure.md`
- Theme Information: `.opencode/docs/theme.md`