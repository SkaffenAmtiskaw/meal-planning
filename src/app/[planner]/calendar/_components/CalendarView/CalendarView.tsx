'use client';

import { useState } from 'react';
import type React from 'react';

import { Box, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import {
	CalendarHeader,
	CalendarProvider,
	ListView,
	useCalendarContext,
} from '@/_components/Calendar';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealButton } from '../AddMealButton/AddMealButton';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MealWeekView } from '../MealWeekView/MealWeekView';

type Props = {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems: SavedItem[];
};

type CalendarViewContentProps = {
	plannerId: string;
	savedItems: SavedItem[];
	calendarData: SerializedDay[];
	clickedEvent: CalendarEvent | null;
	onClose: () => void;
	onMealAdded: (calendar: SerializedDay[]) => void;
	onEventClick: (event: CalendarEvent) => void;
};

function CalendarViewContent({
	plannerId,
	savedItems,
	calendarData,
	clickedEvent,
	onClose,
	onMealAdded,
	onEventClick,
}: CalendarViewContentProps): React.ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useMediaQuery('(max-width: 62em)');

	return (
		<Stack gap={0} h="100%">
			<MealDetailModal
				event={clickedEvent}
				plannerId={plannerId}
				onClose={onClose}
			/>
			<CalendarHeader
				rightSection={
					<AddMealButton plannerId={plannerId} onMealAdded={onMealAdded} />
				}
				availableViews={
					isMobile ? ['month', 'list'] : ['month', 'week', 'list']
				}
			/>
			<Box flex={1} mih={0}>
				{viewType === 'month' && (
					<MealCalendar
						calendar={calendarData}
						savedItems={savedItems}
						onEventClick={onEventClick}
					/>
				)}
				{viewType === 'week' && (
					<MealWeekView
						calendar={calendarData}
						savedItems={savedItems}
						plannerId={plannerId}
						onEventClick={onEventClick}
					/>
				)}
				{viewType === 'list' && <ListView />}
			</Box>
		</Stack>
	);
}

export function CalendarView({
	plannerId,
	calendar,
	savedItems,
}: Props): React.ReactElement {
	const [clickedEvent, setClickedEvent] = useState<CalendarEvent | null>(null);
	const [calendarData, setCalendarData] = useState<SerializedDay[]>(calendar);

	return (
		<CalendarProvider>
			<CalendarViewContent
				plannerId={plannerId}
				savedItems={savedItems}
				calendarData={calendarData}
				clickedEvent={clickedEvent}
				onClose={() => setClickedEvent(null)}
				onMealAdded={setCalendarData}
				onEventClick={setClickedEvent}
			/>
		</CalendarProvider>
	);
}
