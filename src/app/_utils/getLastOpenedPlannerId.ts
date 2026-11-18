import { cookies } from 'next/headers';

import type { PlannerMembership } from '@/_models/user';

/**
 * The planner the user last opened, from the `lastOpenedPlanner` cookie, if
 * they're still a member of it. Otherwise their first planner. Expects at
 * least one planner.
 */
export const getLastOpenedPlannerId = async (planners: PlannerMembership[]) => {
	const cookieStore = await cookies();
	const lastPlannerId = cookieStore.get('lastOpenedPlanner')?.value;
	const isMember = planners.some(({ planner }) => planner === lastPlannerId);
	return isMember && lastPlannerId ? lastPlannerId : planners[0].planner;
};
