import { expect, test } from 'vitest';

// Acceptance check for CI Failure Sessions Step 4: fails only on a run's first attempt on GitHub.
test('fails only on the first attempt', () => {
	expect(process.env.GITHUB_RUN_ATTEMPT).not.toBe('1');
});
