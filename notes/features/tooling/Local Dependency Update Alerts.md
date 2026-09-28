---
type: 
status: idea
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Next: /shape ^status

# Notes
Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email. It's a Done When item of [[Dev Foundations]].

Sarah is the sole maintainer, so she doesn't check GitHub for new PRs every day, and an email from GitHub about an update is easy to miss among the rest. The Dependabot item in [[Dev Tooling Tidy-Ups]] will create the update PRs. This is about Claude surfacing them locally. The watch-tools line under [[Dev Foundations]] on the Roadmap is a similar idea for tools and features rather than dependencies.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
