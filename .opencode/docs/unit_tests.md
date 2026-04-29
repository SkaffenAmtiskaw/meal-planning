# Unit Test Tooling
- Unit tests use [`vitest`](https://vitest.dev/api/) and [`@testing-library/react`](https://testing-library.com/docs/).

# Conventions
- Unit tests are co-located with the module they test.
- The naming convention for unit tests is `*.test.ts[x]` 

# Mocks
- Almost all dependencies should be mocked using `vi.mock`
- If the same library or module is mocked repeatedly throughout the app it should be turned into a reusable mock located at `test/mocks/` - vitest will provide an alias for it to be accessed in unit tests
- When writing tests, the `test/mocks/` directory should be checked for pre-existing mocks

# Code Coverage
- All modules should have 100% code coverage (with a few narrowly defined exceptions listed in `vitest.config.ts`).
- You should NEVER exclude code from unit test coverage unless EXPLICITLY instructed to do so by the user.