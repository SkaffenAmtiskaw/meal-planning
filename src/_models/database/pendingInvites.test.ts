import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pendingInvites } from './pendingInvites';

const { collection } = vi.hoisted(() => ({
	collection: { insertOne: vi.fn() },
}));

vi.mock('./connection', () => ({
	rawDatabase: { collection: vi.fn(() => collection) },
}));

describe('pendingInvites', () => {
	const invite = {
		_id: '507f1f77bcf86cd799439011',
		email: 'friend@example.com',
		planner: '507f1f77bcf86cd799439012',
		invitedBy: '507f1f77bcf86cd799439013',
		accessLevel: 'write' as const,
		token: 'token-1',
		expiresAt: new Date('2024-01-20T00:00:00.000Z'),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2024-01-13T00:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('checks a write against the invite schema', () => {
		expect(() =>
			pendingInvites.insertOne({ ...invite, email: 'not-an-email' }),
		).toThrow('An insert fails its schema');
		expect(collection.insertOne).not.toHaveBeenCalled();
	});

	it('stores the creation date for an invite inserted without one', () => {
		pendingInvites.insertOne(invite);

		expect(collection.insertOne).toHaveBeenCalledWith({
			...invite,
			createdAt: new Date('2024-01-13T00:00:00.000Z'),
		});
	});
});
