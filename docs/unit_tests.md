This doc is for anyone writing or reviewing unit tests. It assumes you know Vitest and Testing Library, which the tests use.

# What Gets Unit Tests
Unit tests cover the app's code in `src/`, and every module there has 100% coverage. A gap in coverage is logic that no test checks, so it can break with nothing to say so. `vitest.config.ts` enforces the threshold. The few files it leaves out, such as barrel files, constants and type definitions, are ones that hold no logic. Leaving a file out of coverage hides whatever logic it has, so if one of those files gains logic, the logic moves to a module that can be tested.

Dev tooling typically has no unit tests. That covers the seed in `seed/`, the scripts in `scripts/`, the config files at the repo root (such as `vitest.config.ts`) and the test support code in `test/`, including the mocks. Tooling runs only on a developer's machine or in CI, so a fault in it never reaches the app's users. The fault shows up the next time someone runs the tool, and running a tool after a change usually checks that change, so a unit test would add upkeep without catching anything sooner.

# Test Logic, Not Rendering
Every test covers a branch or a piece of logic: a conditional, a calculation, a state change, or what an interaction causes. If a test would still pass after the code it claims to cover is deleted, it doesn't count.

Never test that JSX renders to spec: that a class is applied, that a prop is passed to a child, or that text from a prop shows up. Those tests check React, not this code, and they break whenever the markup changes. In a component, what's worth testing is what it decides: an empty or error state that depends on props, what appears or goes away after a state change, what an interaction causes, and its business logic, such as a date calculation or a permission check.

A component with no branches still needs coverage. Give it one test named `renders (coverage only, no logic)` that renders it and asserts nothing about the JSX. The name tells a reviewer the missing assertion is deliberate.

```tsx
// ✅ Tests what an interaction causes
it('calls onDelete when the delete button is clicked', () => {
  render(<PlannerListItem name="Test" onDelete={mockDelete} />);
  fireEvent.click(screen.getByTestId('delete-button'));
  expect(mockDelete).toHaveBeenCalledWith('test-id');
});
```
```tsx
// ✅ Coverage only, for a component with no branches
it('renders (coverage only, no logic)', () => {
  render(<PlannerHeader name="Test" />);
});
```
```tsx
// ❌ Checks that a prop renders, not any logic
it('displays the planner name', () => {
  render(<Component name="Test" />);
  expect(screen.getByText('Test')).toBeDefined();
});
```

# Writing Tests
A test is easiest to read when it holds only what it checks. The habits below keep it that way.

## Use the Test Libraries' Own Tools
When Vitest or Testing Library already has a tool for the job, use it rather than hand-rolling an equivalent. The libraries' tools are documented and familiar to anyone reading the test. A hand-rolled version is extra code each reader has to work out, and it can quietly differ from what the library does. For example, test a hook on its own with `renderHook`, and give it any provider it needs through the `wrapper` option, rather than writing a throwaway component that calls the hook.

```tsx
const wrapper = ({ children }: { children: ReactNode }) => (
	<ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>
);
const { result } = renderHook(() => useToggleContext(), { wrapper });
expect(result.current).toBe(value);
```

## Set Up Only What the Test Checks
Set a mock's return value only when the test checks what that value leads to, such as a success path against a failure path. A test that only checks that a handler was called leaves the mock's default alone, so a reader doesn't go looking for what the value does.

In the same way, a test that only checks a call can be synchronous. `vi.fn()` records calls as they happen, so an assertion right after the triggering event sees the call. Making the test `async` and wrapping the assertion in `waitFor` only suggests there's something to wait for.

```typescript
it('calls the handler when clicked', () => {
  fireEvent.click(button);
  expect(mockHandler).toHaveBeenCalledWith(expectedArgs);
});
```

## Loading States
A test of a loading state just triggers the action and checks what shows, with no promise resolved by hand. That works because a shared mock that holds state, such as `useAsyncStatus` (see "State in a Mock"), sets its status to `'loading'` as soon as `run()` is called, before it awaits anything.

```tsx
it('shows the loading state', async () => {
  render(<Component />);
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByTestId('loading')).toBeDefined();
  });
});
```

# Mocks
Nearly every dependency of the module under test is mocked with `vi.mock`, so a test checks only that module and fails only when it breaks. Three libraries are the exception:

| Library | Why it isn't mocked |
|---------|---------------------|
| `react` | It underpins the whole app, and a mock of it can make hooks and components look as if they work when they don't. |
| `@tabler/icons-react` | Its icons are presentational components with no logic, so a mock adds indirection for no benefit. |
| `zod` | Schemas are part of the code under test, so mocking `zod` would leave validation untested. It's synchronous and has no side effects, so it costs a test nothing. |

Modules that use these libraries are still mocked, such as `@/_models` or a form's validation helpers, so a test doesn't break when a schema changes. Only the library itself is the exception.

Two modules are swapped for their mocks in every test through aliases in `vitest.config.ts`: `@/env` resolves to `test/mocks/env.ts`, and `server-only` to `test/mocks/server-only.ts`. So a test file doesn't need to mock them, and the app's real environment never reaches a test. A test that needs a different env value mocks `@/env` with its own object, as `src/_utils/errorReporting/errorReporting.test.ts` does.

