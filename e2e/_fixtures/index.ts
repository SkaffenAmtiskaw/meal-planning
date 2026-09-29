import { test as base } from '@playwright/test';

import { closeAuth, connectAuth } from '../../test/auth';
import {
	connectDatabase,
	disconnectDatabase,
} from '../../test/factories/connection';

export { expect } from '@playwright/test';
export { signIn } from './signIn';

export const test = base.extend<object, { databaseConnections: void }>({
	// Opens each worker's connections for the factories and signIn, and closes them when the worker ends.
	databaseConnections: [
		async ({}, use) => {
			await Promise.all([connectDatabase(), connectAuth()]);
			await use();
			await Promise.all([disconnectDatabase(), closeAuth()]);
		},
		{ scope: 'worker', auto: true },
	],
});
