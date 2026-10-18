---
name: reviewing-a-draft
description: How to run the writing-reviewer agent on a draft of a doc or agent instruction, and handle its findings. Use when a draft needs a writing review before the user sees it.
user-invocable: false
---

# Reviewing a Draft
1. Run the `writing-reviewer` agent for its passes, Cuts, Structure, Clarity, Placement and The rest, sized to the change:
   - **If it's a small edit, a few lines in a file that otherwise stays as it is:** run it once, for all its passes.
   - **Otherwise,** such as a new file, a rewritten section, a large edit across several sections or a whole file put under review: run it in parallel, once for each pass. On a long draft, one reviewer checking every pass catches what stands out and misses the rest. Give Cuts and Structure a second run, because one run catches their judgment calls only some of the time.

   Send each run:
   - its passes
   - what the change is for
   - what the user has settled in it, so the reviewers don't report those choices as mistakes
   - which passages you changed, or which sections or files you rewrote or put under review whole
   - the path of each draft and of the file it goes in, with each draft written to a file rather than pasted, so Cuts and Structure can work out what to look for before they read it
2. Go through their findings:
   - **If fixing one needs a choice that isn't settled,** such as whether a difference from a rule kept elsewhere is deliberate, ask the user about that choice alone, then fix the text.
   - **If you agree with one,** fix the text.
   - **If you disagree with one,** leave the text as it is, and when you show the change, raise the finding and why you disagree.
3. If you fixed any, re-check the passages you changed, sized by the fixes as step 1 describes, since a fix for one pass can break another's sections. Send it only those passages, and say it's a re-check. Go through its findings as step 2 describes, without another re-check, because each round costs another set of reviewer runs and a re-check's fixes are small.
