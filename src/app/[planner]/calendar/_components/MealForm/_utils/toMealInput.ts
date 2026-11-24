import type { MealInput } from '@/_actions/calendar/types';

import { isBlankDish } from './isBlankDish';

import type { DishDraft, MealDraft } from '../types';

/**
 * An empty optional field is left out, as the stored data never holds one. A
 * description or note of only spaces counts as empty, as it does for a blank row.
 */
const toDishInput = ({ name, source, note }: DishDraft) => ({
	name,
	...(source && { source }),
	...(note.trim() && { note }),
});

export const toMealInput = ({
	date,
	mealName,
	description,
	dishes,
}: MealDraft): MealInput => ({
	date,
	mealName,
	...(description.trim() && { description }),
	// A blank row is left for the user to fill in, not a dish, so it isn't saved.
	dishes: dishes.filter((dish) => !isBlankDish(dish)).map(toDishInput),
});
