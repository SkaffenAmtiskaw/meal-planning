import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { User } from '@/_models';

import { getUser } from './getUser';

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
	},
}));

const mockSession = {
	user: { email: 'maleficent@evil.com' },
};

const mockUser = {
	email: 'maleficent@evil.com',
	planners: [],
};

describe('get user', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should throw if there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

		await expect(getUser()).rejects.toThrow('No Valid Session');
	});

	test('should return the user matching the session email', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue(mockUser),
		} as never);

		const result = await getUser();

		expect(User.findOne).toHaveBeenCalledWith({ email: 'maleficent@evil.com' });
		expect(result).toBe(mockUser);
	});

	test('should return null if no user exists for the session email', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		const result = await getUser();

		expect(result).toBeNull();
	});
});
