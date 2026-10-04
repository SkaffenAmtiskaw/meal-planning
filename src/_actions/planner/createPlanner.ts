'use server';

import { Types } from 'mongoose';

import { getUser } from '@/_actions/user';
import { User } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';
import { catchify } from '@/_utils/catchify';
import { zSafeString } from '@/_utils/zSafeString';

import { addPlanner } from './addPlanner';

export const createPlanner = async (name: string): Promise<ActionResult> => {
	const parsedName = zSafeString().safeParse(name);
	if (!parsedName.success)
		return { ok: false, error: parsedName.error.issues[0].message };

	const [user] = await catchify(getUser);
	if (!user) return { ok: false, error: 'Not authenticated.' };

	const planner = await addPlanner(parsedName.data);

	const update: Record<string, unknown> = {
		$push: { planners: { planner: planner._id, accessLevel: 'owner' } },
	};

	// getUser returns a serialized user, and a raw collection call doesn't cast its string _id.
	await User.collection.updateOne(
		{ _id: new Types.ObjectId(user._id) },
		update,
	);

	return { ok: true, data: undefined };
};
