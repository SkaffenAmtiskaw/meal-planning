import { useCallback, useState } from 'react';

import { createEventsServicePlugin } from '@schedule-x/events-service';

import type { SavedItem, SerializedDay } from '../_utils/toScheduleXEvents';
import { toScheduleXEvents } from '../_utils/toScheduleXEvents';

export const useCalendarEvents = (
	calendar: SerializedDay[],
	savedItems: SavedItem[],
) => {
	const [eventsService] = useState(() => createEventsServicePlugin());
	const [initialEvents] = useState(() =>
		toScheduleXEvents(calendar, savedItems),
	);

	const handleMealAdded = useCallback(
		(newCalendar: SerializedDay[]) => {
			eventsService.set(toScheduleXEvents(newCalendar, savedItems));
		},
		[eventsService, savedItems],
	);

	return { eventsService, initialEvents, handleMealAdded };
};
