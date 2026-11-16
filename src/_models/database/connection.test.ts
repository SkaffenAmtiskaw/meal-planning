import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoClient } from 'mongodb';

const { database } = vi.hoisted(() => ({ database: {} }));

vi.mock('mongodb', () => ({
	MongoClient: vi.fn(
		class {
			db = vi.fn(() => database);
			connect = vi.fn();
			close = vi.fn();
		},
	),
}));
vi.mock('@/env', async () => await import('#mocks/env'));

const globalWithClient = globalThis as { mongoClient?: unknown };

const loadConnection = async () => await import('./connection');

describe('connection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		vi.unstubAllEnvs();
		delete globalWithClient.mongoClient;
	});

	it('reuses the client a dev hot reload left on globalThis', async () => {
		vi.stubEnv('NODE_ENV', 'development');

		await loadConnection();
		vi.resetModules();
		await loadConnection();

		expect(MongoClient).toHaveBeenCalledTimes(1);
	});

	it('leaves globalThis alone outside development', async () => {
		vi.stubEnv('NODE_ENV', 'production');

		await loadConnection();

		expect(globalWithClient.mongoClient).toBeUndefined();
	});

	it('closes the one client', async () => {
		const { closeDatabase } = await loadConnection();

		await closeDatabase();

		expect(vi.mocked(MongoClient).mock.instances[0].close).toHaveBeenCalled();
	});
});
