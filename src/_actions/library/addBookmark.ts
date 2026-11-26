'use server';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { BookmarkInterface } from '@/_models/library';

import { zBookmarkInput } from './bookmarkInput';

export const addBookmark = defineMutation({
	schema: zBookmarkInput,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, notes, ...requiredFields }) => {
		// The form starts notes at '', which would be stored as an empty string.
		const bookmarkFields = { ...requiredFields, ...(notes ? { notes } : {}) };

		const bookmark: BookmarkInterface = { _id: newId(), ...bookmarkFields };
		const result = await planners.updateOne(
			{ _id: plannerId },
			{ $push: { saved: bookmark } },
		);
		if (result.matchedCount === 0)
			return { ok: false, error: 'Planner not found' };

		return { ok: true, data: { _id: bookmark._id, name: bookmark.name } };
	},
});
