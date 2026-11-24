'use client';

import { useState } from 'react';

import type { SavedItem } from '@/_actions/library/types';

import { newDishDraft } from '../../_utils/newDishDraft';
import type { DishDraft, MealDraft, MealField } from '../../types';

/**
 * The meal being written in the form: its fields and its dishes, with one named
 * function for each change.
 */
export const useMealDraft = (initialDraft: MealDraft) => {
	const [draft, setDraft] = useState(initialDraft);

	const updateDish = (key: string, patch: Partial<DishDraft>) =>
		setDraft((prev) => ({
			...prev,
			dishes: prev.dishes.map((dish) =>
				dish.key === key ? { ...dish, ...patch } : dish,
			),
		}));

	const setField = (field: MealField, value: string) =>
		setDraft((prev) => ({ ...prev, [field]: value }));

	// Gives back the new dish's key, so a phone can open its saved list.
	const addDish = () => {
		const dish = newDishDraft();
		setDraft((prev) => ({ ...prev, dishes: [...prev.dishes, dish] }));
		return dish.key;
	};

	// The Saved recipes column's Add: a new dish at the end, named after the recipe and linked to it.
	const addLinkedDish = (item: SavedItem) =>
		setDraft((prev) => ({
			...prev,
			dishes: [
				...prev.dishes,
				{
					...newDishDraft(),
					name: item.name,
					source: { kind: 'saved', savedId: item._id },
				},
			],
		}));

	const removeDish = (key: string) =>
		setDraft((prev) => ({
			...prev,
			dishes: prev.dishes.filter((dish) => dish.key !== key),
		}));

	// Renaming never unlinks: whether it should is the name field's rule.
	const renameDish = (key: string, name: string) => updateDish(key, { name });

	// An empty reference leaves the dish with nothing linked.
	const setReference = (key: string, text: string) =>
		updateDish(key, { source: text ? { kind: 'reference', text } : null });

	const setNote = (key: string, note: string) => updateDish(key, { note });

	// The dish keeps its name.
	const unlinkDish = (key: string) => updateDish(key, { source: null });

	/**
	 * Links a saved recipe to an existing dish, replacing any reference. The dish
	 * keeps its name, or takes the recipe's if it has none.
	 */
	const linkDish = (key: string, item: SavedItem) =>
		setDraft((prev) => ({
			...prev,
			dishes: prev.dishes.map((dish) =>
				dish.key === key
					? {
							...dish,
							name: dish.name.trim() ? dish.name : item.name,
							source: { kind: 'saved', savedId: item._id },
						}
					: dish,
			),
		}));

	// The phone list's Use: the dish takes the recipe's name and links to it, replacing any reference.
	const chooseRecipe = (key: string, item: SavedItem) =>
		updateDish(key, {
			name: item.name,
			source: { kind: 'saved', savedId: item._id },
		});

	return {
		draft,
		setField,
		addDish,
		addLinkedDish,
		removeDish,
		renameDish,
		setReference,
		setNote,
		unlinkDish,
		linkDish,
		chooseRecipe,
	};
};
