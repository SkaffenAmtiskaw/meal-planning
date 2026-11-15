import { MongoClient } from 'mongodb';

import { env } from '@/env';

const globalWithClient = globalThis as typeof globalThis & {
	mongoClient?: MongoClient;
};

/**
 * A dev hot reload runs this file again, so in development the client is kept on globalThis to stop each reload
 * opening another, as Next.js's MongoDB example does. Elsewhere this file runs once per process.
 */
const createClient = () => {
	if (process.env.NODE_ENV !== 'development') {
		return new MongoClient(env.DB_URL);
	}
	globalWithClient.mongoClient ??= new MongoClient(env.DB_URL);
	return globalWithClient.mongoClient;
};

const client = createClient();

/**
 * The raw database handle, for the code that works below the schemas: better-auth's adapter, which gets no client
 * so it runs no transactions, and the tools that clear a database.
 */
export const rawDatabase = client.db();

// The same keys and options Mongoose builds from the User schema, so both can create them.
const createIndexes = async () => {
	const users = rawDatabase.collection('users');
	await Promise.all([
		users.createIndex({ email: 1 }, { unique: true }),
		users.createIndex({ 'planners.planner': 1 }),
	]);
};

export const connectDatabase = async () => {
	await client.connect();
	await createIndexes();
};

export const closeDatabase = async () => {
	await client.close();
};
