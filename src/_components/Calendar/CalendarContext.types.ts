import type { DateTime } from 'luxon';

export type CalendarViewType = 'month' | 'week' | 'list';

export interface CalendarContextValue {
	// Selected date being viewed (single source of truth)
	selectedDate: DateTime;

	// Currently selected view type
	viewType: CalendarViewType;

	// Anchor for the fixed list-view day window; updates only on explicit navigation
	rangeAnchor: DateTime;

	// Setters
	setSelectedDate: (date: DateTime) => void;
	setViewType: (view: CalendarViewType) => void;

	// Explicit navigation: updates both selectedDate and rangeAnchor
	navigateToDate: (date: DateTime) => void;

	// Navigation actions
	goToToday: () => void;
	goToPrevious: () => void;
	goToNext: () => void;
}
