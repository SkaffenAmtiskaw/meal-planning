import type { z } from 'zod';

import type { RecipeInterface } from '@/_models/library';

import type { zRecipeInput } from '../recipeInput';

type RecipeFormData = z.infer<typeof zRecipeInput>;

type StoredOptionalFields = Pick<
	RecipeInterface,
	'source' | 'time' | 'notes' | 'storage'
>;

/** Leaves out each key whose value is empty, so an empty field isn't stored. */
const withoutEmpty = <T extends Record<string, string | undefined>>(
	fields: T,
): Partial<T> =>
	Object.fromEntries(
		Object.entries(fields).filter(([, value]) => value),
	) as Partial<T>;

/**
 * The form starts its optional fields at ''. This leaves each empty one out,
 * so the result has the stored shape of those fields.
 */
export const transformRecipeForm = <T extends RecipeFormData>({
	source,
	time,
	notes,
	storage,
	...rest
}: T): Omit<T, keyof StoredOptionalFields> & StoredOptionalFields => {
	const result: Omit<T, keyof StoredOptionalFields> & StoredOptionalFields =
		rest;

	// A source without a name is no source, even with a url.
	if (source?.name)
		result.source = {
			name: source.name,
			...(source.url && { url: source.url }),
		};

	const filledTime = time && withoutEmpty(time);
	if (filledTime && Object.keys(filledTime).length > 0)
		result.time = filledTime;

	if (notes) result.notes = notes;
	if (storage) result.storage = storage;

	return result;
};
