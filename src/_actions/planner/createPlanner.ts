'use server';

import { getUser } from '@/_actions/user';
import { User } from '@/_models';
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
		$push: { planners: planner._id },
	};

	await User.collection.updateOne({ _id: user._id }, update);

	return { ok: true, data: undefined };
};
