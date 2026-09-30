# The `ci-failure` Routine
The routine's configuration on claude.ai (https://claude.ai/code/routines). When the routine changes there, change this file in the same change. `SKILL.md` doesn't point here, so the routine's session never reads it.

- **Name:** `ci-failure`
- **Prompt:** `Run /ci-failure on the failed run described in the routine-fire-payload block.`
- **Model:** Sonnet
- **Repositories:** `meal-planning`
- **Trigger:** API. Its caller and the Actions secrets holding its URL and token aren't set up yet.
- **Cloud environment:** `Meal Planning Routines` (see `docs/ci.md`, "The Cloud Environment"). The session uses its variables: the dummy values for the `src/env.ts` variables, and `CLAUDE_ENV_FILE`, which puts mise's Node and pnpm on `PATH`. It uses no other variable or credential.
- **Connectors:** none
