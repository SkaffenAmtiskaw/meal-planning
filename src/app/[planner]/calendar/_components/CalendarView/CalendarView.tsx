'use client';

import type { ReactElement } from 'react';

import { Flex, Stack } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';
import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { CalendarProvider, useCalendarContext } from '../Calendar';
import { CalendarModalProvider } from '../CalendarModal';
import { CalendarDaysProvider } from '../../_hooks/useCalendarMeals';
import { PlannerSavedItemsProvider } from '../../_hooks/usePlannerSavedItems';
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
}: {
	plannerId: string;
}): ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useIsMobile();

	return (
		<Stack gap={0} h="100%">
			{isMobile ? <CalendarHeaderMobile /> : <CalendarHeaderDesktop />}
			<Flex flex={1} mih={0} direction="column">
				{viewType === 'month' &&
					(isMobile ? (
						<MealMonthAgenda plannerId={plannerId} />
					) : (
						<MealCalendar />
					))}
				{viewType === 'week' && <MealWeekView plannerId={plannerId} />}
				{viewType === 'list' && <MealListView plannerId={plannerId} />}
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
			<CalendarDaysProvider calendar={calendar}>
				<CalendarProvider>
					<CalendarModalProvider plannerId={plannerId}>
						<CalendarViewContent plannerId={plannerId} />
					</CalendarModalProvider>
				</CalendarProvider>
			</CalendarDaysProvider>
		</PlannerSavedItemsProvider>
	);
}
