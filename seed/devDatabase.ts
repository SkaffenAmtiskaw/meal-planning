import { closeAuth, connectAuth } from '#auth';
import { connectDatabase, disconnectDatabase } from '#factories/connection';
import { env } from '@/env';

import { databaseNameOf, isDevDatabase } from './databaseNames';

// Opens the seed's connections, only to a dev database: `test`, or a worktree's `test-<n>`. The name
// is checked before connecting, because mongoose creates each imported model's collections and
// indexes as soon as it connects.
export const connectDevDatabase = async () => {
	const databaseName = databaseNameOf(env.DB_URL);
	if (!isDevDatabase(databaseName)) {
		throw new Error(
			`The seed only runs against the "test" database or a worktree's "test-<n>", but DB_URL points at "${databaseName}".`,
		);
	}

	await connectDatabase();
	await connectAuth();
};

export const closeDevDatabase = async () => {
	await disconnectDatabase();
	await closeAuth();
};
