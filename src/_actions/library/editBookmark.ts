'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';

import { zBookmarkInput } from './bookmarkInput';

const zEditBookmarkSchema = zBookmarkInput.extend({ _id: z.string() });

export const editBookmark = defineMutation({
	schema: zEditBookmarkSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, _id: bookmarkId, name, url, tags, notes }) => {
		const $set: Record<string, unknown> = {
			'saved.$.name': name,
			'saved.$.url': url,
			'saved.$.tags': tags,
		};
		const updateOp: Record<string, unknown> = { $set };
		if (notes) {
			$set['saved.$.notes'] = notes;
		} else {
			updateOp.$unset = { 'saved.$.notes': '' };
		}

		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': bookmarkId },
			updateOp,
		);

		if (result.matchedCount === 0)
			return { ok: false, error: 'Bookmark not found' };

		return { ok: true, data: { _id: bookmarkId, name } };
	},
});
