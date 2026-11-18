import type { ReactNode } from 'react';

import type { MealKeyboardProps } from './useWeekViewKeyboard.types';

export interface WeekViewMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export type WeekViewMealRenderProps = MealKeyboardProps;

export interface WeekViewProps {
	meals?: WeekViewMeal[];
	renderMeal?: (
		meal: WeekViewMeal,
		props: WeekViewMealRenderProps,
	) => ReactNode;
	onMealClick?: (meal: WeekViewMeal) => void;
}
