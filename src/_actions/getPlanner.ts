'use server';

import type { Types } from 'mongoose';

import { Planner } from '@/_models';

export const getPlanner = async (id: Types.ObjectId) => {
	const planner = await Planner.findById(id);

	if (!planner) {
		throw new Error(`Planner ${id} not found`);
	}

	return planner;
};
