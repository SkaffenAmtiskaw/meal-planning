import type { MealKeyboardProps } from './useMonthGridKeyboard.types';

export interface MonthGridMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export type MonthGridMealRenderProps = MealKeyboardProps;

export interface MonthGridProps {
	meals?: MonthGridMeal[];
	renderMeal?: (
		meal: MonthGridMeal,
		props: MonthGridMealRenderProps,
	) => React.ReactNode;
	onMealClick?: (meal: MonthGridMeal) => void;
}
