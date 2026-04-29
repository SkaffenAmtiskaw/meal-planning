'use client';

import { useCallback, useMemo, useState } from 'react';

import { useMediaQuery } from '@mantine/hooks';

import {
	createViewList,
	createViewMonthAgenda,
	createViewMonthGrid,
} from '@schedule-x/calendar';
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react';

import { usePlannerContext } from '@/app/[planner]/_components';
import { usePlannerSavedItems } from '@/app/[planner]/calendar/_hooks/usePlannerSavedItems';

import styles from './CalendarView.module.css';

import { useCalendarEvents } from '../../_hooks/useCalendarEvents';
import { useScheduleXSync } from '../../_hooks/useScheduleXSync';
import { useViewType } from '../../_hooks/useViewType';
import { useWeekNavigation } from '../../_hooks/useWeekNavigation';
import type { MealEvent, SerializedDay } from '../../_utils/toScheduleXEvents';
import { CalendarHeader } from '../CalendarHeader/CalendarHeader';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MonthGridEvent } from '../MonthGridEvent/MonthGridEvent';
import { WeekView } from '../WeekView/WeekView';
import { WeekViewHeader } from '../WeekViewHeader/WeekViewHeader';

type Props = {
	plannerId: string;
};

type ScheduleXCalendarApp = {
	$app?: { datePickerState?: { selectedDate: { value: unknown } } };
};

export const CalendarView = ({ plannerId }: Props) => {
	const planner = usePlannerContext();
	const savedItems = usePlannerSavedItems();
	const calendar = planner.calendar as SerializedDay[];

	const isMobile = useMediaQuery('(max-width: 62em)');

	const { eventsService, initialEvents, handleMealAdded } = useCalendarEvents(
		calendar,
		savedItems,
	);
	const { viewType, setViewType } = useViewType(isMobile);

	const [clickedEvent, setClickedEvent] = useState<MealEvent | null>(null);

	const calendarApp = useNextCalendarApp({
		views: [createViewMonthGrid(), createViewMonthAgenda(), createViewList()],
		defaultView: 'month-grid',
		events: initialEvents,
		plugins: [eventsService],
		callbacks: {
			onEventClick: (event) => {
				setClickedEvent(event as unknown as MealEvent);
			},
		},
	});

	const { currentWeekStart, handlePrevWeek, handleNextWeek, handleToday } =
		useWeekNavigation(
			(calendarApp as unknown as ScheduleXCalendarApp)?.$app?.datePickerState
				?.selectedDate.value as string | undefined,
		);

	useScheduleXSync(calendarApp, viewType, isMobile);

	const HeaderRight = useCallback(
		() => (
			<CalendarHeader
				plannerId={plannerId}
				onMealAdded={handleMealAdded}
				viewType={viewType}
				isMobile={isMobile}
				onViewChange={setViewType}
			/>
		),
		[plannerId, handleMealAdded, viewType, isMobile, setViewType],
	);

	const customComponents = useMemo(
		() => ({
			headerContentRightPrepend: HeaderRight,
			monthGridEvent: MonthGridEvent,
		}),
		[HeaderRight],
	);

	return (
		<>
			<MealDetailModal
				event={clickedEvent}
				plannerId={plannerId}
				onClose={() => setClickedEvent(null)}
			/>
			{viewType === 'week' ? (
				<>
					<WeekViewHeader
						onPrev={handlePrevWeek}
						onNext={handleNextWeek}
						onToday={handleToday}
						viewType={viewType}
						isMobile={isMobile}
						onViewChange={setViewType}
					/>
					<WeekView
						calendar={calendar}
						currentWeekStart={currentWeekStart}
						onMealClick={setClickedEvent}
						plannerId={plannerId}
						savedItems={savedItems}
					/>
				</>
			) : (
				<div className={styles.calendarWrapper}>
					<ScheduleXCalendar
						calendarApp={calendarApp}
						customComponents={customComponents}
					/>
				</div>
			)}
		</>
	);
};
