'use server';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
import type { ActionResult } from '@/_utils/actionResult';

const zDeleteBookmarkSchema = z.object({
	plannerId: z.string(),
	bookmarkId: z.string(),
});

export const deleteBookmark = async (data: unknown): Promise<ActionResult> => {
	const { plannerId, bookmarkId } = zDeleteBookmarkSchema.parse(data);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const result = await planners.updateOne(
		{ _id: plannerId, 'saved._id': bookmarkId },
		{ $pull: { saved: { _id: bookmarkId } } },
	);
	if (result.matchedCount === 0)
		return { ok: false, error: 'Bookmark not found' };

	return { ok: true, data: undefined };
};
