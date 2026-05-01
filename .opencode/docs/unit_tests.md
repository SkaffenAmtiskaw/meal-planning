# Unit Test Tooling
- Unit tests use [`vitest`](https://vitest.dev/api/) and [`@testing-library/react`](https://testing-library.com/docs/).

# Conventions
- Unit tests are co-located with the module they test.
- The naming convention for unit tests is `*.test.ts[x]`

# Mocks
- Almost all dependencies should be mocked using `vi.mock`
- If the same library or module is mocked repeatedly throughout the app it should be turned into a reusable mock located at `test/mocks/` - vitest will provide an alias for it to be accessed in unit tests
- When writing tests, the `test/mocks/` directory should be checked for pre-existing mocks
- Mock files should only export modules that exist on the module being mocked

## Export Actual Module Names
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

Mocks should provide simple, predictable defaults that let tests work without boilerplate. A good default:

1. **Returns minimal valid data** - not complex logic or real implementation details
2. **Represents the success path** - tests override only when testing error/edge cases
3. **Is configurable per-test** - use `mockReturnValueOnce` for specific test needs

**Example of good defaults:**

```typescript
// In test/mocks/@/_utils/validator.ts
export const validateEmail = vi.fn(() => ({ success: true }));

// In test file - works without setup
vi.mock('@/_utils/validator', async () => await import('@mocks/@/_utils/validator'));

// Test overrides only when testing error path:
it('displays error for invalid email', () => {
  vi.mocked(validateEmail).mockReturnValueOnce({
    success: false,
    error: 'Invalid email',
  });
  // ... test error handling
});
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

**Why this matters:**
- Tests should verify behavior, not implementation details
- Mocks with real logic couple tests to code internals
- Simple defaults are easier to understand and maintain
- Explicit overrides in tests make intent clear

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
Always use the async factory pattern for reusable mocks. This is consistent and handles hoisting correctly.

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
