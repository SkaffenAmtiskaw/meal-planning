import type { DateTime } from 'luxon';

// A month view day cell's accessible name, like "November 11, 1 meals", on desktop and phone.
export const monthCellName = (date: DateTime, meals: number) =>
	`${date.toFormat('MMMM d', { locale: 'en-US' })}, ${meals} meals`;

// A week view day column's accessible name, like "Wed 11/11, 1 meals".
export const weekCellName = (date: DateTime, meals: number) =>
	`${date.toFormat('ccc', { locale: 'en-US' })} ${date.month}/${date.day}, ${meals} meals`;

// The header's label in month view, like "November 2026".
export const monthLabel = (date: DateTime) =>
	date.toFormat('MMMM yyyy', { locale: 'en-US' });
