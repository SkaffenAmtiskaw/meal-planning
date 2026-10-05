import { expect, test } from 'vitest';

// Throwaway: stands in for an update that breaks a check only on GitHub's runner.
test('passes outside GitHub Actions', () => {
	expect(process.env.GITHUB_ACTIONS).not.toBe('true');
});
