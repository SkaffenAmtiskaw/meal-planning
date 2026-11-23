'use client';

import { type ReactElement, useState } from 'react';

import { DatePicker } from '@mantine/dates';
import { useMergedRef } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import clsx from 'clsx';
import { DateTime } from 'luxon';

import { useIsMobile, useSwipe, useTodayOrThrow } from '@/_hooks';

import { useDatePickerKeys } from './useDayKeys';
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
	const today = useTodayOrThrow();
	// Phones get touch sizes: Mantine's lg gives 48px day cells and month arrows.
	const isMobile = useIsMobile();
	const size = isMobile ? 'lg' : 'sm';
	const marked = new Set(markedDates);
	// The month on screen, which the grid needs to tell which days are outside it.
	const [shownMonth, setShownMonth] = useState(
		() => value ?? (today.toISODate() as string),
	);

	// On phones a swipe across the grid pages the month: left to the next, right to the previous.
	const swipeRef = useSwipe<HTMLDivElement>({
		enabled: isMobile,
		onSwipe: (direction) => {
			if (direction === 'down') {
				return;
			}
			setShownMonth(
				(month) =>
					DateTime.fromISO(month)
						.plus({ months: direction === 'left' ? 1 : -1 })
						.startOf('month')
						.toISODate() as string,
			);
		},
	});

	// PageUp, PageDown, Home and End move focus between days, which Mantine leaves alone.
	const { ref: keysRef, getDayKeyProps } = useDatePickerKeys({
		shownMonth,
		onShownMonthChange: setShownMonth,
	});
	const gridRef = useMergedRef(swipeRef, keysRef);

	const isToday = (date: string) =>
		DateTime.fromISO(date).hasSame(today, 'day');

	return (
		<div ref={gridRef} className={clsx(isMobile && classes.swipeArea)}>
			<DatePicker
				value={value}
				date={shownMonth}
				onDateChange={setShownMonth}
				size={size}
				// On phones the grid spreads across the sheet, however wide the phone is.
				fullWidth={isMobile}
				classNames={{
					day: clsx(classes.day, isMobile && classes.touch),
					weekday: clsx(isMobile && classes.touchWeekday),
				}}
				previousIcon={<IconChevronLeft size={isMobile ? 20 : 16} />}
				nextIcon={<IconChevronRight size={isMobile ? 20 : 16} />}
				previousLabel="Previous month"
				nextLabel="Next month"
				// A single letter per weekday, like "S", which none of Mantine's format strings give.
				weekdayFormat={(date) => DateTime.fromISO(date).toFormat('ccccc')}
				/**
				 * The day button is what takes focus, so it carries aria-current rather than the number inside it.
				 * data-marked lets the stylesheet draw the dot under the number.
				 */
				getDayProps={(date) => ({
					...getDayKeyProps(date),
					'aria-current': isToday(date) ? 'date' : undefined,
					...(marked.has(date) && { 'data-marked': true }),
				})}
				renderDay={(date) => {
					const day = DateTime.fromISO(date);
					return (
						<NumberMark
							size={size}
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
		</div>
	);
}
