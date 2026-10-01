import { expect, test } from 'vitest';

// Acceptance check for CI Failure Sessions Step 4: passes at once outside GitHub, fails on a run's first
// attempt, and takes 35 minutes to pass on a re-run, longer than the ci-failure session waits.
test(
	'outlasts the re-run wait',
	async () => {
		const attempt = process.env.GITHUB_RUN_ATTEMPT;
		if (attempt === undefined) return;
		expect(attempt).not.toBe('1');
		await new Promise((resolve) => setTimeout(resolve, 35 * 60 * 1000));
	},
	36 * 60 * 1000,
);
