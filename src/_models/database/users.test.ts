import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createUsersIndexes, users } from './users';

const { collection } = vi.hoisted(() => ({
	collection: { insertOne: vi.fn(), createIndex: vi.fn() },
}));

vi.mock('./connection', () => ({
	rawDatabase: { collection: vi.fn(() => collection) },
}));

describe('users', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('checks a write against the user schema', () => {
		expect(() =>
			users.insertOne({ _id: 'user-1', planners: [] } as never),
		).toThrow('An insert fails its schema');
		expect(collection.insertOne).not.toHaveBeenCalled();
	});

	it('stores the default name for a user inserted without one', () => {
		const _id = '507f1f77bcf86cd799439011';
		users.insertOne({ _id, email: 'new@example.com', planners: [] });

		expect(collection.insertOne).toHaveBeenCalledWith({
			_id,
			email: 'new@example.com',
			name: 'New User',
			planners: [],
		});
	});

	it('creates the unique email index and the index on membership planners', async () => {
		await createUsersIndexes();

		expect(collection.createIndex).toHaveBeenCalledWith(
			{ email: 1 },
			{ unique: true },
		);
		expect(collection.createIndex).toHaveBeenCalledWith({
			'planners.planner': 1,
		});
	});
});
