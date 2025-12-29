import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
	plugins: [
		oneTapClient({
			// biome-ignore lint/style/noNonNullAssertion: mandatory environment variable
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
			autoSelect: true,
			context: 'signin',
		}),
	],
});
