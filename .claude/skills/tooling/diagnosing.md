# Diagnosing an Agent Behavior
Work out why agents behaved as an account describes, and settle with the user whether and how to fix it. The account is either the user's words, sometimes with the transcript of the session where it happened, or an item in a note, with whatever cases it cites.

The risk in this work is fixing a one-off. A behavior that went wrong tempts a fix, and every fix adds instructions that later sessions pay attention to. So "no change" is a normal result, and a fix needs evidence.

1. **Start the search** in the background: send `transcript-searcher` the behavior in general terms, not one session's details, so it finds cases in other situations too.
2. **Read what happened.** Transcripts run to megabytes, so search them and read around each hit, rather than reading whole files.
   - **If you have a transcript:** find the stretch the account is about, and what led into it. If the account involves sessions started from the one in the transcript, `list_sessions` with `linked: true` lists them. Earlier transcripts of the same session, from before a `/clear`, sit in the same folder as the transcript you have.
   - **Otherwise:** read the cases the account cites. If it cites none, the search's cases are where you start.

   Judge each agent by the instructions it had then, not today's. A transcript holds each skill body as it loaded. For AGENTS.md, the CLAUDE.md files and other files the agent relied on, use `git show` at the last commit on `origin/develop` before the session started.
3. **Once the search has reported, check whether it's fixed already.** The cases where it may be, and what to do in each:
   - **If the instructions the agent followed have changed on `origin/develop` since the latest case, and the change covers what went wrong:** tell the user what changed. The result is no change.
   - **If the account is an item and the search finds no case since the latest one it cites, or since the item was added if it cites none:** tell the user and ask whether to go on, because a behavior that has stopped may need no change. The notes repo's history shows when the item was added. If the user doesn't want to go on, the result is no change.
4. **Work out the cause.** Look past the moment it went wrong, at what led the agent there. If the search finds several cases, read around each one's quoted stretch, because what they share points to the cause underneath. A cause needs one of two kinds of evidence: lines in the instructions that led the agent there or left a careful agent no way to know what to do, or several cases from the search. If you find neither, your diagnosis is a one-off.
5. **Get the checker's judgment.** Write your diagnosis down first, so the checker's judgment can't anchor yours. Then send `behavior-cause-checker` the account, the transcript of the clearest case and where in it the behavior happens. Send nothing of your own view of the cause, so yours can't anchor its judgment either.
6. **Settle it with the user.** Show them what happened, why, the evidence for it, the checker's judgment and the fix you propose, or that you propose none.
   - **If the checker's judgment differs from yours** on whether there's a cause or what it is, show both views and let the user decide, because you can't judge your own diagnosis without bias.
   - **If you propose a fix,** make it a general guideline that would lead a careful agent to the right action on its own, because a rule that names the case that went wrong leaves the cause in place for the next case.
