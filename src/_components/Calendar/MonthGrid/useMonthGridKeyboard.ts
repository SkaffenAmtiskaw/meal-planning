import { useCallback, useEffect, useRef, useState } from 'react';

import { DateTime } from 'luxon';

import type { MonthGridEvent } from './MonthGrid';

export interface UseMonthGridKeyboardOptions {
	days: DateTime[];
	eventsByDate: Map<string, MonthGridEvent[]>;
	onEventClick?: (event: MonthGridEvent) => void;
	selectedDate: DateTime;
}

export interface DayKeyboardProps {
	tabIndex: 0 | -1;
	onClick: () => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
	ref: (el: HTMLElement | null) => void;
}

export interface EventKeyboardProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface UseMonthGridKeyboardResult {
	getDayProps: (dayIndex: number) => DayKeyboardProps;
	getEventProps: (
		dayIndex: number,
		eventIndex: number,
		isoDate: string,
	) => EventKeyboardProps;
}

function computeInitialFocusIndex(
	days: DateTime[],
	selectedDate: DateTime,
): number {
	if (days.length === 0) {
		throw new Error('days array cannot be empty');
	}

	const today = DateTime.now();
	const todayIndex = days.findIndex((d) => d.hasSame(today, 'day'));
	if (todayIndex !== -1) return todayIndex;

	return days.findIndex((d) => d.hasSame(selectedDate, 'month'));
}

export function useMonthGridKeyboard(
	options: UseMonthGridKeyboardOptions,
): UseMonthGridKeyboardResult {
	const { days, eventsByDate, onEventClick, selectedDate } = options;

	const [focusedDayIndex, setFocusedDayIndex] = useState(() =>
		computeInitialFocusIndex(days, selectedDate),
	);
	const [eventMode, setEventMode] = useState<{
		dayIndex: number;
		eventIndex: number;
	} | null>(null);

	const dayRefs = useRef<(HTMLElement | null)[]>([]);
	const eventRefs = useRef<Record<string, (HTMLElement | null)[]>>({});
	const focusDayFlag = useRef(false);
	const focusEventFlag = useRef(false);
	const daysRef = useRef(days);
	daysRef.current = days;
	const eventModeRef = useRef(eventMode);
	eventModeRef.current = eventMode;

	// Reset on days change
	useEffect(() => {
		setFocusedDayIndex(computeInitialFocusIndex(days, selectedDate));
		setEventMode(null);
		eventRefs.current = {};
	}, [days, selectedDate]);

	// Programmatic focus for days
	useEffect(() => {
		if (focusDayFlag.current) {
			focusDayFlag.current = false;
			dayRefs.current[focusedDayIndex]?.focus();
		}
	}, [focusedDayIndex]);

	// Programmatic focus for events
	useEffect(() => {
		if (focusEventFlag.current && eventMode) {
			focusEventFlag.current = false;
			// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
			const isoDate = daysRef.current[eventMode.dayIndex].toISODate()!;
			const refs = eventRefs.current[isoDate];
			refs?.[eventMode.eventIndex]?.focus();
		}
	}, [eventMode]);

	const handleDayClick = useCallback(
		(dayIndex: number) => () => {
			focusDayFlag.current = true;
			setFocusedDayIndex(dayIndex);
			setEventMode(null);
		},
		[],
	);

	const handleDayKeyDown = useCallback(
		(dayIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
			if (eventModeRef.current && eventModeRef.current.dayIndex === dayIndex) {
				// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
				const isoDate = daysRef.current[dayIndex].toISODate()!;
				const dayEvents = eventsByDate.get(isoDate) ?? [];

				if (e.key === 'ArrowDown') {
					e.preventDefault();
					const nextIndex = eventModeRef.current.eventIndex + 1;
					if (nextIndex < dayEvents.length) {
						focusEventFlag.current = true;
						setEventMode({ dayIndex, eventIndex: nextIndex });
					}
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					const prevIndex = eventModeRef.current.eventIndex - 1;
					if (prevIndex >= 0) {
						focusEventFlag.current = true;
						setEventMode({ dayIndex, eventIndex: prevIndex });
					}
				} else if (e.key === 'Enter') {
					e.preventDefault();
					if (eventModeRef.current.eventIndex < dayEvents.length) {
						onEventClick?.(dayEvents[eventModeRef.current.eventIndex]);
					}
				} else if (e.key === 'Escape') {
					e.preventDefault();
					setEventMode(null);
					dayRefs.current[eventModeRef.current.dayIndex]?.focus();
				}
				return;
			}

			if (e.key === 'ArrowRight') {
				e.preventDefault();
				const col = dayIndex % 7;
				if (col < 6 && dayIndex + 1 < daysRef.current.length) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex + 1);
				}
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const col = dayIndex % 7;
				if (col > 0) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex - 1);
				}
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (dayIndex + 7 < daysRef.current.length) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex + 7);
				}
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (dayIndex - 7 >= 0) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex - 7);
				}
			} else if (e.key === 'Enter') {
				e.preventDefault();
				// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
				const isoDate = daysRef.current[dayIndex].toISODate()!;
				const dayEvents = eventsByDate.get(isoDate) ?? [];
				if (dayEvents.length === 1) {
					onEventClick?.(dayEvents[0]);
				} else if (dayEvents.length > 1) {
					focusEventFlag.current = true;
					setEventMode({ dayIndex, eventIndex: 0 });
				}
			}
		},
		[eventsByDate, onEventClick],
	);

	const getDayProps = useCallback(
		(dayIndex: number): DayKeyboardProps => {
			const isActiveDay = focusedDayIndex === dayIndex;
			const isEventModeDay = eventMode?.dayIndex === dayIndex;
			const tabIndex = isEventModeDay ? -1 : isActiveDay ? 0 : -1;

			return {
				tabIndex: tabIndex as 0 | -1,
				onClick: handleDayClick(dayIndex),
				onKeyDown: handleDayKeyDown(dayIndex),
				ref: (el: HTMLElement | null) => {
					dayRefs.current[dayIndex] = el;
				},
			};
		},
		[focusedDayIndex, eventMode, handleDayClick, handleDayKeyDown],
	);

	const getEventProps = useCallback(
		(
			dayIndex: number,
			eventIndex: number,
			isoDate: string,
		): EventKeyboardProps => {
			const isEventModeDay = eventMode?.dayIndex === dayIndex;
			const tabIndex =
				isEventModeDay && eventMode?.eventIndex === eventIndex ? 0 : -1;

			return {
				tabIndex: tabIndex as 0 | -1,
				ref: (el: HTMLElement | null) => {
					if (!eventRefs.current[isoDate]) {
						eventRefs.current[isoDate] = [];
					}
					eventRefs.current[isoDate][eventIndex] = el;
				},
			};
		},
		[eventMode],
	);

	return {
		getDayProps,
		getEventProps,
	};
}
