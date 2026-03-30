'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import type { BookmarkInterface } from '@/_models/planner/bookmark.types';
import { zBookmarkFormSchema } from '@/_models/planner/bookmark.types';
import type { ActionResult } from '@/_utils/actionResult';

export const addBookmark = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const { plannerId, ...bookmarkFields } = zBookmarkFormSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const insertIndex = planner.saved.length;
	planner.saved.push({ ...bookmarkFields } as unknown as BookmarkInterface);
	await planner.save();

	return {
		ok: true,
		data: {
			_id: String(planner.saved[insertIndex]._id),
			name: bookmarkFields.name,
		},
	};
};
