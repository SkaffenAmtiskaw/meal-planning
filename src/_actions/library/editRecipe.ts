'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';

import { zRecipeInput } from './recipeInput';

import { transformRecipeForm } from './_utils/transformRecipeForm';

const zEditRecipeSchema = zRecipeInput.extend({ _id: z.string() });

export const editRecipe = defineMutation({
	schema: zEditRecipeSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async (input) => {
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
		} = transformRecipeForm(input);

		const setFields: Record<string, unknown> = {
			'saved.$.name': name,
			'saved.$.ingredients': ingredients,
			'saved.$.instructions': instructions,
			'saved.$.tags': tags ?? [],
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

		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': recipeId },
			update,
		);

		if (result.matchedCount === 0)
			return { ok: false, error: 'Recipe not found' };

		return { ok: true, data: { _id: recipeId, name } };
	},
});
