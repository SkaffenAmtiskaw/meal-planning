# Unit Test Tooling
- Unit tests use [`vitest`](https://vitest.dev/api/) and [`@testing-library/react`](https://testing-library.com/docs/).

# Conventions
- Unit tests are co-located with the module they test.
- The naming convention for unit tests is `*.test.ts[x]`

# Mocks
- Almost all dependencies should be mocked using `vi.mock` (exceptions are listed below)
- `test/mocks/` contains mocks for libraries and modules which are mocked frequently - vitest provides an alias for it to be accessed in unit tests
- If a reusable mock is available in `test/mocks/`, it should ALWAYS be preferred over writing a custom mock implementation

## Libraries That Should Not Be Mocked

| Library | Why Not Mock                                                                                                                                                                                    |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `react` | Underpins the entire application; mocking it can create false confidence that hooks/components work when they do not.                                                                           |
| `@tabler/icons-react` | Pure presentational components with no logic. Mocking adds indirection for zero benefit.                                                                                                        |
| `zod` | Schema definitions are part of the implementation under test. Mocking zod means not testing validation boundaries. It is a synchronous, side-effect-free library with negligible test overhead. |

**Clarification:** Modules that *use* these libraries internally should still be mocked (e.g., `@/_models`, form validation utilities) so that tests are not coupled to schema changes. Only the library is an exception; its consumers should not be.

## Creating Centralized Mocks
New centralized mocks should only be created when the user requests it.

### Naming Conventions
Mocks at `test/mocks/` must export the actual module names they replace. Do not export `MockFoo` variants that tests then have to map back to real names.

**Why:** This keeps test files clean. Tests import from the real module (`import { useForm } from '@mantine/form'`) and vitest's mocking system substitutes the mock automatically. The test author never sees or thinks about mock internals.

```typescript
// ✅ CORRECT in test/mocks/@mantine/form.ts
export const useForm = vi.fn(() => ({...}));
```
```typescript
// ❌ INCORRECT - forces tests to know about mock internals
export const mockUseForm = vi.fn();
export const useForm = () => mockUseForm();
```

## What Good Mock Defaults Look Like

Mocks are stubs, not implementations. They exist to isolate the module under test, not to recreate the behavior of dependencies.

A good mock:

1. **Returns minimal valid data** — not complex logic or real implementation details
2. **Represents the success path** — tests override only when testing error/edge cases
3. **Is configurable per-test** — use `mockReturnValueOnce` for specific test needs
4. **Is as simple as possible** — a mock component renders a static placeholder; a mock function returns a static value

### Permissible Complexity

State and async behavior inside a mock are allowed **only when a test in the current file explicitly needs it** to verify dynamic UI state. Examples:

- A mock hook that toggles `loading` to `true` so the test can assert a spinner appears
- A mock hook that sets `error` so the test can assert an error message renders

If no test in the file asserts the state transition, **do not include it in the mock.** Never add state or async behavior "just in case."

### Component Example

```tsx
// ✅ CORRECT - dumb placeholder component
export const InviteForm = vi.fn(() => <div data-testid="invite-form" />);
```

### Utility Example

```typescript
// ✅ CORRECT - simple stub
export const validateEmail = vi.fn(() => ({ success: true }));
```

**Antipattern to avoid:**

```typescript
// ❌ WRONG - Mock implements real validation logic
vi.mock('@/_utils/validator', () => ({
  validateEmail: vi.fn((email) => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Invalid email' };
    }
    return { success: true };
  }),
}));
```

```tsx
// ❌ WRONG - Mock recreates real component behavior
vi.mock('./InviteForm', () => ({
  InviteForm: ({ status, error, onInvite }: InviteFormProps) => {
    const [email, setEmail] = useState('');
    return (
      <div>
        {status === 'error' && <div data-testid="error">{error}</div>}
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={() => onInvite(email)}>Invite</button>
      </div>
    );
  },
}));
```

If you find yourself writing more than a few lines inside a mock, you are recreating the real module. Stop. Reduce it to a static stub. The test that needs the real behavior belongs in the dependency's own test file, not in the consumer's test file.

**Why this matters:**
- Tests should verify behavior, not implementation details
- Mocks with real logic couple tests to code internals and silently drift when the real code changes
- Simple defaults are easier to understand and maintain
- Explicit overrides in tests make intent clear
- Complex mocks hide what the test is actually verifying

**Guideline:** The default mock implementations should work for the majority of tests. If you find yourself overriding the same mock behavior repeatedly across multiple test files, the default mock implementation probably needs to be improved rather than forcing every test to override it.

## Extending Mocks for New Imports
When a component imports a new module from a library that already has a mock at `test/mocks/`, add that module to the existing mock file. Do not create ad-hoc mocks in individual test files.

**Why:** Centralized mocks ensure consistency. If `@mantine/core` adds a new component and your feature uses it, add it to `test/mocks/@mantine/core.tsx` so all tests benefit.

```tsx
// ✅ CORRECT - extend the existing mock
// In test/mocks/@mantine/core.tsx:
export const NewComponent = vi.fn(({ children }) => <div>{children}</div>);

// ❌ INCORRECT - creates inconsistency
// In individual test file:
vi.mock('@mantine/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/core')>();
  return {
    ...actual,
    NewComponent: vi.fn(),
  };
});
```

## Use Async Import Pattern for All Mocks
Always use the **async** factory pattern for reusable mocks. This is consistent and handles hoisting correctly.

```typescript
// ✅ CORRECT - async factory
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// ❌ INCORRECT - inline factory with hoisting issues
vi.mock('@mantine/core', () => ({ Button: vi.fn() }));
```

## Mock Files Do Not Have Tests
Files in `test/mocks/` are test infrastructure, not code under test. They do not have associated `.test.ts` files.

## Stateful Mocks Using React Hooks
When mocking React hooks that manage state, use React's `useState` inside the mock factory to create stateful mocks that trigger component re-renders:

```typescript
export const useAsyncStatus = vi.fn(() => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      setStatus('loading');
      await fn();
      setStatus('success');
      return { ok: true };
    } catch {
      setStatus('error');
      setError('An error occurred');
      return { ok: false };
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, run, reset };
});
```

**Benefits:**
- Tests dynamic UI states (loading spinners, error messages) without manually mocking hook state
- State changes trigger React re-renders automatically
- More realistic component behavior

## Testing Access Level Conditional Behavior

When a component renders different UI based on user access levels, use `it.byAccessLevels` from `@test` to run the same test for all access levels in a single declaration.

### Usage

```tsx
import { it } from '@test';

it.byAccessLevels('shows member list for admins and owners', ({ accessLevel, expect }) => {
    render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

    const memberList = screen.queryByTestId('member-list');

    expect(memberList).atMinLevel('admin').toBeTruthy();
});
```

This generates four tests:
- `shows member list for admins and owners - read`
- `shows member list for admins and owners - write`
- `shows member list for admins and owners - admin` ✅
- `shows member list for admins and owners - owner` ✅

### Assertion Modifiers

The custom `expect` injected by `it.byAccessLevels` provides three level-aware modifiers:

| Modifier | Behavior |
|----------|----------|
| `.onlyAtLevel('admin')` | Passes only when `accessLevel === 'admin'` |
| `.atMinLevel('admin')` | Passes when `accessLevel >= admin` (admin, owner) |
| `.atMaxLevel('write')` | Passes when `accessLevel <= write` (read, write) |

**Access level order:** `read < write < admin < owner`

### Examples

**Show element only for owners:**
```tsx
expect(button).onlyAtLevel('owner').toBeDefined();
```

**Show element for admins and owners:**
```tsx
expect(memberList).atMinLevel('admin').toBeTruthy();
```

**Show element for read and write only:**
```tsx
expect(infoText).atMaxLevel('write').toBeTruthy();
```

### Negation Caution

**Do not use negation with level modifiers.** When a modifier returns `.not`, chaining `.not` again produces a double-negative that does not resolve back to the original assertion.

```tsx
// ❌ WRONG - .onlyAtLevel returns .not at other levels, then .not flips it again
expect(button).onlyAtLevel('owner').not.toBeDefined();

// ✅ CORRECT - test the positive presence instead
expect(button).onlyAtLevel('owner').toBeDefined();
```

Test the positive presence of elements rather than their absence. If you need to assert something is hidden at certain levels, structure the test so the element is present and you assert against that.

### When NOT to use

Do not use `it.byAccessLevels` for behavior that is the same across all access levels. Use regular `it()` for:
- Testing interactions (clicks, form submissions)
- Testing state transitions
- Testing hook integration

Only use `it.byAccessLevels` when the assertion varies by access level.

## Testing Loading States

When testing loading states with stateful mocks, **no special mock setup is required.**

### ❌ ANTI-PATTERN: Deferred Promises

Do NOT create promises with stored resolve functions:

```tsx
// ❌ WRONG - overly complex
it('shows loading state', async () => {
  let resolvePromise!: (value: Result) => void;
  const deferredPromise = new Promise<Result>((resolve) => {
    resolvePromise = resolve;
  });
  mockAction.mockReturnValueOnce(deferredPromise);

  render(<Component />);
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  resolvePromise?.({ success: true }); // Manual resolution
});
```

This pattern:
- Creates hard-to-read test code
- Requires manual promise resolution
- Is unnecessary with stateful mocks

### ✅ CORRECT: No Mock Setup Needed

Stateful mocks set `loading=true` synchronously when `run()` is called. Just trigger the action and check the loading state:

```tsx
// ✅ CORRECT - no mock setup needed
it('shows loading state', async () => {
  render(<Component />);
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeDefined();
  });
});
```

**Why this works:**
The stateful mock's `run()` function sets `loading=true` immediately, before awaiting the async function. This means the loading state is visible right away, regardless of how quickly the promise resolves.

# Code Coverage
- All modules should have 100% code coverage (with a few narrowly defined exceptions listed in `vitest.config.ts`).
- You should NEVER exclude code from unit test coverage unless EXPLICITLY instructed to do so by the user.

# Test Patterns

## Don't Create Purely Presentational Tests
Do not write tests that only verify React renders props correctly. These test React's functionality, not your code's behavior.

**Instead, focus on:**
- Conditional rendering logic:
  - Empty states and error states based on props
  - Presence of elements after state transitions
  - Absence of elements from previous states (verify cleanup with `queryByTestId` + `toBeNull()`)
- User interactions and their effects
- Business logic (date calculations, permission checks)
- Integration with hooks and side effects
- State transitions (loading → success → error)

**Example of what NOT to create:**
```tsx
// ❌ DON'T WRITE - purely presentational
it('should display planner name', () => {
  render(<Component name="Test" />);
  expect(screen.getByText('Test')).toBeDefined();
});
```

**Instead, test behavior:**
```tsx
// ✅ TEST BEHAVIOR - what happens when user interacts
it('should call onDelete when delete button clicked', () => {
  render(<PlannerListItem name="Test" onDelete={mockDelete} />);
  fireEvent.click(screen.getByTestId('delete-button'));
  expect(mockDelete).toHaveBeenCalledWith('test-id');
});
```

## Only Mock Return Values When Testing Outcomes
Don't mock return values when you're only testing that a handler was called:

```typescript
// ❌ UNNECESSARY - we don't care about the return value here
mockHandler.mockResolvedValue({ ok: true });
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();

// ✅ CORRECT - let default mock handle it
fireEvent.click(button);
expect(mockHandler).toHaveBeenCalled();
```

Only mock return values when the test explicitly verifies the outcome of that return value (e.g., testing success vs. failure paths).

## Synchronous Handler Tests
Tests that only verify handlers are called (not their async completion) can be synchronous:

```typescript
// ✅ CORRECT - synchronous when just verifying call
it('calls handler when clicked', () => {
  fireEvent.click(button);
  expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
});

// ❌ OVERKILL - unnecessary async/waitFor
it('calls handler when clicked', async () => {
  fireEvent.click(button);
  await waitFor(() => {
    expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
  });
});
```

`vi.fn()` records calls synchronously, so assertions work immediately after the triggering event.
