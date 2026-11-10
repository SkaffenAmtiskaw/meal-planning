# The `production-errors` Routine
The routine's configuration on claude.ai (https://claude.ai/code/routines).
- **Name:** `production-errors`
- **Prompt:** `Run /production-errors on the PostHog issue described in the routine-fire-payload block.`
- **Model:** Sonnet
- **Repositories:** `meal-planning` and `meal-planning-notes`
- **Trigger:** API, called by the `start-production-errors` job in `.github/workflows/production-errors.yml`. Its URL is in the Actions secret `ROUTINE_PRODUCTION_ERRORS_URL` and its token in `ROUTINE_PRODUCTION_ERRORS_TOKEN`.
- **Cloud environment:** `Meal Planning Routines` (see `docs/ci.md`, "The Cloud Environment"). The session uses its variables: the dummy values for the `src/env.ts` variables, and `CLAUDE_ENV_FILE`, which puts mise's Node and pnpm on `PATH`. It uses no other variable or credential, PostHog's included: the workflow holds the read key and sends the issue in the `/fire` text.
- **Connectors:** none
