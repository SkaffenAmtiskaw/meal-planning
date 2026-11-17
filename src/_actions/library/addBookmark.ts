'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { BookmarkInterface } from '@/_models/library';
import { zBookmarkFormSchema } from '@/_models/library';
import type { ActionResult } from '@/_utils/actionResult';

export const addBookmark = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const { plannerId, notes, ...requiredFields } =
		zBookmarkFormSchema.parse(data);
	// The form starts notes at '', which would be stored as an empty string.
	const bookmarkFields = { ...requiredFields, ...(notes ? { notes } : {}) };

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const bookmark: BookmarkInterface = { _id: newId(), ...bookmarkFields };
	const result = await planners.updateOne(
		{ _id: plannerId },
		{ $push: { saved: bookmark } },
	);
	if (result.matchedCount === 0)
		return { ok: false, error: 'Planner not found' };

	return { ok: true, data: { _id: bookmark._id, name: bookmark.name } };
};
