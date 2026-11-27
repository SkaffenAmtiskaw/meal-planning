'use client';

import { linkedSavedIds } from '@/_actions/calendar/linkedSavedIds';
import type { DishSource } from '@/_actions/calendar/types';
import type { SavedItem } from '@/_actions/library/types';

import { newDishValues } from './newDishValues';
import { useMealFormContext } from './useMealForm';
import type { DishValues } from './types';

import { isBlankDish } from '../../_utils/isBlankDish';

const savedSource = (item: SavedItem): DishSource => ({
	kind: 'saved',
	savedId: item._id,
});

/**
 * The meal's dishes, and the changes to them that have a rule of their own,
 * each taking a dish's key. A plain field, such as a note, binds through
 * getInputProps instead.
 */
export const useMealDishes = () => {
	const form = useMealFormContext();
	const { dishes } = form.values;

	const updateDish = (
		key: string,
		change: (dish: DishValues) => Partial<DishValues>,
	) => {
		const index = dishes.findIndex((dish) => dish.key === key);
		form.setFieldValue(`dishes.${index}`, (dish: DishValues) => ({
			...dish,
			...change(dish),
		}));
	};

	// Gives back the new dish's key, so a phone can open its saved list.
	const addDish = () => {
		const dish = newDishValues();
		form.insertListItem('dishes', dish);
		return dish.key;
	};

	// The Saved recipes column's Add: a new dish at the end, named after the recipe and linked to it.
	const addLinkedDish = (item: SavedItem) =>
		form.insertListItem('dishes', {
			...newDishValues(),
			name: item.name,
			source: savedSource(item),
		});

	// Links a saved recipe, replacing any reference. The dish keeps its name, or takes the recipe's if it has none.
	const linkDish = (key: string, item: SavedItem) =>
		updateDish(key, (dish) => ({
			name: dish.name.trim() ? dish.name : item.name,
			source: savedSource(item),
		}));

	// The phone list's Use: the dish takes the recipe's name and links to it, replacing any reference.
	const chooseRecipe = (key: string, item: SavedItem) =>
		updateDish(key, () => ({ name: item.name, source: savedSource(item) }));

	// Remove: the dish keeps its name.
	const unlinkDish = (key: string) => updateDish(key, () => ({ source: null }));

	// Typing a new name on a phone. A dish linked to a saved recipe is now a different dish, so it unlinks. A reference stays.
	const renameAndUnlinkDish = (key: string, name: string) =>
		updateDish(key, (dish) => ({
			name,
			source: dish.source?.kind === 'saved' ? null : dish.source,
		}));

	// An empty reference leaves the dish with nothing linked.
	const setReference = (key: string, text: string) =>
		updateDish(key, () => ({
			source: text ? { kind: 'reference', text } : null,
		}));

	const deleteDish = (key: string) =>
		form.removeListItem(
			'dishes',
			dishes.findIndex((dish) => dish.key === key),
		);

	return {
		dishes,
		// The saved recipes already on the meal, which the form shows as added.
		linkedIds: new Set(linkedSavedIds(dishes)),
		// A blank row isn't saved, so it isn't counted.
		dishCount: dishes.filter((dish) => !isBlankDish(dish)).length,
		addDish,
		addLinkedDish,
		linkDish,
		chooseRecipe,
		unlinkDish,
		renameAndUnlinkDish,
		setReference,
		deleteDish,
	};
};

export type MealDishes = ReturnType<typeof useMealDishes>;
