'use server';

import { newId } from '@/_models/database/newId';
import type { PlannerInterface } from '@/_models/planner';
import { Planner } from '@/_models/planner';

export const addPlanner = async (name?: string) => {
	const planner: PlannerInterface = {
		_id: newId(),
		...(name && { name }),
		calendar: [],
		saved: [],
		tags: [],
	};
	return await Planner.create(planner);
};
