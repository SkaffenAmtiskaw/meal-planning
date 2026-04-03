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

import { useState } from 'react';

import { AddMealButton } from './AddMealButton';
import type { SavedItem } from './AddMealForm';

type Props = {
	plannerId: string;
	savedItems: SavedItem[];
};

export const CalendarView = ({ plannerId, savedItems }: Props) => {
	const eventsService = useState(() => createEventsServicePlugin())[0];

	const AddMealButtonWithData = () => (
		<AddMealButton plannerId={plannerId} savedItems={savedItems} />
	);

	const calendar = useNextCalendarApp({
		views: [
			createViewList(),
			createViewWeek(),
			createViewMonthGrid(),
			createViewMonthAgenda(),
		],
		events: [],
		plugins: [eventsService],
		callbacks: {
			onRender: () => {
				eventsService.getAll();
			},
		},
	});

	return (
		<div>
			<ScheduleXCalendar
				calendarApp={calendar}
				customComponents={{ headerContentRightPrepend: AddMealButtonWithData }}
			/>
		</div>
	);
};
