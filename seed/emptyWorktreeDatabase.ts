import { MongoClient } from 'mongodb';

import { env } from '@/env';

import { databaseNameOf, isWorktreeDatabase } from './databaseNames';

// Empties a worktree's slot database by dropping each of its collections, since local's Atlas user
// has readWrite there and no dropDatabase. scripts/worktree-slot.sh runs it when a worktree takes a
// slot, and scripts/worktree-sweep.sh when it removes the worktree. It refuses every database but `test-<n>`, so the
// main checkout's `test` and production's `staging` are never touched.
const databaseName = databaseNameOf(env.DB_URL);
if (!isWorktreeDatabase(databaseName)) {
	throw new Error(
		`emptyWorktreeDatabase only empties a worktree's "test-<n>" database, but DB_URL points at "${databaseName}".`,
	);
}

const client = new MongoClient(env.DB_URL);
try {
	const db = client.db();
	const collections = await db
		.listCollections({}, { nameOnly: true })
		.toArray();
	for (const { name } of collections) {
		await db.dropCollection(name);
	}
	console.log(
		`Emptied ${databaseName}: dropped ${collections.length} collection(s).`,
	);
} finally {
	await client.close();
}
