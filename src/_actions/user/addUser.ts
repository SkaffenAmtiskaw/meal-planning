'use server';

import type { Types } from 'mongoose';

import { addPlanner } from '@/_actions';
import { User } from '@/_models';

export const addUser = async (
	email: string,
	plannerId?: Types.ObjectId,
	name?: string,
) => {
	const id = plannerId ? plannerId : (await addPlanner())._id;

	return await User.create({
		email,
		name: name ?? 'New User',
		planners: [id],
	});
};
