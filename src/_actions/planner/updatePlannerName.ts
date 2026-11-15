'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models/planner';
import type { ActionResult } from '@/_utils/actionResult';
import { zId } from '@/_utils/zId';
import { zSafeString } from '@/_utils/zSafeString';

export const updatePlannerName = async (
	id: string,
	name: string,
): Promise<ActionResult> => {
	const parsedId = zId.safeParse(id);
	if (!parsedId.success) return { ok: false, error: 'Invalid planner ID.' };

	const parsedName = zSafeString().safeParse(name);
	if (!parsedName.success)
		return { ok: false, error: parsedName.error.issues[0].message };

	const auth = await checkAuth(parsedId.data, 'admin');
	if (auth.type === 'unauthenticated')
		return { ok: false, error: 'Not authenticated.' };
	if (auth.type !== 'authorized')
		return { ok: false, error: 'Not authorized.' };

	await Planner.collection.updateOne({ _id: parsedId.data } as object, {
		$set: { name: parsedName.data },
	});

	return { ok: true, data: undefined };
};
