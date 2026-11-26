'use client';

import type { ReactNode } from 'react';

import { MealDishesContext } from './MealDishesContext';
import type { MealDishes } from './types';

type Props = {
	value: MealDishes;
	children: ReactNode;
};

/**
 * Passes the meal form's dish state and actions down to the pieces inside each
 * dish row, without passing them as props through the dish list and the row.
 */
export const MealDishesProvider = ({ value, children }: Props) => (
	<MealDishesContext.Provider value={value}>
		{children}
	</MealDishesContext.Provider>
);
