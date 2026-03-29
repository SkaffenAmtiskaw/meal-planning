'use server';

import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';
import type { ActionResult } from '@/_utils/actionResult';

const zEditRecipeSchema = zRecipeFormSchema.extend({ _id: z.string() });

export const editRecipe = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const {
		plannerId,
		_id: recipeId,
		name,
		ingredients,
		instructions,
		tags,
		source,
		time,
		servings,
		notes,
		storage,
	} = zEditRecipeSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const setFields: Record<string, unknown> = {
		'saved.$.name': name,
		'saved.$.ingredients': ingredients,
		'saved.$.instructions': instructions,
		'saved.$.tags': (tags ?? []).map((t) => new Types.ObjectId(String(t))),
	};

	const unsetFields: Record<string, string> = {};

	if (source) {
		setFields['saved.$.source'] = source;
	} else {
		unsetFields['saved.$.source'] = '';
	}

	if (time) {
		setFields['saved.$.time'] = time;
	} else {
		unsetFields['saved.$.time'] = '';
	}

	if (servings !== undefined) {
		setFields['saved.$.servings'] = servings;
	} else {
		unsetFields['saved.$.servings'] = '';
	}

	if (notes) {
		setFields['saved.$.notes'] = notes;
	} else {
		unsetFields['saved.$.notes'] = '';
	}

	if (storage) {
		setFields['saved.$.storage'] = storage;
	} else {
		unsetFields['saved.$.storage'] = '';
	}

	const update: Record<string, unknown> = { $set: setFields };
	if (Object.keys(unsetFields).length > 0) {
		update.$unset = unsetFields;
	}

	const result = await Planner.collection.updateOne(
		{
			_id: new Types.ObjectId(plannerId),
			'saved._id': new Types.ObjectId(recipeId),
		},
		update,
	);

	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	revalidatePath(`/${plannerId}/recipes`);
	revalidatePath(`/${plannerId}/recipes/${recipeId}`);

	return { ok: true, data: { _id: recipeId, name } };
};
