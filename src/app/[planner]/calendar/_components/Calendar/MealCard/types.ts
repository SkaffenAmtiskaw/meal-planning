import type { ReactNode } from 'react';

import type { CalendarMeal } from '../types';

export interface MealCardProps {
	meal: CalendarMeal;
	plannerId: string;
	actions?: ReactNode;
}
