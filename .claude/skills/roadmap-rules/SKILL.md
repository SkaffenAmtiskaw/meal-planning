---
name: roadmap-rules
description: How the Roadmap is laid out, how goals order its work and what its markers mean. Use when deciding whether a story can be built yet, or what a Roadmap section or marker means.
user-invocable: false
---

# How the Roadmap Works
How goals order the work, what each section and kind of note holds, and the rules for lines:
- **Goals** - ranked epics, each a note in `goals/` in the notes repo, shaped and ranked with `/roadmap`. Only the user changes the order. Only one goal is built at a time, so `develop` never holds another goal's unfinished work and a finished goal releases all at once:
	- **The building goal** is the top one, marked `- building`. Once its last line and the last 🔁 line have closed, its release shows after that marker: ` · Next: /finish-goal`, then ` · releasing` once `/finish-goal` starts its audits, then ` · releasing · Next: /ship-goal` once the audits and their fixes have closed. What may be built (`/implement`, `/infra-build`, `/tooling`) depends on whether a release is under way:
		- **If its line under Goals includes ` · releasing`:** only the stories the goal note's `# Release` section links, which are its audits and their fixes. Holding everything else back keeps unaudited work out of the release.
		- **If a PR from `develop` into `main` is open:** nothing, until it merges, since `/ship-goal` has already closed out the release's goal.
		- **Otherwise:** a line under the Bugs heading waits until a release picks it up. Any other story or collecting-note item is built only when it serves the building goal, serves no ranked goal, has 📌 on its line, or has 🚨 on a line in Now or Next.
	- **The planning goal** is the second, marked `- planning`. Its stories can be shaped, decided, designed and planned down to steps, but they aren't built until the building goal is released. Collecting notes aren't kicked off for it.
	- **The rest** organize the backlog. Their lines sit under their headings in Later, and their stories can be shaped and decided ahead of their turn.
- **Standing Goals** - listed under their own subheading below the ranked goals, because they're never ranked, building or planning. A goal drawn from one is ranked like any other.
- **What joins every release** - sweeps, collecting workflow notes and bugs rarely fit a goal, so if they waited for one they might wait forever. So when any goal starts building, `/roadmap` kicks off every sweep and collecting workflow note and moves every bug line into Next. A sweep item blocked by a story in this release, meaning its line is in Now or Next, joins the release, and the sweep waits for the story through `blocked-by`. Other blocked work waits for the next release. The goal ships once this work is done too.
- **Now** - in progress.
- **Next** - the building goal's queue, in order. The first line not waiting on anything is the next one to plan or build. A line that's waiting keeps its place, and its status embed says what it waits on. A line that serves both the building and planning goals goes here.
- **Planning** - the planning goal's queue, in order. The first line not waiting on anything is the next one to plan. When the planning goal starts building, its lines move into Next in the same order.
- **Later** - committed, not ordered. One heading per goal, in rank order, then one per standing goal, then **Bugs**, then **Unaffiliated** for other lines that serve no goal and for every collecting note's line. A line that serves more than one goal sits under one of their headings and ends with a `🎯 [[Goal]]` link for each other goal. A re-rank doesn't move it to another heading, because the 🎯 links, not the heading, say which goals it serves. Dev tooling and agent work sits under Dev Tooling's heading unless the user puts it under a ranked goal.
- **Bugs** - the heading in Later where bugs in the shipped app, security issues included, wait for the next release. They belong to no goal, because they're just work that needs doing, and the next goal to start building picks them up. Until then, a bug can be shaped, investigated and planned down to steps, so it's ready when its release starts, but it isn't built. An urgent bug gets 🚨 and moves into Next. A bug in a story still being built belongs to that story, and one in dev tooling or CI belongs to Dev Tooling. Code that works but needs changing belongs to App Health.
- **Ideas** - not committed. A story's line moves to Later once it's committed.
- **Status embeds** - each line with a note, except a goal's or standing goal's, embeds that note's status line from Where It Stands after the link, e.g. `[[Stale Data Issues]] ![[Stale Data Issues#^status]]`. It shows only what the story needs next, the next skill or a link to what blocks it, not what the story is. Edit it in the note, not on the Roadmap.
- **Markers** - every Now and Next line ends, after its status embed, with a marker: a 🎯 link for each goal it serves, one of them the building goal, or 🚨, 📌 or 🔁. Every Planning line ends with a 🎯 link for each goal it serves, one of them the planning goal:
	- `🎯 [[Goal]]` - serves that goal.
	- `🚨 <reason>` - something serious enough to show on the line, such as a security risk or a bug a user reported. In Now or Next, the story is built ahead of the goals. Anywhere else, it only flags the problem, and the story waits its turn. Only the user adds it, apart from the `dependency-updates` routine's security lines. Other agents may suggest it.
	- `📌 <reason>` - the user scheduled it outside the goals. Only the user adds it.
	- `🔁` - joined this release without belonging to a goal: a bug, or a kicked-off sweep or collecting workflow note. `/roadmap` adds it when the line moves into Next.

	A Now, Next or Planning line without its marker is out of place. Raise it with the user.
- **Hubs** hold shared design, not priority. A hub has a line only while it has a next step of its own, such as `/brainstorm`, `/decide` or `/close`. Once its `^status` line says `Next: its child stories`, it has none.
- **Archived notes** have no line while an open story still relies on them. Once none does, an archived note gets a line until `/close` deletes it.
- **Collecting notes** gather items until they're handled together: sweeps (`type: sweep`) for small, decided fixes that share a group, such as Unit Test Tidy-Ups, and collecting workflow notes for tooling and agent changes, such as Agent Workflow Changes. If several related items have their own lines on the Roadmap and no collecting note covers them, tell the user they could become a new collecting note. Leave creating it to them, because every collecting note joins every release.
	- **The note's line** carries no 🎯 links, because a collecting note keeps getting new items, so it never finishes. A kickoff freezes some of its items into a dated copy, `<note> YYYY-MM-DD`, which can finish, and the note keeps collecting.
	- **A collecting note's items** have no goal links, because they join whichever release comes next.
