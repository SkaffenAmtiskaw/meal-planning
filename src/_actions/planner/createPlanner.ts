'use server';

import { getUser } from '@/_actions/user';
import { isNoSessionError } from '@/_actions/user/noSessionError';
import { newId } from '@/_models/database/newId';
import { users } from '@/_models/database/users';
import type { PlannerMembership } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';
import { catchify } from '@/_utils/catchify';
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

	const membership: PlannerMembership = {
		_id: newId(),
		planner: planner._id,
		accessLevel: 'owner',
	};
	await users.updateOne({ _id: user._id }, { $push: { planners: membership } });

	return { ok: true, data: undefined };
};
