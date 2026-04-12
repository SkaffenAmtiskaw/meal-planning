'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import { TAG_COLOR_NAMES } from '@/_theme/colors';
import type { ActionResult } from '@/_utils/actionResult';

export const addTag = async (
	plannerId: string,
	name: string,
): Promise<ActionResult<{ _id: string; name: string; color: string }>> => {
	const auth = await checkAuth(new Types.ObjectId(plannerId), 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const color = TAG_COLOR_NAMES[planner.tags.length % TAG_COLOR_NAMES.length];
	const tagId = new Types.ObjectId();

	const update: Record<string, unknown> = {
		$push: { tags: { _id: tagId, name, color } },
	};

	await Planner.collection.updateOne(
		{ _id: new Types.ObjectId(plannerId) },
		update,
	);

	return { ok: true, data: { _id: tagId.toString(), name, color } };
};
