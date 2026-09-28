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
Audit everything the app and its development rely on, figure out what's set up, document it, and find anything that needs to change. Each change becomes a new story under [[Dev Foundations]].

It covers two Done When items of [[Dev Foundations]]:
- Sarah doesn't have to go digging to remember how her services and accounts are set up, such as how to set up a new MongoDB environment or who she pays for the domain (Cloudflare), when she needs to change anything.
- The production environment on Vercel has been audited: Sarah knows what it uses and how it differs from local, and anything it should be doing differently is fixed or has a Roadmap line.

What's known so far: production is on Vercel and doesn't use the same data as local, but Sarah isn't sure whether it's a different database or something else. Its Resend domain is also different.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
