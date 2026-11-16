import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import { getUser } from './getUser';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

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
		vi.mocked(users.findOne).mockResolvedValue(mockUser as never);

		const result = await getUser();

		expect(users.findOne).toHaveBeenCalledWith({
			email: 'maleficent@evil.com',
		});
		expect(result).toEqual(mockUser);
	});

	test('should return null if no user exists for the session email', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(users.findOne).mockResolvedValue(null as never);

		const result = await getUser();

		expect(result).toBeNull();
	});
});
