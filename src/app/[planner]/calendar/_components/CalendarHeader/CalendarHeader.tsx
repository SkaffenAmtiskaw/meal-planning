'use client';

import type { ReactElement } from 'react';

import { Button, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { DateFieldTrigger } from '@/_components';

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

export function CalendarHeaderDesktop(): ReactElement {
	const { selectedDate, viewType, setViewType } = useCalendarContext();

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
				<Text size="lg" fw={500}>
					{label}
				</Text>
			</Group>

			<Group gap="sm" align="flex-end">
				<AddMealButton />
				<SegmentedControl
					value={viewType}
					onChange={(value) => setViewType(value as CalendarViewType)}
					data={viewData}
				/>
				<JumpToDate
					renderTrigger={({ opened, onClick }) => (
						<DateFieldTrigger
							label="Date"
							date={selectedDate}
							dateStyle="numericDate"
							opened={opened}
							onClick={onClick}
						/>
					)}
				/>
			</Group>
		</Group>
	);
}

export function CalendarHeaderMobile(): ReactElement {
	const { selectedDate, viewType, setViewType } = useCalendarContext();

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
