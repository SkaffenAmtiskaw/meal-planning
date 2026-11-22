'use client';

import type { ReactElement } from 'react';

import { DatePicker } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { DateTime } from 'luxon';

type DatePickerGridProps = {
	// The selected date as an ISO date, or null when none is selected.
	value: string | null;
	// Called with the ISO date of the day picked.
	onChange: (date: string) => void;
};

/**
 * A month of days to page through and pick from. It only reports the pick, so
 * its caller decides what a pick does and whether the picker closes.
 */
export function DatePickerGrid({
	value,
	onChange,
}: DatePickerGridProps): ReactElement {
	return (
		<DatePicker
			value={value}
			// Mantine's DatePicker opens on today's month unless it's given a month to open on.
			defaultDate={value ?? undefined}
			previousIcon={<IconChevronLeft size={16} />}
			nextIcon={<IconChevronRight size={16} />}
			previousLabel="Previous month"
			nextLabel="Next month"
			// A single letter per weekday, like "S", which none of Mantine's format strings give.
			weekdayFormat={(date) => DateTime.fromISO(date).toFormat('ccccc')}
			onChange={(date) => {
				if (date) {
					onChange(date);
				}
			}}
		/>
	);
}
