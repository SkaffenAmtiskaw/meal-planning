import { test as base } from '@playwright/test';

import { closeAuth, connectAuth } from '#auth';
import { connectDatabase, disconnectDatabase } from '#factories/connection';

export { expect } from '@playwright/test';

export { signIn } from './signIn';

export const test = base.extend<object, { databaseConnections: undefined }>({
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
