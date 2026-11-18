import type { ResolvedDish } from './resolveDishSource.types';

export interface CalendarEvent {
	id: string;
	start: string;
	end: string;
	title: string;
	description?: string;
	dishes: ResolvedDish[];
}
