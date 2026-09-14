'use client';

import type { ReactElement, ReactNode } from 'react';

import {
	ActionIcon,
	Button,
	Group,
	SegmentedControl,
	Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { DateTime } from 'luxon';

import { type CalendarViewType, useCalendarContext } from './CalendarContext';
import styles from './CalendarHeader.module.css';

import { formatWeekRange } from './_utils/formatWeekRange';

export interface CalendarHeaderProps {
	rightSection?: ReactNode;
	availableViews?: CalendarViewType[];
}

const VIEW_LABELS: Record<CalendarViewType, string> = {
	month: 'Month',
	week: 'Week',
	list: 'List',
};

const DEFAULT_VIEWS: CalendarViewType[] = ['month', 'week', 'list'];

const LABEL_FORMATTERS: Record<CalendarViewType, (date: DateTime) => string> = {
	month: (date) => date.toFormat('MMMM yyyy'),
	week: formatWeekRange,
	list: (date) => date.toFormat('MMMM yyyy'),
};

export function CalendarHeader({
	rightSection,
	availableViews,
}: CalendarHeaderProps): ReactElement {
	const {
		selectedDate,
		viewType,
		goToToday,
		goToPrevious,
		goToNext,
		setViewType,
		navigateToDate,
	} = useCalendarContext();

	const viewData = (availableViews ?? DEFAULT_VIEWS).map((view) => ({
		value: view,
		label: VIEW_LABELS[view],
	}));

	const label = LABEL_FORMATTERS[viewType](selectedDate);

	return (
		<Group
			className={styles.header}
			pos="sticky"
			top={0}
			bg="var(--mantine-color-body)"
			justify="space-between"
			align="center"
			wrap="wrap"
			p="md"
			style={{ zIndex: 100 }}
		>
			<Group>
				<Button variant="default" onClick={goToToday}>
					Today
				</Button>
				{viewType !== 'list' && (
					<>
						<ActionIcon
							variant="subtle"
							aria-label="Previous"
							onClick={goToPrevious}
						>
							<IconChevronLeft />
						</ActionIcon>
						<ActionIcon variant="subtle" aria-label="Next" onClick={goToNext}>
							<IconChevronRight />
						</ActionIcon>
					</>
				)}
				<Text size="lg" fw={500}>
					{label}
				</Text>
			</Group>

			<Group gap="sm" align="flex-end">
				{rightSection}
				<SegmentedControl
					value={viewType}
					onChange={(value) => setViewType(value as CalendarViewType)}
					data={viewData}
				/>
				<DatePickerInput
					label="Date"
					valueFormat="M/D/YYYY"
					previousIcon={<IconChevronLeft />}
					nextIcon={<IconChevronRight />}
					value={selectedDate.toISODate()}
					onChange={(value) => {
						if (value) {
							navigateToDate(DateTime.fromISO(value as string));
						}
					}}
				/>
			</Group>
		</Group>
	);
}
