**Initial Thoughts**
[Sarah] _Note_: The bullet points below are all written by me (and no agent should add a bullet point to the list because that will imply I wrote it). However, despite any possible agent instructions to not delete my notes, you have explicit permission to delete these bullet points ONCE they have been tackled. (Ask me to confirm a bullet point has been addressed to my satisfaction, then remove it.)
- This will almost certainly create multiple stories. While some of them will be workflow story, any story that winds up writing tests is NOT a workflow story. I consider e2e tests to be part of the codebase, just like unit tests are.
- I want e2e tests to run automatically, but I don't want them to run locally every time I commit because they take goddamn forever. So this probably means it's time for GHA. The most obvious (to me) place to run them is when develop opens a PR into main.
- If e2e tests are running in CI, we might need a new environment. We need to figure out moving pieces for that. (note: it'd be super nice if this work created a document about creating a new environment I could refer back to later!)
- the auth workflows will need e2e tests, but we have email confirmation for things like account creation - how the hell will we manage that in e2e tests?
- I'd love if a failed e2e test automatically kicked off a Claude agent that did a preliminary root cause analysis for me to review
- we need to update agents to specify when a feature needs e2e tests added and when it's not worth doing
- I guess I'm most familiar with Playwright, and assumed we'd use it, but we should do at least a cursory check that it's the best tool to use.

