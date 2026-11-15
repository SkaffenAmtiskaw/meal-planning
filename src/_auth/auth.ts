import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, oneTap } from 'better-auth/plugins';

import { rawDatabase } from '@/_models/database/connection';
import { env } from '@/env';

import { sendResetPasswordEmail, sendVerificationEmail } from './emails';

export const auth = betterAuth({
	database: mongodbAdapter(rawDatabase),
	plugins: [oneTap(), admin()],
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 30,
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
