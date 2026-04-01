import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { oneTap } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';

import { env } from './env';

export const mongoClient = new MongoClient(env.DB_URL);
const resend = new Resend(env.RESEND_API_KEY);

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
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: env.RESEND_FROM_EMAIL,
				to: user.email,
				subject: 'Verify your Meal Planner email',
				html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
			});
		},
	},
});
