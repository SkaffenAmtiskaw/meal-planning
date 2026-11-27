'use client';

import { type ReactNode, useCallback, useState } from 'react';

import type { DateTime, DurationLike } from 'luxon';

import { useToday } from '@/_hooks';

import { CalendarContext } from './CalendarContext';
import type { CalendarJump, CalendarViewType } from './types';

// The list view has no previous and next arrows, so it has no step.
const NAVIGATION_STEPS: Record<
	Exclude<CalendarViewType, 'list'>,
	DurationLike
> = {
	month: { months: 1 },
	week: { days: 7 },
};

export interface CalendarProviderProps {
	children: ReactNode;
	initialDate?: DateTime;
	initialView?: CalendarViewType;
}

export function CalendarProvider({
	children,
	initialDate,
	initialView,
}: CalendarProviderProps) {
	const { today, possibleDays } = useToday();
	// While the viewer's day is unknown, start on the UTC day, the middle of the days it could be.
	const startDate = initialDate ?? today ?? possibleDays[1];
	const [selectedDate, setSelectedDate] = useState<DateTime>(startDate);
	const [viewType, setViewType] = useState<CalendarViewType>(
		initialView ?? 'month',
	);
	const [jump, setJump] = useState<CalendarJump | null>(null);

	/**
	 * Once the viewer's day is known, move to it. No click can land before
	 * then, so this never undoes the viewer's own navigation. Set during
	 * render, so the calendar never paints the UTC day after today is known.
	 */
	const [waitingForToday, setWaitingForToday] = useState(
		!initialDate && today === null,
	);
	if (waitingForToday && today) {
		setWaitingForToday(false);
		setSelectedDate(today);
	}

	const handleSetSelectedDate = useCallback((date: DateTime) => {
		setSelectedDate(date);
	}, []);

	const handleSetViewType = useCallback((view: CalendarViewType) => {
		setViewType(view);
	}, []);

	const navigateToDate = useCallback((date: DateTime) => {
		setSelectedDate(date);
		setJump((previous) => ({ date, id: (previous?.id ?? 0) + 1 }));
	}, []);

	const goToToday = useCallback(() => {
		if (today) navigateToDate(today);
	}, [navigateToDate, today]);

	const goToPrevious = useCallback(() => {
		if (viewType === 'list') return;
		navigateToDate(selectedDate.minus(NAVIGATION_STEPS[viewType]));
	}, [navigateToDate, selectedDate, viewType]);

	const goToNext = useCallback(() => {
		if (viewType === 'list') return;
		navigateToDate(selectedDate.plus(NAVIGATION_STEPS[viewType]));
	}, [navigateToDate, selectedDate, viewType]);

	const contextValue = {
		selectedDate,
		viewType,
		jump,
		setSelectedDate: handleSetSelectedDate,
		setViewType: handleSetViewType,
		navigateToDate,
		goToToday,
		goToPrevious,
		goToNext,
	};

	return (
		<CalendarContext.Provider value={contextValue}>
			{children}
		</CalendarContext.Provider>
	);
}
