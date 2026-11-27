'use client';

import type { ReactElement } from 'react';

import { DateTime } from 'luxon';

import { DatePickerPopover, type DatePickerPopoverProps } from '@/_components';

import { useCalendarContext } from '../Calendar';
import { useMealDates } from '../../_hooks/useCalendarMeals';

/**
 * Opens a date picker from the trigger it renders, with the date in view
 * selected and a dot on each day with meals, and moves the calendar to the
 * date picked. The picker is a popover on desktop and a bottom sheet on phones.
 */
export function JumpToDate({
	renderTrigger,
}: Pick<DatePickerPopoverProps, 'renderTrigger'>): ReactElement {
	const { selectedDate, navigateToDate } = useCalendarContext();
	const mealDates = useMealDates();

	return (
		<DatePickerPopover
			value={selectedDate.toISODate()}
			markedDates={mealDates}
			sheetTitle="Jump to date"
			onChange={(date) => navigateToDate(DateTime.fromISO(date))}
			renderTrigger={renderTrigger}
		/>
	);
}
