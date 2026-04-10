'use server';

import { getUser } from '@/_actions/user';
import { Planner } from '@/_models';

export const getPlanners = async () => {
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

	return planners;
};
