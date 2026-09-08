'use client';

import { useCallback, useMemo } from 'react';

import type { MonthGridEvent } from '@/_components/Calendar';
import { MonthGrid } from '@/_components/Calendar';

import { MealEventCard } from './MealEventCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealCalendarProps {
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
	onEventClick?: (event: CalendarEvent) => void;
}

export function MealCalendar({
	calendar,
	savedItems,
	onEventClick,
}: MealCalendarProps) {
	const events = useMemo(
		() => toCalendarEvents(calendar, savedItems),
		[calendar, savedItems],
	);

	const { monthGridEvents, eventMap } = useMemo(() => {
		const monthGridEvents: MonthGridEvent[] = events.map((event) => ({
			id: event.id,
			date: event.start,
			title: event.title,
			description: event.description,
		}));

		const eventMap = new Map<string, CalendarEvent>();
		for (const event of events) {
			eventMap.set(event.id, event);
		}

		return { monthGridEvents, eventMap };
	}, [events]);

	const renderEvent = useCallback(
		(event: MonthGridEvent) => {
			const calendarEvent = eventMap.get(event.id);
			if (!calendarEvent) return null;

			return (
				<MealEventCard
					event={event}
					onClick={() => {
						onEventClick?.(calendarEvent);
					}}
				/>
			);
		},
		[eventMap, onEventClick],
	);

	return <MonthGrid events={monthGridEvents} renderEvent={renderEvent} />;
}
