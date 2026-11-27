'use client';

import { type ReactElement, useState } from 'react';

import { Skeleton } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useMergedRef } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import clsx from 'clsx';
import { DateTime } from 'luxon';

import { useIsMobile, useSwipe, useToday } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

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
	// Today is null until the viewer's day is known. The ring appears once it is.
	const { today, possibleDays, isKnown } = useToday();
	// Phones get touch sizes: Mantine's lg gives 48px day cells and month arrows.
	const isMobile = useIsMobile();
	const size = isMobile ? 'lg' : 'sm';
	const marked = new Set(markedDates);
	// The month the user paged to, if they have.
	const [pagedMonth, setPagedMonth] = useState<string | null>(null);
	// With no date selected the grid opens on today's month, which isn't known yet on the first
	// or last day of a month, so until then it draws a stand-in month under skeletons.
	const monthKnown = value !== null || isKnown('month');
	// The month on screen, which the grid needs to tell which days are outside it.
	const shownMonth =
		pagedMonth ?? value ?? (possibleDays[0].toISODate() as string);

	// Paging waits for the month, since it pages from the month on screen.
	const pageTo = (month: string) => {
		if (monthKnown) {
			setPagedMonth(month);
		}
	};

	// On phones a swipe across the grid pages the month: left to the next, right to the previous.
	const swipeRef = useSwipe<HTMLDivElement>({
		enabled: isMobile,
		onSwipe: (direction) => {
			if (direction === 'down') {
				return;
			}
			pageTo(
				DateTime.fromISO(shownMonth)
					.plus({ months: direction === 'left' ? 1 : -1 })
					.startOf('month')
					.toISODate() as string,
			);
		},
	});

	// PageUp, PageDown, Home and End move focus between days, which Mantine leaves alone.
	const { ref: keysRef, getDayKeyProps } = useDatePickerKeys({
		shownMonth,
		onShownMonthChange: pageTo,
	});
	const gridRef = useMergedRef(swipeRef, keysRef);

	const isToday = (date: string) =>
		today !== null && DateTime.fromISO(date).hasSame(today, 'day');

	return (
		<div ref={gridRef} className={clsx(isMobile && classes.swipeArea)}>
			<DatePicker
				value={value}
				date={shownMonth}
				onDateChange={pageTo}
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
				monthLabelFormat={(month) => (
					// A skeleton is full width by default, which would push the title off center.
					<Skeleton visible={!monthKnown} width="fit-content">
						{formatDate(month, 'monthYear')}
					</Skeleton>
				)}
				// A single letter per weekday, like "S", which none of Mantine's format strings give.
				weekdayFormat={(date) => DateTime.fromISO(date).toFormat('ccccc')}
				/**
				 * The day button is what takes focus, so it carries aria-current rather than the number inside it.
				 * data-marked lets the stylesheet draw the dot under the number.
				 */
				getDayProps={(date) => ({
					...getDayKeyProps(date),
					disabled: !monthKnown,
					'aria-current': isToday(date) ? 'date' : undefined,
					...(marked.has(date) && { 'data-marked': true }),
				})}
				renderDay={(date) => {
					const day = DateTime.fromISO(date);
					return (
						// Sized to the number rather than the cell, so the number stays centered over its dot. The xl radius rounds it into a circle.
						<Skeleton visible={!monthKnown} width="fit-content" radius="xl">
							<NumberMark
								size={size}
								ring={isToday(date)}
								filled={date === value}
								muted={!day.hasSame(DateTime.fromISO(shownMonth), 'month')}
							>
								{day.day}
							</NumberMark>
						</Skeleton>
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
