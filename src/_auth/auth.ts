import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { oneTap } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

import { env } from '@/env';

import { sendResetPasswordEmail, sendVerificationEmail } from './emails';

export const mongoClient = new MongoClient(env.DB_URL);

export const auth = betterAuth({
	database: mongodbAdapter(mongoClient.db()),
	plugins: [oneTap()],
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7,
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: sendResetPasswordEmail,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail,
	},
});
