'use server';

import { Types } from 'mongoose';

import { getUser } from '@/_actions/user';
import { Planner, zObjectId } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';
import { catchify } from '@/_utils/catchify';
import { zSafeString } from '@/_utils/zSafeString';

export const updatePlannerName = async (
	id: string,
	name: string,
): Promise<ActionResult> => {
	const parsedId = zObjectId.safeParse(id);
	if (!parsedId.success) return { ok: false, error: 'Invalid planner ID.' };

	const parsedName = zSafeString().safeParse(name);
	if (!parsedName.success)
		return { ok: false, error: parsedName.error.issues[0].message };

	const [user] = await catchify(getUser);
	if (!user) return { ok: false, error: 'Not authenticated.' };

	const authorized = user.planners.some((p) => String(p) === id);
	if (!authorized) return { ok: false, error: 'Not authorized.' };

	await Planner.collection.updateOne(
		{ _id: new Types.ObjectId(id) },
		{ $set: { name: parsedName.data } },
	);

	return { ok: true, data: undefined };
};
