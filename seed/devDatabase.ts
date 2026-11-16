import { connectDatabase, disconnectDatabase } from '#factories/connection';
import { env } from '@/env';

import { databaseNameOf, isDevDatabase } from './databaseNames';

/**
 * Opens the seed's connection, only to a dev database: `test`, or a worktree's `test-<n>`. The name
 * is checked before connecting, because connecting creates the data module's indexes, and
 * better-auth's adapter creates its collections, in whatever database `DB_URL` names.
 */
export const connectDevDatabase = async () => {
	const databaseName = databaseNameOf(env.DB_URL);
	if (!isDevDatabase(databaseName)) {
		throw new Error(
			`The seed only runs against the "test" database or a worktree's "test-<n>", but DB_URL points at "${databaseName}".`,
		);
	}

	await connectDatabase();
};

export const closeDevDatabase = async () => {
	await disconnectDatabase();
};
