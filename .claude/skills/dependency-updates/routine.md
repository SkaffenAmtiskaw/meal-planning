# The `dependency-updates` Routine
The routine's configuration on claude.ai (https://claude.ai/code/routines).
- **Name:** `dependency-updates`
- **Prompt:** `Run /dependency-updates on the findings described in the routine-fire-payload block.`
- **Model:** Sonnet
- **Repositories:** `meal-planning`
- **Trigger:** API, called by the `start-dependency-updates` job in `.github/workflows/dependency-updates.yml`. Its URL is in the Actions secret `ROUTINE_DEPENDENCY_UPDATES_URL` and its token in `ROUTINE_DEPENDENCY_UPDATES_TOKEN`.
- **Cloud environment:** `Meal Planning Routines` (see `docs/ci.md`, "The Cloud Environment"). The session uses its variables: the dummy values for the `src/env.ts` variables, and `CLAUDE_ENV_FILE`, which puts mise's Node and pnpm on `PATH`. It uses no other variable or credential.
- **Connectors:** none
