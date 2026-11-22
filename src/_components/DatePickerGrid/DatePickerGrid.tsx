'use client';

import { type ReactElement, useState } from 'react';

import { DatePicker } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { DateTime } from 'luxon';

import classes from './DatePickerGrid.module.css';

import { NumberMark } from '../NumberMark';

type DatePickerGridProps = {
	// The selected date as an ISO date, or null when none is selected.
	value: string | null;
	// Called with the ISO date of the day picked.
	onChange: (date: string) => void;
	// ISO dates that get a dot under their number, such as the days with meals.
	markedDates?: string[];
};

/**
 * A month of days to page through and pick from. It only reports the pick, so
 * its caller decides what a pick does and whether the picker closes.
 */
export function DatePickerGrid({
	value,
	onChange,
	markedDates = [],
}: DatePickerGridProps): ReactElement {
	const today = DateTime.now();
	const marked = new Set(markedDates);
	// The month on screen, which the grid needs to tell which days are outside it.
	const [shownMonth, setShownMonth] = useState(
		() => value ?? today.toISODate(),
	);

	const isToday = (date: string) =>
		DateTime.fromISO(date).hasSame(today, 'day');

	return (
		<DatePicker
			value={value}
			date={shownMonth}
			onDateChange={setShownMonth}
			classNames={{ day: classes.day }}
			previousIcon={<IconChevronLeft size={16} />}
			nextIcon={<IconChevronRight size={16} />}
			previousLabel="Previous month"
			nextLabel="Next month"
			// A single letter per weekday, like "S", which none of Mantine's format strings give.
			weekdayFormat={(date) => DateTime.fromISO(date).toFormat('ccccc')}
			// The day button is what takes focus, so it carries aria-current rather than the number inside it.
			// data-marked lets the stylesheet draw the dot under the number.
			getDayProps={(date) => ({
				'aria-current': isToday(date) ? 'date' : undefined,
				...(marked.has(date) && { 'data-marked': true }),
			})}
			renderDay={(date) => {
				const day = DateTime.fromISO(date);
				return (
					<NumberMark
						size="sm"
						ring={isToday(date)}
						filled={date === value}
						muted={!day.hasSame(DateTime.fromISO(shownMonth), 'month')}
					>
						{day.day}
					</NumberMark>
				);
			}}
			onChange={(date) => {
				if (date) {
					onChange(date);
				}
			}}
		/>
	);
}
