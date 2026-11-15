'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models/planner';
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

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const update = notes
		? { $set: { 'saved.$.notes': notes } }
		: { $unset: { 'saved.$.notes': '' } };

	const result = await Planner.collection.updateOne(
		{ _id: plannerId, 'saved._id': recipeId } as object,
		update,
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	revalidatePath(`/${plannerId}/recipes/${recipeId}`);

	return { ok: true, data: undefined };
};
