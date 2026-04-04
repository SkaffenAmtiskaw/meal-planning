'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActionIcon, Button, Group, SegmentedControl } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import {
	createViewList,
	createViewMonthAgenda,
	createViewMonthGrid,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react';

import styles from './CalendarView.module.css';

import { getWeekStart } from '../../_utils/getWeekStart';
import type {
	MealEvent,
	SavedItem,
	SerializedDay,
} from '../../_utils/toScheduleXEvents';
import { toScheduleXEvents } from '../../_utils/toScheduleXEvents';
import { AddMealButton } from '../AddMealButton/AddMealButton';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { MonthGridEvent } from '../MonthGridEvent/MonthGridEvent';
import { WeekView } from '../WeekView/WeekView';

type Props = {
	plannerId: string;
	savedItems: SavedItem[];
	calendar: SerializedDay[];
};

export type ViewType = 'month' | 'week' | 'list';

const DESKTOP_VIEWS: { label: string; value: ViewType }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'Week', value: 'week' },
	{ label: 'List', value: 'list' },
];

const MOBILE_VIEWS: { label: string; value: ViewType }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'List', value: 'list' },
];

export const getScheduleXViewId = (
	viewType: Exclude<ViewType, 'week'>,
	isMobile: boolean,
): string => {
	if (viewType === 'list') return 'list';
	return isMobile ? 'month-agenda' : 'month-grid';
};

type InternalCalendarApp = {
	$app?: {
		calendarState?: {
			setView: (viewId: string, date: unknown) => void;
		};
		datePickerState?: {
			selectedDate: { value: unknown };
		};
	};
};

export const CalendarView = ({ plannerId, savedItems, calendar }: Props) => {
	const isMobile = useMediaQuery('(max-width: 62em)');
	const eventsService = useState(() => createEventsServicePlugin())[0];
	const [initialEvents] = useState(() =>
		toScheduleXEvents(calendar, savedItems),
	);
	const [clickedEvent, setClickedEvent] = useState<MealEvent | null>(null);
	const [viewType, setViewType] = useState<ViewType>('month');

	const handleMealAdded = useCallback(
		(newCalendar: SerializedDay[]) => {
			eventsService.set(toScheduleXEvents(newCalendar, savedItems));
		},
		[eventsService, savedItems],
	);

	const AddMealButtonWithData = useCallback(
		() => (
			<AddMealButton
				plannerId={plannerId}
				savedItems={savedItems}
				onMealAdded={handleMealAdded}
			/>
		),
		[plannerId, savedItems, handleMealAdded],
	);

	const ViewSwitcher = useCallback(
		() => (
			<SegmentedControl
				data-testid="view-switcher"
				data={isMobile ? MOBILE_VIEWS : DESKTOP_VIEWS}
				value={viewType}
				onChange={(v) => setViewType(v as ViewType)}
			/>
		),
		[isMobile, viewType],
	);

	const HeaderRight = useCallback(
		() => (
			<Group gap="xs">
				<AddMealButtonWithData />
				<ViewSwitcher />
			</Group>
		),
		[AddMealButtonWithData, ViewSwitcher],
	);

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

	const [currentWeekStart, setCurrentWeekStart] = useState(() =>
		getWeekStart(
			(calendarApp as unknown as InternalCalendarApp)?.$app?.datePickerState
				?.selectedDate.value as string | undefined,
		),
	);

	// TODO: week navigation will be moved into a dedicated header component (Replace Calendar Header)
	const handlePrevWeek = useCallback(() => {
		setCurrentWeekStart((w) => w.subtract({ days: 7 }));
	}, []);

	const handleNextWeek = useCallback(() => {
		setCurrentWeekStart((w) => w.add({ days: 7 }));
	}, []);

	const handleToday = useCallback(() => {
		setCurrentWeekStart(getWeekStart(undefined));
	}, []);

	// Sync our SegmentedControl with schedule-x's internal view state.
	// schedule-x has no public API for this; we use the internal $app.
	useEffect(() => {
		if (viewType === 'week') return;
		const $app = (calendarApp as unknown as InternalCalendarApp)?.$app;
		if (!$app?.calendarState) return;
		const viewId = getScheduleXViewId(viewType, isMobile);
		$app.calendarState.setView(
			viewId,
			$app.datePickerState?.selectedDate.value,
		);
	}, [viewType, isMobile, calendarApp]);

	// Fall back to 'list' if 'week' is active when switching to mobile.
	useEffect(() => {
		if (isMobile && viewType === 'week') {
			setViewType('list');
		}
	}, [isMobile, viewType]);

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
					<Group justify="space-between" mb="sm" data-testid="week-view-header">
						<Group gap="xs">
							<ActionIcon
								variant="subtle"
								onClick={handlePrevWeek}
								data-testid="week-prev"
								aria-label="Previous week"
							>
								<IconChevronLeft size={16} />
							</ActionIcon>
							<Button
								variant="subtle"
								size="xs"
								onClick={handleToday}
								data-testid="week-today"
							>
								Today
							</Button>
							<ActionIcon
								variant="subtle"
								onClick={handleNextWeek}
								data-testid="week-next"
								aria-label="Next week"
							>
								<IconChevronRight size={16} />
							</ActionIcon>
						</Group>
						<ViewSwitcher />
					</Group>
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
