---
name: writing-standard
description: The standard for writing this repo's docs and agent instructions. Use when planning, drafting or making a change to a file in docs/, README.md, AGENTS.md, .claude/skills/ or .claude/agents/.
user-invocable: false
---

# Writing Docs and Agent Instructions
Docs (`docs/` and `README.md`) and agent instructions (AGENTS.md, skills and agents) have different readers, but they're good in the same ways. This file holds those shared qualities, and a part for each kind of file says how they apply to it and what else that kind needs. Read `docs.md` for a doc and `instructions.md` for an agent instruction, or both if a change touches both.

## Write for Your Reader
Before drafting, know who reads the file and what they already know, then give them what they need and nothing they don't. A file pitched at the wrong reader either leaves them guessing or buries what they need under what they already know.

Assume your reader never saw the file's earlier versions, and after a change, describe how things work now. If a reader with no history would do the wrong thing without a negative, keep it. Otherwise, cut lines about what something no longer does or why it isn't the old way, such as ones with "no longer", "instead of" or "there's no X step": they only make sense next to the old version, so they cost the reader attention and tell them nothing.

## Read It as One Piece
Every file is read from start to finish, by a person as prose and by an agent as a whole, so a change has to leave it reading as one piece. A sentence that's right on its own can still make a passage hard to follow, and a file that grows by insertion turns into a pile of afterthoughts.

Before adding to a file, reread the section the addition lands in, or the whole file if it's short, and restructure it around the new text rather than wedging the text in where it happens to fit. If the addition is a separate idea, give it its own paragraph or bullet. If it's a case of an existing rule, rebuild the rule around its cases, such as sub-bullets, rather than putting an exception in the middle of it. Before showing a draft, reread every passage you changed from start to finish, as if seeing it for the first time.

## Put the Key Points First
Open the file, and each section, with what the reader most needs: what it's for and its main point. Details, cases and background follow. A reader who stops early, or skims to find their place, still gets the point.

## Put Conditions Before Instructions
Write "If ..., do Y. Otherwise, do X." Never write "Do X." and then, in a later sentence, "Don't do X when ...". Readers act on the plain instruction before they reach the exception, and agents often miss the exception altogether.

## Say It Plainly, Completely and the Same Way Each Time
Say in full what happens, with no shorthand. "Asks the user them" makes sense only to its writer. Say what is asked, about what, and what happens with each answer. Use one term for each thing throughout, because a reader who meets a second term assumes it means something different.

## Explain Why
Give each rule or convention its reason, in a sentence or so. A reader who knows why can apply it to a case the text didn't foresee, and can tell when it no longer fits.

## Use Lists Only for Separate Items
Write connected ideas as prose, and keep lists for items that truly stand apart, such as the steps of a sequence or the cases of one rule. A run of short bullets drops the words that link ideas, like "because", "so" and "unless", and leaves the reader to rebuild them.

## Title-Case Headers
Headers are title-cased, as the headers in this file are. It's a slight preference, so follow it in what you write, but never treat a header's case as a reason to reject or rework a draft.
