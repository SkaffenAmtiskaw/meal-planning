import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { User } from '@/_models';

import { updateUserName } from './updateUserName';

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
	},
}));

const mockSession = { user: { email: 'ariel@sea.com' } };

const mockSave = vi.fn();
const mockUser = () => ({ name: 'Old Name', save: mockSave });

describe('updateUserName', () => {
	afterEach(() => {
		vi.resetAllMocks();
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
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValueOnce(null),
		} as never);

		const result = await updateUserName('Ariel');

		expect(result).toEqual({ ok: false, error: 'User not found.' });
	});

	test('updates the user name and returns ok', async () => {
		const user = mockUser();
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValueOnce(user),
		} as never);

		const result = await updateUserName('Ariel');

		expect(user.name).toBe('Ariel');
		expect(mockSave).toHaveBeenCalledOnce();
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test('accepts names with apostrophes, hyphens, and periods', async () => {
		const user = mockUser();
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValueOnce(user),
		} as never);

		const result = await updateUserName("O'Brien-Smith Jr.");

		expect(result.ok).toBe(true);
		expect(user.name).toBe("O'Brien-Smith Jr.");
	});
});
