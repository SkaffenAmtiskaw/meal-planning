import { checkedCollection } from './checkedCollection';
import { rawDatabase } from './connection';

import type { UserInterface } from '../user/user.types';
import { zUserInterface } from '../user/user.types';

const collection = rawDatabase.collection<UserInterface>('users');

export const users = checkedCollection(collection, zUserInterface);

// The same keys and options Mongoose builds from the User schema, so both can create them.
export const createUsersIndexes = async () => {
	await Promise.all([
		collection.createIndex({ email: 1 }, { unique: true }),
		collection.createIndex({ 'planners.planner': 1 }),
	]);
};
