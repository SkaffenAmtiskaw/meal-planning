'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { Planner } from '@/_models/planner';
import { TAG_COLOR_NAMES } from '@/_theme/colors';
import type { ActionResult } from '@/_utils/actionResult';

export const addTag = async (
	plannerId: string,
	name: string,
): Promise<ActionResult<{ _id: string; name: string; color: string }>> => {
	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const color = TAG_COLOR_NAMES[planner.tags.length % TAG_COLOR_NAMES.length];
	const tagId = newId();

	const update: Record<string, unknown> = {
		$push: { tags: { _id: tagId, name, color } },
	};

	await Planner.collection.updateOne({ _id: plannerId } as object, update);

	return { ok: true, data: { _id: tagId.toString(), name, color } };
};
