'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';

/* v8 ignore start */
const CalendarPage = () => (
	<FullCalendar
		headerToolbar={{
			left: 'dayGridMonth,dayGridWeek',
			center: 'title',
			right: 'prev,next',
		}}
		plugins={[dayGridPlugin]}
		initialView="dayGridMonth"
	/>
);

export default CalendarPage;
/* v8 ignore stop */
