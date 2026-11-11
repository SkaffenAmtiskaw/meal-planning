import { defineConfig, devices } from '@playwright/test';

import type { env } from '@/env';

import packageJson from './package.json' with { type: 'json' };

// Not the barrel: it loads #auth, which reads @/env before the E2E values below are set.
import { freePort } from './e2e/_fixtures/freePort';

// Picked once per run: the main process picks it, and each worker loads this file again and finds
// it in process.env.
process.env.E2E_PORT ??= await freePort();
const port = process.env.E2E_PORT;
const baseURL = `http://localhost:${port}`;

// Every app variable gets an E2E value here, so none falls back to .env.local. DB_URL comes from the memory server.
// RESEND_BASE_URL comes from the fake Resend server. It isn't in src/env.ts: the Resend SDK reads it on its own.
const e2eEnv = {
	BETTER_AUTH_SECRET: 'e2e-dummy-secret-at-least-32-characters',
	BETTER_AUTH_URL: baseURL,
	GOOGLE_CLIENT_ID: 'e2e-google-client-id',
	GOOGLE_CLIENT_SECRET: 'e2e-google-client-secret',
	RESEND_API_KEY: 'e2e-resend-api-key',
	RESEND_FROM_EMAIL: 'e2e@example.com',
	NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'e2e-google-client-id',
	// Reporting is on only in production, so the token is never used
	NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: 'e2e-posthog-project-token',
	NEXT_PUBLIC_VERCEL_ENV: 'development',
} satisfies Record<Exclude<keyof typeof env, 'DB_URL'>, string>;

Object.assign(process.env, e2eEnv);

export default defineConfig({
	testDir: 'e2e',
	reporter: [['list'], ['html', { open: 'never' }]],
	use: { baseURL },
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'] },
			grepInvert: /@phone-only/,
		},
		{
			name: 'phone',
			use: { ...devices['Pixel 7'] },
			grepInvert: /@desktop-only/,
		},
	],
	webServer: [
		{
			name: 'MemoryServer',
			command: 'node e2e/_fixtures/memoryServer.ts',
			// Forces the pinned mongod over any MONGOMS_* variables set in the shell.
			env: {
				MONGOMS_VERSION: packageJson.config.mongodbMemoryServer.version,
				MONGOMS_SYSTEM_BINARY: '',
				MONGOMS_DOWNLOAD_URL: '',
				MONGOMS_ARCHIVE_NAME: '',
			},
			wait: { stdout: /Memory server ready at (?<db_url>mongodb:\/\/\S+)/ },
			stdout: 'pipe',
		},
		{
			name: 'FakeResend',
			command: 'node e2e/_fixtures/fakeResend.ts',
			wait: {
				stdout: /Fake Resend ready at (?<resend_base_url>http:\/\/\S+)/,
			},
			stdout: 'pipe',
		},
		{
			name: 'Next',
			command: `next build && next start -p ${port}`,
			url: baseURL,
			reuseExistingServer: false,
			timeout: 120_000,
			stdout: 'pipe',
		},
	],
});
