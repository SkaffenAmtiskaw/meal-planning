import type { PlannerInterface } from '@/_models/planner';
import { Planner } from '@/_models/planner';

export const createPlanner = async (
	overrides: Partial<PlannerInterface> = {},
) =>
	await Planner.create({
		calendar: [],
		saved: [],
		tags: [],
		...overrides,
	});
