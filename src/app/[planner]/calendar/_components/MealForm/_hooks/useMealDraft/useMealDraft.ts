'use client';

import { useState } from 'react';

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

	const removeDish = (key: string) =>
		setDraft((prev) => ({
			...prev,
			dishes: prev.dishes.filter((dish) => dish.key !== key),
		}));

	// Renaming never unlinks: whether it should is the name field's rule.
	const renameDish = (key: string, name: string) => updateDish(key, { name });

	return { draft, setField, addDish, removeDish, renameDish };
};
