'use server';

import type { Types } from 'mongoose';

import { getUser } from '@/_actions/user';
import { Planner } from '@/_models';
import type { AccessLevel } from '@/_models/user';

export type PlannerWithAccess = {
	planner: {
		_id: Types.ObjectId;
		name: string;
		calendar: unknown[];
		saved: unknown[];
		tags: unknown[];
	};
	accessLevel: AccessLevel;
};

export const getPlanners = async (): Promise<PlannerWithAccess[]> => {
	const user = await getUser();

	if (!user) throw new Error('No user found');

	const planners = await Planner.find({
		_id: { $in: user.planners.map(({ planner }) => planner) },
	});

	const unnamed = planners.filter((p) => !p.name);

	await Promise.all(
		unnamed.map((p) =>
			Planner.collection.updateOne(
				{ _id: p._id },
				{ $set: { name: `${user.name}'s Planner` } },
			),
		),
	);

	for (const p of unnamed) {
		p.name = `${user.name}'s Planner`;
	}

	const plannerAccessMap = new Map(
		user.planners.map(({ planner, accessLevel }) => [
			planner.toString(),
			accessLevel,
		]),
	);

	return planners.map((planner) => ({
		planner: {
			_id: planner._id,
			name: planner.name ?? `${user.name}'s Planner`,
			calendar: planner.calendar,
			saved: planner.saved,
			tags: planner.tags,
		},
		accessLevel: plannerAccessMap.get(planner._id.toString()) ?? 'read',
	}));
};
