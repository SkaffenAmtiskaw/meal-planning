'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';

const zDeleteBookmarkSchema = z.object({
	plannerId: z.string(),
	bookmarkId: z.string(),
});

export const deleteBookmark = defineMutation({
	schema: zDeleteBookmarkSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, bookmarkId }) => {
		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': bookmarkId },
			{ $pull: { saved: { _id: bookmarkId } } },
		);
		if (result.matchedCount === 0)
			return { ok: false, error: 'Bookmark not found' };

		return { ok: true, data: undefined };
	},
});
