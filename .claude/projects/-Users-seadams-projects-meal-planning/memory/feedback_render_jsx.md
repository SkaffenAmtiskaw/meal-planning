---
name: Use JSX in render calls
description: Always use JSX syntax in render() calls, not direct function calls
type: feedback
---

Always pass JSX to `render()`, not a direct component function call.

**Why:** Developers expect to see JSX in test files — direct function calls like `render(await Component({ prop }))` are less readable and don't match how components are actually used.

**How to apply:** Write `render(await (<MyComponent prop={val} /> as Promise<React.ReactElement>))` for async server components, and `render(<MyComponent prop={val} />)` for synchronous ones.
