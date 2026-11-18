import type { ReactNode } from 'react';

import type {
	CalendarDish,
	CalendarMeal,
} from '@/_components/Calendar/_types/CalendarMeal.types';

export interface MobileAgendaProps {
	events?: CalendarMeal[];
	renderDish?: (dish: CalendarDish) => ReactNode;
}
