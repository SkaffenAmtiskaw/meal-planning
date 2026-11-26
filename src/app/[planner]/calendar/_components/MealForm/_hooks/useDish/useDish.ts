import { useContext } from 'react';

import { DishContext } from './DishContext';
import { MealDishesContext } from './MealDishesContext';
import type { Dish } from './types';

/**
 * The dish a row shows, its flags, and the meal form's actions on its dishes.
 * The actions are the form's own, so a piece calls them with `dish.key`.
 */
export const useDish = (): Dish => {
	const dish = useContext(DishContext);
	const mealDishes = useContext(MealDishesContext);
	if (!dish) {
		throw new Error('useDish must be used inside DishProvider');
	}
	if (!mealDishes) {
		throw new Error('useDish must be used inside MealDishesProvider');
	}
	const { namelessKeys, linkingKey, openDishList, ...actions } = mealDishes;

	return {
		...actions,
		dish,
		nameless: namelessKeys.has(dish.key),
		linking: linkingKey === dish.key,
		listOpenId: openDishList?.key === dish.key ? openDishList.id : null,
	};
};
