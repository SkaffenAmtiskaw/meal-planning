'use client';

import {
	createViewList,
	createViewMonthAgenda,
	createViewMonthGrid,
	createViewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';

import { useCallback, useMemo, useState } from 'react';

import type { MealEvent, SerializedDay } from '../_utils/toScheduleXEvents';
import { toScheduleXEvents } from '../_utils/toScheduleXEvents';
import { AddMealButton } from './AddMealButton';
import type { SavedItem } from './AddMealForm';
import styles from './CalendarView.module.css';
import { MealDetailModal } from './MealDetailModal';
import { MonthGridEvent } from './MonthGridEvent';

type Props = {
	plannerId: string;
	savedItems: SavedItem[];
	calendar: SerializedDay[];
};

export const CalendarView = ({ plannerId, savedItems, calendar }: Props) => {
	const eventsService = useState(() => createEventsServicePlugin())[0];
	const [initialEvents] = useState(() =>
		toScheduleXEvents(calendar, savedItems),
	);
	const [clickedEvent, setClickedEvent] = useState<MealEvent | null>(null);

	const handleMealAdded = useCallback(
		(newCalendar: SerializedDay[]) => {
			eventsService.set(toScheduleXEvents(newCalendar, savedItems));
		},
		[eventsService, savedItems],
	);

	const AddMealButtonWithData = useCallback(
		() => (
			<AddMealButton
				plannerId={plannerId}
				savedItems={savedItems}
				onMealAdded={handleMealAdded}
			/>
		),
		[plannerId, savedItems, handleMealAdded],
	);

	const calendarApp = useNextCalendarApp({
		views: [
			createViewList(),
			createViewWeek(),
			createViewMonthGrid(),
			createViewMonthAgenda(),
		],
		events: initialEvents,
		plugins: [eventsService],
		callbacks: {
			onEventClick: (event) => {
				setClickedEvent(event as unknown as MealEvent);
			},
		},
	});

	const customComponents = useMemo(
		() => ({
			headerContentRightPrepend: AddMealButtonWithData,
			monthGridEvent: MonthGridEvent,
		}),
		[AddMealButtonWithData],
	);

	return (
		<>
			<MealDetailModal
				event={clickedEvent}
				plannerId={plannerId}
				onClose={() => setClickedEvent(null)}
			/>
			<div className={styles.calendarWrapper}>
				<ScheduleXCalendar
					calendarApp={calendarApp}
					customComponents={customComponents}
				/>
			</div>
		</>
	);
};
