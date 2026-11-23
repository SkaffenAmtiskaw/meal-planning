# Checking a Piece
How to check an infra Design's Piece before the user approves it.

Check each service, config key and Claude Code feature the Piece uses against its current docs, because what a service offers changes. Check the Piece against the project docs, the other notes' Conventions and Rules, and the config it relies on, such as the repos a routine selects in its `routine.md`.

Also check each service's docs for tooling of its own, such as an MCP server, a CLI, a setup wizard or a marketplace integration. Look for tooling that would do the Piece's work, or take over an item the user would otherwise set up by hand under Setup Outside the Repo. Use it. If you don't, say why in the Piece it would replace, or in the Setup Outside the Repo item. A service's own tooling leaves less for the project to build and maintain, and the user wants as little setup by hand as possible.
