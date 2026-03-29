'use server';

import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';

const zUpdateRecipeNotesSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
	notes: z.string(),
});

export const updateRecipeNotes = async (
	data: unknown,
): Promise<ActionResult> => {
	const { plannerId, recipeId, notes } = zUpdateRecipeNotesSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const update = notes
		? { $set: { 'saved.$.notes': notes } }
		: { $unset: { 'saved.$.notes': '' } };

	const result = await Planner.collection.updateOne(
		{
			_id: new Types.ObjectId(plannerId),
			'saved._id': new Types.ObjectId(recipeId),
		},
		update,
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	revalidatePath(`/${plannerId}/recipes/${recipeId}`);

	return { ok: true, data: undefined };
};
