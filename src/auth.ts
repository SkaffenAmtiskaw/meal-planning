import { betterAuth } from 'better-auth';
import { oneTap } from 'better-auth/plugins';

export const auth = betterAuth({
	plugins: [oneTap()],
	socialProviders: {
		google: {
			// biome-ignore lint/style/noNonNullAssertion: mandatory environment variable
			clientId: process.env.GOOGLE_CLIENT_ID!,
			// biome-ignore lint/style/noNonNullAssertion: mandatory environment variable
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
});
