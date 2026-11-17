import { describe, expect, it, vi } from 'vitest';

import { MongoClient } from 'mongodb';

import { openDatabase } from './openDatabase';

const { client } = vi.hoisted(() => ({
	client: { db: vi.fn(() => 'the database'), close: vi.fn() },
}));

vi.mock('mongodb', () => ({
	MongoClient: { connect: vi.fn(async () => client) },
}));

describe('openDatabase', () => {
	it('connects to the given URI and opens the named database', async () => {
		const { database } = await openDatabase('mongodb://elsewhere', 'restore');

		expect(MongoClient.connect).toHaveBeenCalledWith('mongodb://elsewhere');
		expect(client.db).toHaveBeenCalledWith('restore');
		expect(database).toBe('the database');
	});

	it('closes its own client', async () => {
		const { close } = await openDatabase('mongodb://elsewhere');

		await close();

		expect(client.close).toHaveBeenCalled();
	});
});
