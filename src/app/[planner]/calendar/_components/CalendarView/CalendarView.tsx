'use client';

import { useState } from 'react';
import type React from 'react';

import { useMediaQuery } from '@mantine/hooks';

import {
	CalendarHeader,
	CalendarProvider,
	WeekView as CalendarWeekView,
	ListView,
	MonthGrid,
	useCalendarContext,
} from '@/_components/Calendar';

import type { MealEvent } from '../../_utils/toScheduleXEvents';
import { AddMealButton } from '../AddMealButton/AddMealButton';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';

type Props = {
	plannerId: string;
};

type CalendarViewContentProps = {
	plannerId: string;
	clickedEvent: MealEvent | null;
	onClose: () => void;
};

function CalendarViewContent({
	plannerId,
	clickedEvent,
	onClose,
}: CalendarViewContentProps): React.ReactElement {
	const { viewType } = useCalendarContext();
	const isMobile = useMediaQuery('(max-width: 62em)');

	return (
		<>
			<MealDetailModal
				event={clickedEvent}
				plannerId={plannerId}
				onClose={onClose}
			/>
			<CalendarHeader
				rightSection={
					<AddMealButton plannerId={plannerId} onMealAdded={() => {}} />
				}
				availableViews={
					isMobile ? ['month', 'list'] : ['month', 'week', 'list']
				}
			/>
			{viewType === 'month' && <MonthGrid />}
			{viewType === 'week' && <CalendarWeekView />}
			{viewType === 'list' && <ListView />}
		</>
	);
}

export function CalendarView({ plannerId }: Props): React.ReactElement {
	const [clickedEvent, setClickedEvent] = useState<MealEvent | null>(null);

	return (
		<CalendarProvider>
			<CalendarViewContent
				plannerId={plannerId}
				clickedEvent={clickedEvent}
				onClose={() => setClickedEvent(null)}
			/>
		</CalendarProvider>
	);
}
