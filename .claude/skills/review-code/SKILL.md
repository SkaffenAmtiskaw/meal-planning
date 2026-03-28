---
name: review-code
description: considerations for code reviews
---

Clear Intent
- make sure all changes are clearly related - if a code review seems to address multiple unrelated concerns consider splitting it into multiple commits

Feedback
- if multiple decisions need to be made, prompt me one by one for each

Unit Testing
- changed & added files should have unit tests
- certain files are excluded from test coverage in the vitest.config.ts - these files should NEVER have logic added - logic should be extracted to testable modules