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

	const addDish = () =>
		setDraft((prev) => ({ ...prev, dishes: [...prev.dishes, newDishDraft()] }));

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
	};
};
