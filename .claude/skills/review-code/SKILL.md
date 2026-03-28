---
name: review-code
description: considerations for code reviews
---

Unit Testing
- changed & added files should have unit tests
- certain files are excluded from test coverage in the vitest.config.ts - these files should NEVER have logic added - logic should be extracted to testable modules