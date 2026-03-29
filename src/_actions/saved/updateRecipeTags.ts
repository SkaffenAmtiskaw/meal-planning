'use server';

import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

const zUpdateRecipeTagsSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
	tags: z.array(z.string()),
});

export const updateRecipeTags = async (data: unknown): Promise<void> => {
	const { plannerId, recipeId, tags } = zUpdateRecipeTagsSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') throw new Error('Unauthorized');

	const tagObjectIds = tags.map((id) => new Types.ObjectId(id));

	const result = await Planner.collection.updateOne(
		{
			_id: new Types.ObjectId(plannerId),
			'saved._id': new Types.ObjectId(recipeId),
		},
		{ $set: { 'saved.$.tags': tagObjectIds } },
	);

	if (result.matchedCount === 0) throw new Error('Recipe not found');

	revalidatePath(`/${plannerId}/recipes/${recipeId}`);
};
