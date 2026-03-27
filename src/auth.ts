import { betterAuth } from 'better-auth';
import { oneTap } from 'better-auth/plugins';

import { env } from './env';

export const auth = betterAuth({
	plugins: [oneTap()],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
});
