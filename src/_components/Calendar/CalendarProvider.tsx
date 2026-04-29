'use client';

import { type ReactNode, useCallback, useState } from 'react';

import { DateTime } from 'luxon';

import { CalendarContext, type CalendarViewType } from './CalendarContext';

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

	const handleSetSelectedDate = useCallback((date: DateTime) => {
		setSelectedDate(date);
	}, []);

	const handleSetViewType = useCallback((view: CalendarViewType) => {
		setViewType(view);
	}, []);

	const goToToday = useCallback(() => {
		setSelectedDate(DateTime.now());
	}, []);

	const goToPrevious = useCallback(() => {
		setSelectedDate((prev) => {
			const navigationMap: Record<CalendarViewType, DateTime> = {
				month: prev.minus({ months: 1 }),
				week: prev.minus({ days: 7 }),
				list: prev.minus({ days: 1 }),
			};
			return navigationMap[viewType];
		});
	}, [viewType]);

	const goToNext = useCallback(() => {
		setSelectedDate((prev) => {
			const navigationMap: Record<CalendarViewType, DateTime> = {
				month: prev.plus({ months: 1 }),
				week: prev.plus({ days: 7 }),
				list: prev.plus({ days: 1 }),
			};
			return navigationMap[viewType];
		});
	}, [viewType]);

	const contextValue = {
		selectedDate,
		viewType,
		setSelectedDate: handleSetSelectedDate,
		setViewType: handleSetViewType,
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
