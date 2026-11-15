import { test as base } from '@playwright/test';

import { connectDatabase, disconnectDatabase } from '#factories/connection';

export const test = base.extend<object, { databaseConnections: undefined }>({
	// Opens each worker's connections for the factories and signIn, and closes them when the worker ends.
	databaseConnections: [
		// biome-ignore lint/correctness/noEmptyPattern: Playwright reads a fixture's dependencies from this destructuring, and this fixture has none.
		async ({}, use) => {
			await connectDatabase();
			await use(undefined);
			await disconnectDatabase();
		},
		{ scope: 'worker', auto: true },
	],
});
