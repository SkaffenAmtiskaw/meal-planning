'use server';

import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { PlannerInterface } from '@/_models/planner';

export const addPlanner = async (name?: string) => {
	const planner: PlannerInterface = {
		_id: newId(),
		...(name && { name }),
		calendar: [],
		saved: [],
		tags: [],
	};
	await planners.insertOne(planner);
	return planner;
};
