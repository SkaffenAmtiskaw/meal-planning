'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import type { BookmarkInterface } from '@/_models/library';
import { zBookmarkFormSchema } from '@/_models/library';
import { Planner } from '@/_models/planner';
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

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const bookmark: BookmarkInterface = { _id: newId(), ...bookmarkFields };
	planner.saved.push(bookmark);
	await planner.save();

	return { ok: true, data: { _id: bookmark._id, name: bookmark.name } };
};