## Keep Mocks Simple
A mock is a stub, not a second implementation. Its default is the success path with minimal valid data: a mock component renders a static placeholder, and a mock function returns a static value. A test that needs a failure or an edge case overrides the default for itself, such as with `mockReturnValueOnce`, so what each test is about shows in the test. If several test files override a shared mock's default in the same way, the default is probably wrong, and changing it is better than repeating the override.

A mock with real logic in it recreates the module it replaces. An example is a mock that validates an email with a regex. Its logic drifts from the real code without anything failing, and it hides what the test is checking. A test that needs the real behavior belongs in the dependency's own test file.

```typescript
// ✅ A stub
export const validateEmail = vi.fn(() => ({ success: true }));
```
```typescript
// ❌ Reimplements the real validation
vi.mock('@/_utils/validator', () => ({
  validateEmail: vi.fn((email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { success: true }
      : { success: false, error: 'Invalid email' },
  ),
}));
```

## State in a Mock
A mock holds state only when a test needs it, such as a test that checks a spinner appears while an action runs or an error message after it fails. State added in case a test might need it is logic no test checks.

When a mocked hook does need state, the mock holds it with React's `useState`, so a change to it re-renders the component under test the way the real hook would.

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

## Shared Mocks
A module that many test files mock gets one shared mock in `test/mocks/`, at the path that matches the module's import path, such as `test/mocks/@mantine/form.ts` for `@mantine/form`. Copies of the same mock drift apart, and a change to the module then means editing every one. Where a mock lives depends on whether one is shared yet:
- **If the module already has a shared mock:** every test file that mocks the module loads the shared one, so every test sees the same version of the module. The mock stays shared however few files use it, because moving it back into a test file means the next file to mock the module starts copying again.
- **Otherwise:** a module mocked in only one or two files usually keeps its mock in the test file. Once the same mock is being copied from file to file, it's worth sharing.

A test file loads a shared mock with an async factory, which works however `vi.mock` is hoisted:

```typescript
vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
```

A shared mock exports the same names as the module it replaces, so a test imports from the real module, such as `import { useForm } from '@mantine/form'`, and never has to know about the mock. A `mockUseForm` that tests then map back to `useForm` puts the mock's internals in every test. If a test needs a spy the real module has no name for, such as `emails.send` on a Resend client, the mock exports it under a name of its own.

```typescript
// ✅ In test/mocks/@mantine/form.ts
export const useForm = vi.fn(() => ({...}));
```
```typescript
// ❌ Tests have to know about the mock's internals
export const mockUseForm = vi.fn();
export const useForm = () => mockUseForm();
```

When a component uses a part of a library that its shared mock doesn't have yet, such as a new `@mantine/core` component, add it to the shared mock. A test file that mocks the library again for itself, such as with `importOriginal`, gives that test a different version of the library from every other test.

# Testing by Access Level
When a component shows different UI at different access levels, `it.byAccessLevels` from `#test` runs one test at every level: `read`, `write`, `admin` and `owner`, in that order. Use it only when the assertion varies by level. Behavior that's the same at every level, such as an interaction or a state change, gets a plain `it()`.

```tsx
import { it } from '#test';

it.byAccessLevels('shows the member list to admins and owners', ({ accessLevel, expect }) => {
  render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

  expect(screen.queryByTestId('member-list')).atMinLevel('admin').toBeTruthy();
});
```

This generates one test per level, named `shows the member list to admins and owners - read` and so on. The `expect` that `it.byAccessLevels` passes to the test has three modifiers. Each one applies the assertion at the levels it names, and the opposite assertion at the other levels:

| Modifier | Asserts at |
|----------|------------|
| `.onlyAtLevel('admin')` | `admin` only |
| `.atMinLevel('admin')` | `admin` and above: `admin` and `owner` |
| `.atMaxLevel('write')` | `write` and below: `read` and `write` |

Assert that something is present, such as with `.toBeTruthy()`, and never add `.not` after a modifier. At the other levels the modifier has already negated the assertion, and a second `.not` doesn't undo it. So the assertion is negated at every level, and the test no longer checks what differs between them.

```tsx
// ✅
expect(button).onlyAtLevel('owner').toBeTruthy();
```
```tsx
// ❌ Asserts the button is missing at every level, not only for owners
expect(button).onlyAtLevel('owner').not.toBeTruthy();
```

# Where Test Code Lives
A unit test sits beside the module it tests, in a file named `<module>.test.ts` or `<module>.test.tsx`. Vitest runs every `*.test.ts[x]` file outside `e2e/`.

Support code shared by unit tests is in `test/`:

| Path | What it holds |
|------|---------------|
| `test/mocks/` | the shared mocks, imported through `#mocks` (see "Shared Mocks") |
| `test/fixtures/` | fixtures, imported through `#fixtures` |
| `test/utils/` | test helpers, such as `it.byAccessLevels`, imported through `#test` |
| `test/setup.ts` | runs before every test file, and stubs the browser APIs jsdom doesn't have |

A fixture is a function that builds test data, such as a meal form's dish or a refused Resend send, with defaults that any test can override. A fixture joins `test/fixtures/` once several test files build the same kind of data. Until then, a test builds its data inline, where the reader can see it.

`test/factories/` and `test/auth.ts` hold the E2E tests' and the dev seed's code, which writes to a real database. Unit tests don't use them (see `docs/e2e_tests.md`).
