'use client';

import { useCallback, useMemo } from 'react';

import {
	WeekView,
	type WeekViewEvent,
	type WeekViewProps,
} from '@/_components/Calendar';

import { WeekMealCard } from './WeekMealCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealWeekViewProps {
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
	plannerId: string;
	onEventClick?: (event: CalendarEvent) => void;
}

export function MealWeekView({
	calendar,
	savedItems,
	plannerId,
	onEventClick,
}: MealWeekViewProps) {
	const events = useMemo(
		() => toCalendarEvents(calendar, savedItems),
		[calendar, savedItems],
	);

	const { weekEvents, eventMap } = useMemo(() => {
		const weekEvents: WeekViewEvent[] = events.map((event) => ({
			id: event.id,
			date: event.start,
			title: event.title,
			description: event.description,
		}));

		const eventMap = new Map<string, CalendarEvent>();
		for (const event of events) {
			eventMap.set(event.id, event);
		}

		return { weekEvents, eventMap };
	}, [events]);

	const handleEventClick = useCallback(
		(event: WeekViewEvent) => {
			const calendarEvent = eventMap.get(event.id);
			if (calendarEvent) {
				onEventClick?.(calendarEvent);
			}
		},
		[eventMap, onEventClick],
	);

	const renderEvent = useCallback(
		(
			event: WeekViewEvent,
			props: Parameters<NonNullable<WeekViewProps['renderEvent']>>[1],
		) => {
			const calendarEvent = eventMap.get(event.id);
			if (!calendarEvent) return null;

			return (
				<WeekMealCard
					event={calendarEvent}
					plannerId={plannerId}
					onClick={() => onEventClick?.(calendarEvent)}
					tabIndex={props.tabIndex}
					ref={props.ref}
				/>
			);
		},
		[eventMap, onEventClick, plannerId],
	);

	return (
		<WeekView
			events={weekEvents}
			renderEvent={renderEvent}
			onEventClick={handleEventClick}
		/>
	);
}
