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
Set up a known, tested way to back up and restore the production database. It's a Done When item of [[Dev Foundations]]. It's standard practice before shipping releases regularly, since a bad migration or deploy can't be undone without it.

[[Services and Environments Audit]] will find out what production actually uses. Right now Sarah isn't sure whether it's a different database from local.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
