'use server';

import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import { zBookmarkFormSchema } from '@/_models/planner/bookmark.types';
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

	const auth = await checkAuth(new Types.ObjectId(plannerId), 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const $set: Record<string, unknown> = {
		'saved.$.name': name,
		'saved.$.url': url,
		'saved.$.tags': tags.map((t) => new Types.ObjectId(String(t))),
	};
	const updateOp: Record<string, unknown> = { $set };
	if (notes) {
		$set['saved.$.notes'] = notes;
	} else {
		updateOp.$unset = { 'saved.$.notes': '' };
	}

	const result = await Planner.collection.updateOne(
		{
			_id: new Types.ObjectId(plannerId),
			'saved._id': new Types.ObjectId(bookmarkId),
		},
		updateOp,
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Bookmark not found' };

	revalidatePath(`/${plannerId}/recipes`);

	return { ok: true, data: { _id: bookmarkId, name } };
};
