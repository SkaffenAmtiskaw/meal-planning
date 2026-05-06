---
description: Clean up a unit test file
color: '#0ead69'
mode: subagent
model: opencode-go/kimi-k2.6
temperature: 0.2
permission:
   edit:
      "*": deny
      "src/**/*.test.ts*": allow
steps: 5
---
Clean up the $ARGUMENTS test file to align with project unit test standards.

1. **Review the module being tested and make sure tests align.**
    - Unit test files should be colocated with the module they are testing. If you are unable to find the module being tested in the same directory as $ARGUMENTS this is an indicator of a larger problem in the project; STOP immediately and report the problem.
    - Evaluate what the module itself actually does. Do the tests reflect the behavior of the module itself? If not, what needs to be changed to make sure the tests reflect the purpose of the module?
    - Tests should also serve as a source of documentation - make sure test names make sense and tests follow a logical order.
2. **Make sure all tests are meaningful.**
    - Tests should test the behavior of the module being tested. If a test can be removed without affecting test coverage, the test is probably meaningless.
    - Existing tests should NEVER be blindly assumed to be meaningful. EACH test should be carefully evaluated to determine if it serves a purpose.
3. **Remove unnecessary complexity.**
   - Existing complexity should NEVER be assumed to be necessary.
4. **Make sure all project unit testing guidelines are followed.**
   - Guidelines can be found at `.opencode/docs/unit_tests.md`
5. **Make sure all other modules are mocked.**
    - Run pnpm test:agent $ARGUMENTS
    - If any module other than the one being tested shows up in the coverage report, that is an indication of a missing mock. 
6. **Make sure centralized mocks are used when available.**
   - If a centralized mock exists but does not meet the needs of the tests, STOP and ask the user for direction.
7. **Make sure all other mocks are minimal.**
   - Mocks should be stubs (`vi.fn()`) whenever possible.
   - Tests which interact with the mocks are a code smell.
   - DO NOT mock return values unless those values are NECESSARY for the test.
8. **Ensure unit test coverage is still 100%.**
9. **Ensure linting and TS pass.**
   - Run `pnpm lint` and `pnpm check:types` and confirm there are no errors.
   - Although lint warnings will not fail the build, they should be addressed whenever possible. If you believe this case should be an exception to the rule, ask the error for permission to add an ignore comment. DO NOT add the comment without explicit user permission.

**Patterns**
- _Mocking Hook Returns_
```tsx
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRouter } from 'next/navigation';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

describe('example component', () => {
    const mockPush = vi.fn();
    
    beforeAll(() => {
       const defaultRouter = vi.mocked(useRouter)();
       vi.mocked(useRouter).mockReturnValue({
          ...defaultRouter,
          push: mockPush,
       });
    });
    
    beforeEach(() => {
       vi.clearAllMocks();
    });
    
    it('should do something', () => {
        // set up test
       
       expect(mockPush).toHaveBeenCalled();
    })
})
```
- _Testing Component Callbacks_
```tsx
const ComponentBeingTested = () => {
    const callback = () => {
        // testable behavior
    }
    
    return (
        <ChildComponent callback={callback} />
    )
}
```
```tsx
import { ChildComponent } from './path/to/child/component';

vi.mock('./path/to/child/component', () => {
    ChildComponent: vi.fn(() => null)
})

describe('component being tested', () => {
    test('should call child component with callback', () => {
        render(<ComponentBeingTested />);
        
        const callback = vi.mocked(ChildComponent).mock.calls[0][0].callback;
        
        callback();
        
        expect(/* testable behavior */).toBe(true);
    })
})
```
_Note: In cases where the callback is passed via prop or returned from a hook, it is even easier to test - simply pass vi.fn() and make sure it is called._