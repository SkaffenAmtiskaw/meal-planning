'use server';

import type { Types } from 'mongoose';

import { User } from '@/_models';

import { addPlanner } from './addPlanner';

export const addUser = async (email: string, plannerId?: Types.ObjectId) => {
	const id = plannerId ? plannerId : (await addPlanner())._id;

	return await User.create({
		email,
		planners: [id],
	});
};
