import { MongoClient } from 'mongodb';

import { closeAuth, connectAuth } from '#auth';
import { connectDatabase, disconnectDatabase } from '#factories/connection';
import { env } from '@/env';

const DEV_DATABASE = 'test';

// Opens the seed's connections, only to the dev database. The name is checked before connecting,
// because mongoose creates each imported model's collections and indexes as soon as it connects.
export const connectDevDatabase = async () => {
	// The driver's own parsing of DB_URL, which opens no connection. Both connections take the database from it.
	const { databaseName } = new MongoClient(env.DB_URL).db();
	if (databaseName !== DEV_DATABASE) {
		throw new Error(
			`The seed only runs against the "${DEV_DATABASE}" database, but DB_URL points at "${databaseName}".`,
		);
	}

	await connectDatabase();
	await connectAuth();

	return databaseName;
};

export const closeDevDatabase = async () => {
	await disconnectDatabase();
	await closeAuth();
};
