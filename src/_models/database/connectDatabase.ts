import { rawDatabase } from './connection';
import { createUsersIndexes } from './users';

/** Connects the data module's one client and creates each collection's indexes, which the E2E database starts without. */
export const connectDatabase = async () => {
	await rawDatabase.client.connect();
	await createUsersIndexes();
};
