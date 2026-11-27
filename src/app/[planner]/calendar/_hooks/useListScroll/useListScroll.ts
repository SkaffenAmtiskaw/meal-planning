'use client';

import {
	type RefCallback,
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
} from 'react';

import type { DateTime } from 'luxon';

import { useScrollItems, useTodayOrThrow } from '@/_hooks';

import { useCalendarContext } from '../../_components/Calendar';

// The gap, in px, left above the day at the top of the list.
const TOP_GAP = 12;

const dayKey = (date: DateTime): string => date.toFormat('yyyy-MM-dd');

interface ListScroll {
	// The ref for the list's scroll region.
	regionRef: RefObject<HTMLDivElement | null>;
	// The ref for a day's element in the list.
	dayRef: (date: DateTime) => RefCallback<HTMLElement>;
}

/**
 * Scrolls a calendar list of days and keeps the calendar's selected day in
 * step with it. The list opens on the selected day, or on today when the
 * selected day isn't in the list. Each jump, such as Today or a date picked
 * in the header, smooth-scrolls that day to the top. A jump to a day the list
 * doesn't hold puts the selected day back to the day at the top. As the list
 * scrolls, the day at the top becomes the selected day.
 */
export function useListScroll(days: DateTime[]): ListScroll {
	const { selectedDate, setSelectedDate, jump } = useCalendarContext();
	const today = useTodayOrThrow();
	const regionRef = useRef<HTMLDivElement>(null);
	const daysRef = useRef(days);
	daysRef.current = days;
	const topDay = useRef<DateTime>(selectedDate);
	const opened = useRef(false);
	// A jump made before the list opened is already where it opens, so it isn't replayed.
	const lastJumpId = useRef(jump?.id);

	const { itemRef, scrollTo } = useScrollItems<string>(regionRef, {
		offset: TOP_GAP,
		onTopmostChange: (key) => {
			const day = daysRef.current.find((date) => dayKey(date) === key);
			if (!day) return;
			topDay.current = day;
			setSelectedDate(day);
		},
	});

	// Set before paint, so the list never shows its first day before scrolling.
	useLayoutEffect(() => {
		if (opened.current) return;
		opened.current = true;
		if (scrollTo(dayKey(selectedDate), 'instant')) return;
		scrollTo(dayKey(today), 'instant');
		topDay.current = today;
		setSelectedDate(today);
	}, [scrollTo, selectedDate, setSelectedDate, today]);

	// Before paint, so the header never shows a far date the list can't scroll to.
	useLayoutEffect(() => {
		if (!jump || jump.id === lastJumpId.current) return;
		lastJumpId.current = jump.id;
		if (!scrollTo(dayKey(jump.date), 'smooth')) {
			setSelectedDate(topDay.current);
		}
	}, [jump, scrollTo, setSelectedDate]);

	const dayRef = useCallback(
		(date: DateTime) => itemRef(dayKey(date)),
		[itemRef],
	);

	return { regionRef, dayRef };
}
