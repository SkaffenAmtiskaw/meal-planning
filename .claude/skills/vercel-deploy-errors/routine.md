# The `vercel-deploy-errors` Routine
The routine's configuration on claude.ai (https://claude.ai/code/routines).
- **Name:** `vercel-deploy-errors`
- **Prompt:** `Run /vercel-deploy-errors on the failed deployment described in the routine-fire-payload block.`
- **Model:** Sonnet
- **Repositories:** `meal-planning`
- **Trigger:** API, called by the `start-vercel-deploy-errors` job in `.github/workflows/vercel-deploy-errors.yml`. Its URL is in the Actions secret `ROUTINE_VERCEL_DEPLOY_ERRORS_URL` and its token in `ROUTINE_VERCEL_DEPLOY_ERRORS_TOKEN`.
- **Cloud environment:** `Meal Planning Routines` (see `docs/ci.md`, "The Cloud Environment"). The session uses its variables: the dummy values for the `src/env.ts` variables, and `CLAUDE_ENV_FILE`, which puts mise's Node and pnpm on `PATH`. It uses no other variable or credential, and no Vercel credential: the workflow holds the Vercel token and sends the build log in the text.
- **Connectors:** none
