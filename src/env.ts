import { createEnv } from '@t3-oss/env-nextjs';

import { z } from 'zod';

export const env = createEnv({
	server: {
		DB_URL: z.url(),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.url(),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		RESEND_API_KEY: z.string().min(1),
		RESEND_FROM_EMAIL: z.email(),
	},
	client: {
		NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
		// Only Vercel's Production environment sets these, so they're optional everywhere else
		NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().min(1).optional(),
		NEXT_PUBLIC_VERCEL_ENV: z.string().min(1).optional(),
	},
	runtimeEnv: {
		DB_URL: process.env.DB_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
		NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
			process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
	},
});
