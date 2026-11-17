import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, testUtils } from 'better-auth/plugins';

import { rawDatabase } from '@/_models/database/connection';
import { env } from '@/env';

// Test-only instance: testUtils never goes on the app's instance in src/_auth.
export const auth = betterAuth({
	database: mongodbAdapter(rawDatabase),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins: [testUtils(), admin()],
});
