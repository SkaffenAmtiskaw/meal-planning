'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models/planner';
import type { ActionResult } from '@/_utils/actionResult';
import { zId } from '@/_utils/zId';

const zUpdateRecipeTagsSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
	tags: z.array(zId),
});

export const updateRecipeTags = async (
	data: unknown,
): Promise<ActionResult> => {
	const { plannerId, recipeId, tags } = zUpdateRecipeTagsSchema.parse(data);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const result = await Planner.collection.updateOne(
		{ _id: plannerId, 'saved._id': recipeId } as object,
		{ $set: { 'saved.$.tags': tags } },
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	revalidatePath(`/${plannerId}/recipes/${recipeId}`);

	return { ok: true, data: undefined };
};
