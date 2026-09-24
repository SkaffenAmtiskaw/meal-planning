'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { Flex, Stack } from '@mantine/core';

import { CalendarProvider, useCalendarContext } from '@/_components/Calendar';
import { useIsMobile } from '@/_hooks';

import { CalendarModalProvider } from '../CalendarModal';
import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import {
	CalendarHeaderDesktop,
	CalendarHeaderMobile,
} from '../CalendarHeader/CalendarHeader';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

type Props = {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems: SavedItem[];
};

type CalendarViewContentProps = {
	plannerId: string;
	savedItems: SavedItem[];
	calendar: SerializedDay[];
	clickedEvent: CalendarEvent | null;
	onClose: () => void;
	onMealClick: (meal: CalendarEvent) => void;
};

function CalendarViewContent({
	plannerId,
	savedItems,
	calendar,
	clickedEvent,
	onClose,
	onMealClick,
}: CalendarViewContentProps): ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useIsMobile();

	return (
		<Stack gap={0} h="100%">
			<MealDetailModal
				event={clickedEvent}
				plannerId={plannerId}
				onClose={onClose}
			/>
			{isMobile ? <CalendarHeaderMobile /> : <CalendarHeaderDesktop />}
			<Flex flex={1} mih={0} direction="column">
				{viewType === 'month' &&
					(isMobile ? (
						<MealMonthAgenda
							plannerId={plannerId}
							calendar={calendar}
							savedItems={savedItems}
						/>
					) : (
						<MealCalendar
							calendar={calendar}
							savedItems={savedItems}
							onMealClick={onMealClick}
						/>
					))}
				{viewType === 'week' && (
					<MealWeekView
						calendar={calendar}
						savedItems={savedItems}
						plannerId={plannerId}
						onMealClick={onMealClick}
					/>
				)}
				{viewType === 'list' && (
					<MealListView
						plannerId={plannerId}
						calendar={calendar}
						savedItems={savedItems}
					/>
				)}
			</Flex>
		</Stack>
	);
}

export function CalendarView({
	plannerId,
	calendar,
	savedItems,
}: Props): ReactElement {
	const [clickedEvent, setClickedEvent] = useState<CalendarEvent | null>(null);

	return (
		<CalendarProvider>
			<CalendarModalProvider plannerId={plannerId}>
				<CalendarViewContent
					plannerId={plannerId}
					savedItems={savedItems}
					calendar={calendar}
					clickedEvent={clickedEvent}
					onClose={() => setClickedEvent(null)}
					onMealClick={setClickedEvent}
				/>
			</CalendarModalProvider>
		</CalendarProvider>
	);
}
