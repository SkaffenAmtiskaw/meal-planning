'use server';

import { Planner } from '@/_models';

export const createPlanner = async () => {
	return await Planner.create({
		calendar: [],
		saved: [],
		tags: [],
	});
};
