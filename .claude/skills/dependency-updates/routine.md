# The `dependency-updates` Routine
The routine's configuration on claude.ai (https://claude.ai/code/routines). When the routine changes there, change this file in the same change. `SKILL.md` doesn't point here, so the routine's session never reads it.

- **Name:** `dependency-updates`
- **Prompt:** `Run /dependency-updates on the findings described in the routine-fire-payload block.`
- **Model:** Sonnet
- **Repositories:** `meal-planning`
- **Trigger:** API. Nothing calls it yet: until a workflow does, it's called by hand with `curl`, as the trigger's sample command shows.
- **Cloud environment:** `Meal Planning Routines` (see `docs/ci.md`, "The Cloud Environment"). The session uses its variables: the dummy values for the `src/env.ts` variables, and `CLAUDE_ENV_FILE`, which puts mise's Node and pnpm on `PATH`. It uses no other variable or credential.
- **Connectors:** none
