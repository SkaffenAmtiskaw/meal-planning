'use server';

import type { Types } from 'mongoose';

import { addPlanner } from '@/_actions';
import { User } from '@/_models';

export const addUser = async (
	email: string,
	plannerId?: Types.ObjectId,
	name?: string,
) => {
	const isNewPlanner = !plannerId;
	const id = isNewPlanner ? (await addPlanner())._id : plannerId;

	return await User.create({
		email,
		name: name ?? 'New User',
		planners: [{ planner: id, accessLevel: isNewPlanner ? 'owner' : 'read' }],
	});
};
