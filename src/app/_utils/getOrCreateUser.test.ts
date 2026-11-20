import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addUser } from '@/_actions/user/addUser';
import { users } from '@/_models/database/users';

import { getOrCreateUser } from './getOrCreateUser';

vi.mock(
	'@/_actions/user/addUser',
	async () => await import('#mocks/@/_actions/user/addUser'),
);
vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

const existingUser = {
	email: 'ariel@sea.com',
	name: 'Ariel',
	planners: [{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' }],
};

describe('getOrCreateUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the existing user without creating one', async () => {
		vi.mocked(users.findOne).mockResolvedValueOnce(existingUser as never);

		const user = await getOrCreateUser('ariel@sea.com', 'Ariel');

		expect(users.findOne).toHaveBeenCalledWith({ email: 'ariel@sea.com' });
		expect(user).toBe(existingUser);
		expect(addUser).not.toHaveBeenCalled();
	});

	it('creates the user with a new planner when none exists', async () => {
		vi.mocked(users.findOne).mockResolvedValueOnce(null as never);

		const user = await getOrCreateUser('ariel@sea.com', 'Ariel');

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com', undefined, 'Ariel');
		expect(user).toBe(await vi.mocked(addUser).mock.results[0].value);
	});
});
