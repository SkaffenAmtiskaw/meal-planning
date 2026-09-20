'use client';

import { type ReactNode, useCallback, useState } from 'react';

import type { DurationLike } from 'luxon';
import { DateTime } from 'luxon';

import { CalendarContext, type CalendarViewType } from './CalendarContext';

const NAVIGATION_STEPS: Record<CalendarViewType, DurationLike> = {
	month: { months: 1 },
	week: { days: 7 },
	list: { days: 1 },
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
	const [selectedDate, setSelectedDate] = useState<DateTime>(
		initialDate ?? DateTime.now(),
	);
	const [viewType, setViewType] = useState<CalendarViewType>(
		initialView ?? 'month',
	);
	const [rangeAnchor, setRangeAnchor] = useState<DateTime>(
		initialDate ?? DateTime.now(),
	);

	const handleSetSelectedDate = useCallback((date: DateTime) => {
		setSelectedDate(date);
	}, []);

	const handleSetViewType = useCallback((view: CalendarViewType) => {
		setViewType(view);
	}, []);

	const navigateToDate = useCallback((date: DateTime) => {
		setSelectedDate(date);
		setRangeAnchor(date);
	}, []);

	const goToToday = useCallback(() => {
		navigateToDate(DateTime.now());
	}, [navigateToDate]);

	const goToPrevious = useCallback(() => {
		navigateToDate(selectedDate.minus(NAVIGATION_STEPS[viewType]));
	}, [navigateToDate, selectedDate, viewType]);

	const goToNext = useCallback(() => {
		navigateToDate(selectedDate.plus(NAVIGATION_STEPS[viewType]));
	}, [navigateToDate, selectedDate, viewType]);

	const contextValue = {
		selectedDate,
		viewType,
		rangeAnchor,
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
