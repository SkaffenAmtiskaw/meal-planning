'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { Popover } from '@mantine/core';

import { DateTime } from 'luxon';

import { DatePickerGrid } from '@/_components';

import { useCalendarContext } from '../Calendar';

type JumpToDateProps = {
	/**
	 * Renders the element that opens the picker, given whether the picker is
	 * open and the click handler that opens or closes it. The element has to
	 * take a ref, since the popover anchors to it.
	 */
	renderTrigger: (trigger: {
		opened: boolean;
		onClick: () => void;
	}) => ReactElement;
};

/**
 * Opens a date picker from the trigger it renders, with the date in view
 * selected, and moves the calendar to the date picked.
 */
export function JumpToDate({ renderTrigger }: JumpToDateProps): ReactElement {
	const { selectedDate, navigateToDate } = useCalendarContext();
	const [opened, setOpened] = useState(false);

	return (
		<Popover opened={opened} onChange={setOpened} trapFocus>
			<Popover.Target>
				{renderTrigger({ opened, onClick: () => setOpened((o) => !o) })}
			</Popover.Target>
			<Popover.Dropdown>
				<DatePickerGrid
					value={selectedDate.toISODate()}
					onChange={(date) => {
						navigateToDate(DateTime.fromISO(date));
						setOpened(false);
					}}
				/>
			</Popover.Dropdown>
		</Popover>
	);
}
