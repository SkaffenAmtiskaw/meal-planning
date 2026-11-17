# Which User to Sign In As
A check or repro step that needs a signed-in user says who it signs in as:
- **If it changes the signed-in user's email:** a new user it signs up through the app. `pnpm seed` finds seeded users by their email, so it would leave a seeded user with a changed email behind.
- **If a check needs a user the seed doesn't have, such as one with no planners:** a story user, named by a short label you choose, such as `no-planners`, and described by what they have. The implementer creates them in the story's data file, so they're loaded before the check starts (see "Story Data" in `docs/seed.md`).
- **Otherwise:** a seeded user, named by key, which is their access level: `owner`, `admin`, `write` or `read`.
