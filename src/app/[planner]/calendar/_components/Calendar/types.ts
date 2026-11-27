import type { DateTime } from 'luxon';

export type CalendarViewType = 'month' | 'week' | 'list';

/**
 * The viewer's latest explicit navigation to a date. Each one gets a new id,
 * so a second jump to the same date is still a new jump.
 */
export interface CalendarJump {
	date: DateTime;
	id: number;
}

export interface CalendarContextValue {
	// Selected date being viewed (single source of truth)
	selectedDate: DateTime;

	// Currently selected view type
	viewType: CalendarViewType;

	// The latest explicit navigation, or null before the first one
	jump: CalendarJump | null;

	// Setters
	setSelectedDate: (date: DateTime) => void;
	setViewType: (view: CalendarViewType) => void;

	// Explicit navigation: selects the date and records a jump to it
	navigateToDate: (date: DateTime) => void;

	// Navigation actions
	goToToday: () => void;
	goToPrevious: () => void;
	goToNext: () => void;
}

export interface CalendarDish {
	_id: string;
	name: string;
	source?: string | { url: string } | { ref: string } | { _id: string };
	note?: string;
}

export interface CalendarMeal {
	id: string;
	date: string;
	name: string;
	description?: string;
	borderColor: string;
	dishes: CalendarDish[];
}
