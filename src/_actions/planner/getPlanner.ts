'use server';

import { Planner } from '@/_models/planner';

export const getPlanner = async (id: string) => {
	const planner = await Planner.findById(id);

	if (!planner) {
		throw new Error(`Planner ${id} not found`);
	}

	return planner;
};
