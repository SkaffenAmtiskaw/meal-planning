import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { PlannerInterface } from '@/_models/planner';

import { withoutUndefined } from './withoutUndefined';

export const createPlanner = async (
	overrides: Partial<PlannerInterface> = {},
) => {
	const planner: PlannerInterface = {
		_id: newId(),
		calendar: [],
		saved: [],
		tags: [],
		...withoutUndefined(overrides),
	};
	await planners.insertOne(planner);
	return planner;
};
