import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import { updateUserName } from './updateUserName';

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

const mockSession = { user: { email: 'ariel@sea.com' } };

describe('updateUserName', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('returns error when not authenticated', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		const result = await updateUserName('Ariel');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('returns error when name is empty', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

		const result = await updateUserName('');

		expect(result.ok).toBe(false);
		expect(users.updateOne).not.toHaveBeenCalled();
	});

	test('returns error when name contains invalid characters', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

		const result = await updateUserName('$evil');

		expect(result).toEqual({ ok: false, error: 'Contains invalid characters' });
	});

	test('returns error when name exceeds 50 characters', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

		const result = await updateUserName('a'.repeat(51));

		expect(result.ok).toBe(false);
	});

	test('returns error when user is not found', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(users.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateUserName('Ariel');

		expect(result).toEqual({ ok: false, error: 'User not found.' });
	});

	test("sets the session user's name and returns ok", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

		const result = await updateUserName('Ariel');

		expect(users.updateOne).toHaveBeenCalledWith(
			{ email: 'ariel@sea.com' },
			{ $set: { name: 'Ariel' } },
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test('accepts names with apostrophes, hyphens, and periods', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

		const result = await updateUserName("O'Brien-Smith Jr.");

		expect(result.ok).toBe(true);
		expect(users.updateOne).toHaveBeenCalledWith(
			{ email: 'ariel@sea.com' },
			{ $set: { name: "O'Brien-Smith Jr." } },
		);
	});
});
