import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, testUtils } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

import { env } from '@/env';

const mongoClient = new MongoClient(env.DB_URL);

// Test-only instance: testUtils never goes on the app's instance in src/_auth.
export const auth = betterAuth({
	database: mongodbAdapter(mongoClient.db()),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins: [testUtils(), admin()],
});

export const connectAuth = async () => {
	await mongoClient.connect();
};

export const closeAuth = async () => {
	await mongoClient.close();
};
