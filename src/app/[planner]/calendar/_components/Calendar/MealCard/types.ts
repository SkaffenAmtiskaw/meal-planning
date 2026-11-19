import type { ReactNode } from 'react';

import type { CalendarDish, CalendarMeal } from '../types';

export interface MealCardProps {
	meal: CalendarMeal;
	renderDish?: (dish: CalendarDish) => ReactNode;
	renderActions?: ReactNode;
}
