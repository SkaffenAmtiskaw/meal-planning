'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
import { zBookmarkFormSchema } from '@/_models/library';
import type { ActionResult } from '@/_utils/actionResult';

const zEditBookmarkSchema = zBookmarkFormSchema.extend({ _id: z.string() });

export const editBookmark = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const {
		plannerId,
		_id: bookmarkId,
		name,
		url,
		tags,
		notes,
	} = zEditBookmarkSchema.parse(data);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

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

	revalidatePath(`/${plannerId}/recipes`);

	return { ok: true, data: { _id: bookmarkId, name } };
};
