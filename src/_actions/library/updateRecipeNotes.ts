'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
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

	const result = await planners.updateOne(
		{ _id: plannerId, 'saved._id': recipeId },
		notes
			? { $set: { 'saved.$.notes': notes } }
			: { $unset: { 'saved.$.notes': '' } },
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	revalidatePath(`/${plannerId}/recipes/${recipeId}`);

	return { ok: true, data: undefined };
};
