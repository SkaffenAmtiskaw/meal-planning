'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import {
	Button,
	Group,
	Popover,
	SegmentedControl,
	Stack,
	Text,
} from '@mantine/core';
import { DatePicker, DatePickerInput } from '@mantine/dates';
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
} from '@tabler/icons-react';

import { DateTime } from 'luxon';

import {
	CalendarNextButton,
	CalendarPreviousButton,
	CalendarTodayButton,
	CalendarTodayPillButton,
	type CalendarViewType,
	DEFAULT_VIEWS,
	LABEL_FORMATTERS,
	useCalendarContext,
	VIEW_LABELS,
} from '@/_components/Calendar';
import { AddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import styles from './CalendarHeader.module.css';

const MOBILE_VIEWS: CalendarViewType[] = ['month', 'list'];

export function CalendarHeaderDesktop(): ReactElement {
	const { selectedDate, viewType, setViewType, navigateToDate } =
		useCalendarContext();

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

export function CalendarHeaderMobile(): ReactElement {
	const { selectedDate, viewType, setViewType, navigateToDate } =
		useCalendarContext();
	const [opened, setOpened] = useState(false);

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
			style={{ zIndex: 100 }}
		>
			<Group justify="space-between" align="center" wrap="nowrap" w="100%">
				<Group gap="xs" align="center" wrap="nowrap" justify="center">
					{viewType !== 'list' && <CalendarPreviousButton size="lg" />}

					<Popover opened={opened} onChange={setOpened}>
						<Popover.Target>
							<Button
								variant="subtle"
								size="compact-sm"
								rightSection={<IconChevronDown size={14} />}
								onClick={() => setOpened((o) => !o)}
							>
								{label}
							</Button>
						</Popover.Target>
						<Popover.Dropdown>
							<DatePicker
								value={selectedDate.toISODate()}
								previousIcon={<IconChevronLeft size={16} />}
								nextIcon={<IconChevronRight size={16} />}
								onChange={(value) => {
									if (value) {
										navigateToDate(DateTime.fromISO(value as string));
										setOpened(false);
									}
								}}
							/>
						</Popover.Dropdown>
					</Popover>

					{viewType !== 'list' && <CalendarNextButton size="lg" />}
				</Group>

				<CalendarTodayPillButton data-testid="today-button" />
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
