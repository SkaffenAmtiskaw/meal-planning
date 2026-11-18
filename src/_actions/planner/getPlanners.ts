'use server';

import { getUser } from '@/_actions/user';
import { planners } from '@/_models/database/planners';
import type { PlannerInterface } from '@/_models/planner';
import type { AccessLevel } from '@/_models/user';

type PlannerWithAccess = {
	planner: PlannerInterface & { name: string };
	accessLevel: AccessLevel;
};

export const getPlanners = async (): Promise<PlannerWithAccess[]> => {
	const user = await getUser();

	if (!user) throw new Error('No user found');

	const found = await planners
		.find({ _id: { $in: user.planners.map((p) => p.planner) } })
		.toArray();

	const defaultName = `${user.name}'s Planner`;

	await Promise.all(
		found
			.filter((p) => !p.name)
			.map((p) =>
				planners.updateOne({ _id: p._id }, { $set: { name: defaultName } }),
			),
	);

	const plannerAccessMap = new Map(
		user.planners.map((p) => [p.planner, p.accessLevel]),
	);

	return found.map((planner) => ({
		planner: {
			_id: planner._id,
			name: planner.name ?? defaultName,
			calendar: planner.calendar,
			saved: planner.saved,
			tags: planner.tags,
		},
		accessLevel: plannerAccessMap.get(planner._id) ?? 'read',
	}));
};
