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

/* v8 ignore start */
const CalendarPage = () => {
	const eventsService = useState(() => createEventsServicePlugin())[0];

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
				// get all events
				eventsService.getAll();
			},
		},
	});

	return (
		<div>
			<ScheduleXCalendar calendarApp={calendar} />
		</div>
	);
};

export default CalendarPage;
/* v8 ignore stop */
