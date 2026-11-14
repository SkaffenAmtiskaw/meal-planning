# Which User to Sign In As
A check or repro step that needs a signed-in user says who it signs in as:
- **If it changes the signed-in user's email:** a new user it signs up through the app. `pnpm seed` finds seeded users by their email, so it would leave a seeded user with a changed email behind.
- **Otherwise:** a seeded user, named by key, which is their access level: `owner`, `admin`, `write` or `read`.
