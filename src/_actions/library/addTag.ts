'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { TagInterface } from '@/_models/library';
import { TAG_COLOR_NAMES } from '@/_theme/colors';
import type { ActionResult } from '@/_utils/actionResult';

export const addTag = async (
	plannerId: string,
	name: string,
): Promise<ActionResult<{ _id: string; name: string; color: string }>> => {
	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await planners.findOne({ _id: plannerId });
	if (!planner) return { ok: false, error: 'Planner not found' };

	const tag: TagInterface = {
		_id: newId(),
		name,
		color: TAG_COLOR_NAMES[planner.tags.length % TAG_COLOR_NAMES.length],
	};

	await planners.updateOne({ _id: plannerId }, { $push: { tags: tag } });

	return { ok: true, data: tag };
};
