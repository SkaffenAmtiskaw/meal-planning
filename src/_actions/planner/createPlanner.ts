'use server';

import { getUser } from '@/_actions/user';
import { newId } from '@/_models/database/newId';
import { User } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';
import { catchify } from '@/_utils/catchify';
import { isNoSessionError } from '@/_utils/noSessionError';
import { reportError } from '@/_utils/reportError';
import { zSafeString } from '@/_utils/zSafeString';

import { addPlanner } from './addPlanner';

export const createPlanner = async (name: string): Promise<ActionResult> => {
	const parsedName = zSafeString().safeParse(name);
	if (!parsedName.success)
		return { ok: false, error: parsedName.error.issues[0].message };

	const [user, userError] = await catchify(getUser);
	if (userError && !isNoSessionError(userError)) await reportError(userError);
	if (!user) return { ok: false, error: 'Not authenticated.' };

	const planner = await addPlanner(parsedName.data);

	// A raw collection call adds no _id, unlike a push through Mongoose.
	const update: Record<string, unknown> = {
		$push: {
			planners: {
				_id: newId(),
				planner: planner._id,
				accessLevel: 'owner',
			},
		},
	};

	await User.collection.updateOne({ _id: user._id } as object, update);

	return { ok: true, data: undefined };
};
