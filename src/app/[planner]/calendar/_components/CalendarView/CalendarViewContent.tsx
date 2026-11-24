'use client';

import type { ReactElement } from 'react';

import { Flex, Stack } from '@mantine/core';

import { useIsMobile } from '@/_hooks';

import { useCalendarContext } from '../Calendar';
import {
	CalendarHeaderDesktop,
	CalendarHeaderMobile,
} from '../CalendarHeader/CalendarHeader';
import { MealCalendar } from '../MealCalendar/MealCalendar';
import { MealListView } from '../MealListView/MealListView';
import { MealMonthAgenda } from '../MealMonthAgenda/MealMonthAgenda';
import { MealWeekView } from '../MealWeekView/MealWeekView';

/** The calendar's header and the view it's set to, in the phone or desktop layout. */
export function CalendarViewContent({
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
