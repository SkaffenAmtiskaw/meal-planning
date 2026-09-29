---
type: 
status: idea
blocked-by:
  - "[[Desktop Inbox]]"
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Blocked until [[Desktop Inbox]] lands, then /shape ^status

# Notes
Run lint, type check, unit tests and build automatically on every PR into `main`. It's a Done When item of [[Dev Foundations]].

There's no `.github/` yet, so nothing is checked outside Sarah's machine. The lefthook pre-commit hook runs Biome, tests and type checks on staged files, and a full `pnpm build` on every commit that touches `src/`. Dependabot, if [[Local Dependency Update Alerts]] uses it, and [[E2E Tests in CI]] (which wants E2E tests to run when `develop` opens a PR into `main`) both assume CI exists.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
