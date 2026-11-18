import type { ReactNode } from 'react';

import type { CalendarDish, CalendarMeal } from '../_types/CalendarMeal.types';

export interface MealCardProps {
	event: CalendarMeal;
	renderDish?: (dish: CalendarDish) => ReactNode;
	renderActions?: ReactNode;
}
