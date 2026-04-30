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

// ❌ INCORRECT - forces tests to know about mock internals
export const mockUseForm = vi.fn();
export const useForm = () => mockUseForm();
```

## Provide Default Mock Implementations
Reusable mocks should export `vi.fn()` instances with default implementations. This lets tests work without boilerplate setup.

**Pattern:** The mock file provides a working default that handles the common case. Tests only override when they need specific values that the default doesn't provide.

```typescript
// In test/mocks/@mantine/form.ts - provides working default
export const useForm = vi.fn((options) => ({
  onSubmit: (handler) => (e) => handler(options?.initialValues ?? {}),
  getInputProps: vi.fn(() => ({})),
  key: vi.fn((field) => field),
}));

// In test file - uses default, no setup needed
vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

// When specific values needed, override inline:
import { useForm } from '@mantine/form';
vi.mocked(useForm).mockReturnValueOnce({
  onSubmit: (handler) => (e) => handler({ specific: 'values' }),
  getInputProps: () => ({}),
  key: (f) => f,
} as ReturnType<typeof useForm>);
```

## Only Override When Necessary
The default mock implementations should work for the majority of tests. **Only override mock behavior when absolutely necessary for the specific test case.**

If you find yourself overriding the same mock behavior repeatedly across multiple test files, the default mock implementation probably needs to be improved rather than forcing every test to override it.

## Extending Mocks for New Imports
When a component imports a new module from a library that already has a mock at `test/mocks/`, add that module to the existing mock file. Do not create ad-hoc mocks in individual test files.

**Why:** Centralized mocks ensure consistency. If `@mantine/core` adds a new component and your feature uses it, add it to `test/mocks/@mantine/core.tsx` so all tests benefit.

```typescript
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

# Code Coverage
- All modules should have 100% code coverage (with a few narrowly defined exceptions listed in `vitest.config.ts`).
- You should NEVER exclude code from unit test coverage unless EXPLICITLY instructed to do so by the user.