import { checkedCollection } from './checkedCollection';
import { rawDatabase } from './connection';

import type { UserInterface } from '../user/user.types';
import { zUserInterface } from '../user/user.types';

const collection = rawDatabase.collection<UserInterface>('users');

export const users = checkedCollection(collection, zUserInterface);

export const createUsersIndexes = async () => {
	await Promise.all([
		collection.createIndex({ email: 1 }, { unique: true }),
		collection.createIndex({ 'planners.planner': 1 }),
	]);
};
