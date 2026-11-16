'use server';

import { planners } from '@/_models/database/planners';

export const getPlanner = async (id: string) => {
	const planner = await planners.findOne({ _id: id });

	if (!planner) {
		throw new Error(`Planner ${id} not found`);
	}

	return planner;
};
