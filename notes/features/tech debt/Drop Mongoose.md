---
type: 
status: idea
confirmed: 2026-09-29
---
# Where It Stands

Next: /shape ^status

# Notes
From the Roadmap line: "could we get rid of mongoose and use zod + mongodb on its own? what does mongoose get us?" *(was medium)*

> [!warning] Impact on the E2E test setup (`docs/e2e_tests.md` "Writing a Factory", "Users" and "Fixtures Hold Connections, Not Data", and the factories in `test/factories/`)
> The E2E data factories write through the Mongoose models in `@/_models` and open their connection with Mongoose in `test/factories/connection.ts`. They rely on Mongoose for schema defaults (such as `name: 'New User'` on `User`) and the unique index on `User.email`. Sarah asked for this callout 2026-09-29. If this story replaces Mongoose, what must not break:
> - The factories still create users, planners and other documents outside Next (in the Playwright process, and later a dev seed script), without importing `@/_actions`, `@/_auth` or anything `server-only`.
> - The user factory still creates the better-auth user and the app `User` doc together, with the same lowercase email.
> - Fixtures in `e2e/_fixtures/` can still open and close each worker's database connection through `test/factories/connection.ts`.
> - `docs/e2e_tests.md` still describes the code.

# Questions
