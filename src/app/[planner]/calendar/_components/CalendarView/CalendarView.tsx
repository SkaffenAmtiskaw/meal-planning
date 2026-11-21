'use client';

import type { ReactElement } from 'react';

import { Flex, Stack } from '@mantine/core';

import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { CalendarProvider, useCalendarContext } from '../Calendar';
import { CalendarModalProvider } from '../CalendarModal';
import { PlannerSavedItemsProvider } from '../../_hooks/usePlannerSavedItems';
import type { SavedItem } from '../../types';
import {
	CalendarHeaderDesktop,
	CalendarHeaderMobile,
} from '../CalendarHeader/CalendarHeader';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

type Props = {
	plannerId: string;
	calendar: DayInterface[];
	savedItems: SavedItem[];
};

function CalendarViewContent({
	plannerId,
	savedItems,
	calendar,
}: Props): ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useIsMobile();

	return (
		<Stack gap={0} h="100%">
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
						<MealCalendar calendar={calendar} savedItems={savedItems} />
					))}
				{viewType === 'week' && (
					<MealWeekView
						calendar={calendar}
						savedItems={savedItems}
						plannerId={plannerId}
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
	return (
		<PlannerSavedItemsProvider savedItems={savedItems}>
			<CalendarProvider>
				<CalendarModalProvider plannerId={plannerId}>
					<CalendarViewContent
						plannerId={plannerId}
						savedItems={savedItems}
						calendar={calendar}
					/>
				</CalendarModalProvider>
			</CalendarProvider>
		</PlannerSavedItemsProvider>
	);
}
