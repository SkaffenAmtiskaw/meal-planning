import type { DateTime } from 'luxon';

/**
 * Returns all DateTime days to display in a Monday-start month grid,
 * including overflow days from the previous and next months.
 */
export function getMonthGridDates(selectedDate: DateTime): DateTime[] {
	const firstOfMonth = selectedDate.startOf('month');
	const lastOfMonth = selectedDate.set({ day: selectedDate.daysInMonth });

	const start = firstOfMonth.minus({ days: firstOfMonth.weekday - 1 });
	const end = lastOfMonth.plus({ days: 7 - lastOfMonth.weekday });

	const days: DateTime[] = [];
	let current = start;

	while (current <= end) {
		days.push(current);
		current = current.plus({ days: 1 });
	}

	return days;
}
