---
name: review-code
description: considerations for code reviews
---

Clear Intent
- make sure all changes are clearly related - if a code review seems to address multiple unrelated concerns consider splitting it into multiple commits

Completion
- make sure the stated objectives are achieved - if scope is unclear prompt the user

Feedback
- if multiple decisions need to be made, prompt user one by one
- if the user indicates a suggestion should be deferred til later add a TODO comment

Code Conventions
- You MUST refer to the code conventions in AGENTS.md and make sure all code changes follow them
- Mantine components are preferred over custom styles - custom styles should only be used when explicitly requested by the uesr or when there is none available that suits the purpose

Dead Code
- all code reviews should include a check for dead code
- check TODO comments in staged files and assess whether they have been addressed - if so suggest removing it - the user MUST confirm it can be removed

Unit Testing
- changed & added files should have 100% unit test coverage
- certain files are excluded from test coverage in the vitest.config.ts - these files should NEVER have logic added - logic should be extracted to testable modules - check for logic that has been added and should be pulled out

Update Notes
- check if the changes made are listed in the `notes/Planed Changes.md` document - if so prompt the user to confirm whether it should be removed

Summary
- finish code reviews by giving the user a summary of the changes and any decisions made
- if the planned changes were listed in the `notes/` directory update the relevant note(s) to indicate what has been completed - if a feature is fully done prompt the user and ask if the note should be removed