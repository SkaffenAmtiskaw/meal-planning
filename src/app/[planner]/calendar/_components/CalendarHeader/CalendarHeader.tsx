'use client';

import type { ReactElement } from 'react';

import {
	Button,
	Group,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

import { DateFieldTrigger } from '@/_components';
import { type TodayPeriod, useToday } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

import {
	CalendarNextButton,
	CalendarPreviousButton,
	CalendarTodayButton,
	CalendarTodayPillButton,
} from './CalendarNavButtons';
import styles from './CalendarHeader.module.css';

import { AddMealButton } from '../AddMealButton';
import { type CalendarViewType, useCalendarContext } from '../Calendar';
import { JumpToDate } from '../JumpToDate';
import {
	DEFAULT_VIEWS,
	LABEL_FORMATTERS,
	VIEW_LABELS,
} from './_utils/formatCalendarLabel';

const MOBILE_VIEWS: CalendarViewType[] = ['month', 'list'];

/**
 * The period each view's label shows. The label starts on the one today falls
 * in, so it can be drawn once that period is known.
 */
const LABEL_PERIODS: Record<CalendarViewType, TodayPeriod> = {
	month: 'month',
	week: 'week',
	list: 'month',
};

export function CalendarHeaderDesktop(): ReactElement {
	const { selectedDate, viewType, setViewType } = useCalendarContext();
	const { isKnown } = useToday();

	const viewData = DEFAULT_VIEWS.map((view) => ({
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
			// Mantine has no z-index prop on Group, and the sticky header has to stay above the calendar scrolling under it.
			style={{ zIndex: 100 }}
		>
			<Group>
				<CalendarTodayButton />
				{viewType !== 'list' && (
					<>
						<CalendarPreviousButton />
						<CalendarNextButton />
					</>
				)}
				<Skeleton
					visible={!isKnown(LABEL_PERIODS[viewType])}
					width="auto"
					data-testid="label-skeleton"
				>
					<Text size="lg" fw={500}>
						{label}
					</Text>
				</Skeleton>
			</Group>

			<Group gap="sm" align="flex-end">
				<AddMealButton />
				<SegmentedControl
					value={viewType}
					onChange={(value) => setViewType(value as CalendarViewType)}
					data={viewData}
				/>
				{/* The field shows the selected day, which starts on today, so it waits for today. */}
				<Skeleton
					visible={!isKnown('day')}
					width="auto"
					data-testid="date-field-skeleton"
				>
					<JumpToDate
						renderTrigger={({ opened, onClick }) => (
							<DateFieldTrigger
								label="Date"
								variant="notched"
								rightSection={
									opened ? (
										<IconChevronUp size={16} />
									) : (
										<IconChevronDown size={16} />
									)
								}
								onClick={onClick}
							>
								{formatDate(selectedDate, 'numericDate')}
							</DateFieldTrigger>
						)}
					/>
				</Skeleton>
			</Group>
		</Group>
	);
}

export function CalendarHeaderMobile(): ReactElement {
	const { selectedDate, viewType, setViewType } = useCalendarContext();
	const { isKnown } = useToday();

	const label = LABEL_FORMATTERS[viewType](selectedDate);

	const viewData = MOBILE_VIEWS.map((view) => ({
		value: view,
		label: VIEW_LABELS[view],
	}));

	return (
		<Stack
			className={styles.header}
			gap="xs"
			p="md"
			pos="sticky"
			top={0}
			bg="var(--mantine-color-body)"
			// Mantine has no z-index prop on Stack, and the sticky header has to stay above the calendar scrolling under it.
			style={{ zIndex: 100 }}
		>
			<Group justify="space-between" align="center" wrap="nowrap" w="100%">
				<Group gap="xs" align="center" wrap="nowrap" justify="center">
					{viewType !== 'list' && <CalendarPreviousButton size="lg" />}

					<Skeleton
						visible={!isKnown(LABEL_PERIODS[viewType])}
						width="auto"
						data-testid="label-skeleton"
					>
						<JumpToDate
							renderTrigger={({ onClick }) => (
								<Button
									variant="subtle"
									size="compact-sm"
									rightSection={<IconChevronDown size={14} />}
									onClick={onClick}
								>
									{label}
								</Button>
							)}
						/>
					</Skeleton>

					{viewType !== 'list' && <CalendarNextButton size="lg" />}
				</Group>

				<CalendarTodayPillButton />
			</Group>

			<SegmentedControl
				size="lg"
				fullWidth
				value={viewType}
				onChange={(value) => setViewType(value as CalendarViewType)}
				data={viewData}
			/>
		</Stack>
	);
}
