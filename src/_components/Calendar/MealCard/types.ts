import type { ReactNode } from 'react';

import type { CalendarDish, CalendarMeal } from '../types';

export interface MealCardProps {
	event: CalendarMeal;
	renderDish?: (dish: CalendarDish) => ReactNode;
	renderActions?: ReactNode;
}
