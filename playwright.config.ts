import { defineConfig, devices } from '@playwright/test';

import type { env } from '@/env';

import packageJson from './package.json' with { type: 'json' };

const baseURL = 'http://localhost:3100';

// Every app variable gets an E2E value here, so none falls back to .env.local. DB_URL comes from the memory server.
const e2eEnv = {
	BETTER_AUTH_SECRET: 'e2e-dummy-secret-at-least-32-characters',
	BETTER_AUTH_URL: baseURL,
	GOOGLE_CLIENT_ID: 'e2e-google-client-id',
	GOOGLE_CLIENT_SECRET: 'e2e-google-client-secret',
	RESEND_API_KEY: 'e2e-resend-api-key',
	RESEND_FROM_EMAIL: 'e2e@example.com',
	NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'e2e-google-client-id',
} satisfies Record<Exclude<keyof typeof env, 'DB_URL'>, string>;

Object.assign(process.env, e2eEnv);

export default defineConfig({
	testDir: 'e2e',
	reporter: [['list'], ['html', { open: 'never' }]],
	use: { baseURL },
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'phone', use: { ...devices['Pixel 7'] } },
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
			name: 'Next',
			command: 'next build && next start -p 3100',
			url: baseURL,
			reuseExistingServer: false,
			timeout: 120_000,
			stdout: 'pipe',
		},
	],
});
