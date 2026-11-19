import type { ReactNode } from 'react';

export interface MealKeyboardProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface WeekViewMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	name: string;
	description?: string;
}

export interface WeekViewProps {
	meals?: WeekViewMeal[];
	renderMeal?: (meal: WeekViewMeal, props: MealKeyboardProps) => ReactNode;
	onMealClick?: (meal: WeekViewMeal) => void;
}
