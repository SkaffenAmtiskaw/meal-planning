import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { findAuthUser } from '@/_auth/users';

import { checkEmailStatus } from './checkEmailStatus';

vi.mock('@/_auth', () => ({ auth: {} }));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

const foundWith = (providerIds: string[]) =>
	({
		user: { email: 'user@example.com' },
		accounts: providerIds.map((providerId) => ({ providerId })),
	}) as never;

describe('checkEmailStatus', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns "new" when user does not exist', async () => {
		vi.mocked(findAuthUser).mockResolvedValueOnce(null);

		const result = await checkEmailStatus('unknown@example.com');

		expect(result).toBe('new');
		expect(findAuthUser).toHaveBeenCalledWith(auth, 'unknown@example.com');
	});

	test('returns "has-password" when user has a credential account', async () => {
		vi.mocked(findAuthUser).mockResolvedValueOnce(
			foundWith(['google', 'credential']),
		);

		const result = await checkEmailStatus('user@example.com');

		expect(result).toBe('has-password');
	});

	test('returns "social-only" when user exists but has no credential account', async () => {
		vi.mocked(findAuthUser).mockResolvedValueOnce(foundWith(['google']));

		const result = await checkEmailStatus('google@example.com');

		expect(result).toBe('social-only');
	});
});
