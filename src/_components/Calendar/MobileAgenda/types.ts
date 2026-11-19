import type { CalendarMeal } from '../types';
import type { MealCardProps } from '../MealCard/types';

export interface MobileAgendaProps {
	events?: CalendarMeal[];
	renderDish?: MealCardProps['renderDish'];
}
