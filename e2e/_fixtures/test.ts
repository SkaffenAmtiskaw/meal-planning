import { test as base } from '@playwright/test';

import { closeAuth, connectAuth } from '#auth';
import { connectDatabase, disconnectDatabase } from '#factories/connection';

export const test = base.extend<object, { databaseConnections: undefined }>({
	// Gives each test its own client IP. better-auth rate-limits by IP in a production build, so tests sharing
	// one would run into its limits, such as three sign-ups in 10 seconds.
	extraHTTPHeaders: async ({ extraHTTPHeaders }, use) => {
		const octet = () => Math.floor(Math.random() * 254) + 1;
		await use({
			...extraHTTPHeaders,
			'X-Forwarded-For': `10.${octet()}.${octet()}.${octet()}`,
		});
	},
	// Opens each worker's connections for the factories and signIn, and closes them when the worker ends.
	databaseConnections: [
		// biome-ignore lint/correctness/noEmptyPattern: Playwright reads a fixture's dependencies from this destructuring, and this fixture has none.
		async ({}, use) => {
			await Promise.all([connectDatabase(), connectAuth()]);
			await use(undefined);
			await Promise.all([disconnectDatabase(), closeAuth()]);
		},
		{ scope: 'worker', auto: true },
	],
});
