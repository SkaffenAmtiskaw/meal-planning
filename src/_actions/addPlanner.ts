'use server';

import { Planner } from '@/_models';

export const addPlanner = async () => {
	return await Planner.create({
		calendar: [],
		saved: [],
		tags: [],
	});
};
