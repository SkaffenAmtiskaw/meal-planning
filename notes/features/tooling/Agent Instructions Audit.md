---
type: 
status: idea
confirmed: 2026-10-06
---
# Where It Stands
Next: /shape. Building waits on [[What Makes a Good Doc]] ^status

# Notes
Check every agent instruction (AGENTS.md, skills and agents) against the standard [[What Makes a Good Doc]] sets, and slim it down to what the agent needs. Sarah, 2026-10-06: "I mostly expect this to be just like Docs Audit but for agent files. It audits them all and makes sure they conform to the standard set forth in What Makes a Good Doc."

[Sarah] Agents are starting to disregard their instructions, doing things like saving notes in `.scratch`. This is almost certainly a context problem - they have too many instructions. We need to go through the agent instructions and look for sections which can be slimmed down and still retain the information the agent needs. I also wonder if we need to evaluate whether certain skills are trying to do too much, and should be separated into separate skills that share rules between them.

**A pass over `/infra-design` for repetitive or unnecessary work** - Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead. That makes `/infra-design` sessions longer, so go through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including its Build Order step, and cut any work that repeats itself or isn't needed.

It's a story rather than a `/tooling` change because it's too big for one session: it reads every skill, every agent and AGENTS.md against the standard.

# Questions
