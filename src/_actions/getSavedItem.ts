'use server';

import type { Types } from 'mongoose';

import { getPlanner } from './getPlanner';

export const getSavedItem = async (
	plannerId: Types.ObjectId,
	itemId: Types.ObjectId,
) => {
	const planner = await getPlanner(plannerId);

	const item = planner.saved.find((p) => p._id === itemId);

	if (!item) {
		throw new Error(`Item ${itemId} not found in planner ${plannerId}`);
	}

	return item;
};
