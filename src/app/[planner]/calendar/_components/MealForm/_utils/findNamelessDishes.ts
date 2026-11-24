import { isBlankDish } from './isBlankDish';

import type { DishDraft } from '../types';

// The dishes that stop a save: something in them, but no name.
export const findNamelessDishes = (dishes: DishDraft[]): DishDraft[] =>
	dishes.filter((dish) => dish.name.trim() === '' && !isBlankDish(dish));
