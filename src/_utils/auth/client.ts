import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { env } from '@/env';

export const client = createAuthClient({
	plugins: [
		oneTapClient({
			clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
			autoSelect: true,
			context: 'signin',
		}),
	],
});
