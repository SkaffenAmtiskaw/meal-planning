import { describe, expect, it, vi } from 'vitest';

import { connectDatabase } from './connectDatabase';
import { rawDatabase } from './connection';
import { createUsersIndexes } from './users';

vi.mock('./connection', () => ({
	rawDatabase: { client: { connect: vi.fn() } },
}));
vi.mock('./users', () => ({ createUsersIndexes: vi.fn() }));

describe('connectDatabase', () => {
	it('connects the one client, then creates the indexes', async () => {
		await connectDatabase();

		expect(rawDatabase.client.connect).toHaveBeenCalled();
		expect(createUsersIndexes).toHaveBeenCalled();
		expect(
			vi.mocked(rawDatabase.client.connect).mock.invocationCallOrder[0],
		).toBeLessThan(vi.mocked(createUsersIndexes).mock.invocationCallOrder[0]);
	});
});
