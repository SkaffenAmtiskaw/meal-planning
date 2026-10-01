import { expect, test } from 'vitest';

// Acceptance check for CI Failure Sessions Step 4: fails only on GitHub's runner.
test('fails only on GitHub Actions', () => {
	expect(process.env.GITHUB_ACTIONS).not.toBe('true');
});
