import type { MealInput } from '@/_actions/calendar/types';

import type { DishDraft, MealDraft } from '../types';

// An empty optional field is left out, as the stored data never holds one.
const toDishInput = ({ name, source, note }: DishDraft) => ({
	name,
	...(source && { source }),
	...(note && { note }),
});

export const toMealInput = ({
	date,
	mealName,
	description,
	dishes,
}: MealDraft): MealInput => ({
	date,
	mealName,
	...(description && { description }),
	dishes: dishes.map(toDishInput),
});
