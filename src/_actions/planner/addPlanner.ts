'use server';

import { Planner } from '@/_models';

export const addPlanner = async (name?: string) => {
	return await Planner.create({
		name,
		calendar: [],
		saved: [],
		tags: [],
	});
};
