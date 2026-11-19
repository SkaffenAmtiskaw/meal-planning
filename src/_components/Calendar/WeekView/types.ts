import type { ReactNode } from 'react';

export interface MealKeyboardProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface WeekViewMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

type WeekViewMealRenderProps = MealKeyboardProps;

export interface WeekViewProps {
	meals?: WeekViewMeal[];
	renderMeal?: (
		meal: WeekViewMeal,
		props: WeekViewMealRenderProps,
	) => ReactNode;
	onMealClick?: (meal: WeekViewMeal) => void;
}
