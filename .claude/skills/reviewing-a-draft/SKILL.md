---
name: reviewing-a-draft
description: Whether a draft of a doc or agent instruction needs a writing review, how to run the writing-reviewer agent on it, and how to handle its findings. Use before showing such a draft or naming a written change to one in a summary.
user-invocable: false
---

# Reviewing a Draft
If the user has settled the draft's exact form, or it's mechanical, skip the review. Otherwise, including each draft you revise after feedback, follow these steps, because a writer anchors on its own draft and misses where it breaks the standard.

1. If the user hasn't agreed to what the change does, show them its outline first, and wait for their answer. A review polishes the wording, so it's wasted on a direction they'd change.
2. Run the `writing-reviewer` agent for its passes, Cuts, Structure, Clarity, Placement and The rest, sized to the change:
   - **If it's a small edit, a few lines in a file that otherwise stays as it is:** run it once, for all its passes.
   - **Otherwise,** such as a new file, a rewritten section, a large edit across several sections or a whole file put under review: run it in parallel, once for each pass. On a long draft, one reviewer checking every pass catches what stands out and misses the rest. Give Cuts and Structure a second run, because one run catches their judgment calls only some of the time.

   Send each run:
   - its passes
   - what the change is for
   - what the user has settled in it, so the reviewers don't report those choices as mistakes
   - which passages you changed, or which sections or files you rewrote or put under review whole
   - the path of each draft and of the file it goes in, with each draft written to a file rather than pasted, so Cuts and Structure can work out what to look for before they read it
3. Go through their findings:
   - **If fixing one needs a choice that isn't settled,** such as whether a difference from a rule kept elsewhere is deliberate, ask the user about that choice alone, then fix the text.
   - **If you agree with one,** fix the text.
   - **If you disagree with one that matters,** as AGENTS.md's "Problems You Find" describes, leave the text as it is, and when you show the change, raise the finding and why you disagree.
   - **If you disagree with a small one,** drop it.
4. If you fixed any, re-check the passages you changed, sized by the fixes as step 2 describes, since a fix for one pass can break another's sections. Send it only those passages, and say it's a re-check. Go through its findings as step 3 describes, without another re-check, because each round costs another set of reviewer runs and a re-check's fixes are small.
