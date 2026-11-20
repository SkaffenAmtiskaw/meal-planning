'use server';

import { getUser } from '@/_actions/user';
import { planners } from '@/_models/database/planners';
import type { PlannerInterface } from '@/_models/planner';
import type { AccessLevel } from '@/_models/user';

type PlannerWithAccess = {
	planner: PlannerInterface;
	accessLevel: AccessLevel;
};

export const getPlanners = async (): Promise<PlannerWithAccess[]> => {
	const user = await getUser();

	if (!user) throw new Error('No user found');

	const found = await planners
		.find({ _id: { $in: user.planners.map((p) => p.planner) } })
		.toArray();

	const plannerAccessMap = new Map(
		user.planners.map((p) => [p.planner, p.accessLevel]),
	);

	return found.map((planner) => ({
		planner: {
			_id: planner._id,
			name: planner.name,
			calendar: planner.calendar,
			saved: planner.saved,
			tags: planner.tags,
		},
		accessLevel: plannerAccessMap.get(planner._id) ?? 'read',
	}));
};
