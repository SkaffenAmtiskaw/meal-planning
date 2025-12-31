'use server';

import type { Types } from 'mongoose';

import { User } from '@/_models';

import { createPlanner } from './createPlanner';

export const createUser = async (email: string, plannerId?: Types.ObjectId) => {
	const id = plannerId ? plannerId : (await createPlanner())._id;

	return await User.create({
		email,
		planner: [id],
	});
};
