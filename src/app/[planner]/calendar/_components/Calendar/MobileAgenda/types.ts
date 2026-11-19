import type { CalendarMeal } from '../types';
import type { MealCardProps } from '../MealCard/types';

export interface MobileAgendaProps {
	meals?: CalendarMeal[];
	renderDish?: MealCardProps['renderDish'];
}
