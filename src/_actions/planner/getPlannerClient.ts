'use server';

import type { PlannerInterface } from '@/_models';

import { getPlanner } from './getPlanner';

export const getPlannerClient = async (
	id: string,
): Promise<PlannerInterface> => {
	const planner = await getPlanner(id);

	return JSON.parse(JSON.stringify(planner.toObject()));
};
