import type { CalendarMeal } from '../_types/CalendarMeal.types';
import type { MealCardProps } from '../MealCard/MealCard.types';

export interface MobileAgendaProps {
	events?: CalendarMeal[];
	renderDish?: MealCardProps['renderDish'];
}
