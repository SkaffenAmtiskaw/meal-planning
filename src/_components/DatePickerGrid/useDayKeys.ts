'use client';

import { type KeyboardEvent, useEffect, useRef } from 'react';

import { DateTime } from 'luxon';

import { dateForKey } from './dateForKey';

type UseDatePickerKeysOptions = {
	// The month on screen, as an ISO date in that month.
	shownMonth: string;
	// Called with the first day of the month to show, when a key moves focus out of the shown month.
	onShownMonthChange: (month: string) => void;
};

/**
 * Moves focus between the picker's days on PageUp, PageDown, Home and End,
 * which Mantine's DatePicker leaves alone. Attach `ref` to an element around
 * the grid and spread `getDayKeyProps(date)` onto each day.
 */
export function useDatePickerKeys({
	shownMonth,
	onShownMonthChange,
}: UseDatePickerKeysOptions) {
	const ref = useRef<HTMLDivElement>(null);
	// The day to focus once its month is on screen.
	const pendingFocus = useRef<string | null>(null);

	const focusDay = (date: string) => {
		ref.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
	};

	// Runs after every render, so it focuses the day once the month it moved to has rendered.
	useEffect(() => {
		if (pendingFocus.current) {
			focusDay(pendingFocus.current);
			pendingFocus.current = null;
		}
	});

	const getDayKeyProps = (date: string) => ({
		'data-date': date,
		onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
			const target = dateForKey(date, event.key);
			if (!target) {
				return;
			}
			// Stops PageUp, PageDown, Home and End scrolling the page.
			event.preventDefault();
			const targetDay = DateTime.fromISO(target);
			if (targetDay.hasSame(DateTime.fromISO(shownMonth), 'month')) {
				focusDay(target);
				return;
			}
			pendingFocus.current = target;
			onShownMonthChange(targetDay.startOf('month').toISODate() as string);
		},
	});

	return { ref, getDayKeyProps };
}
