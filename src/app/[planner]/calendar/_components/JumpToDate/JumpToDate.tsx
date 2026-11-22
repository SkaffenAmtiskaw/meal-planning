'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';

import { DateTime } from 'luxon';

import { AdaptivePopover, DatePickerGrid } from '@/_components';

import { useCalendarContext } from '../Calendar';

type JumpToDateProps = {
	/**
	 * Renders the element that opens the picker, given whether the picker is
	 * open and the click handler that opens or closes it. The element has to
	 * take a ref, since the desktop popover anchors to it.
	 */
	renderTrigger: (trigger: {
		opened: boolean;
		onClick: () => void;
	}) => ReactElement;
};

/**
 * Opens a date picker from the trigger it renders, with the date in view
 * selected, and moves the calendar to the date picked. The picker is a
 * popover on desktop and a bottom sheet on phones.
 */
export function JumpToDate({ renderTrigger }: JumpToDateProps): ReactElement {
	const { selectedDate, navigateToDate } = useCalendarContext();
	const [opened, setOpened] = useState(false);
	const close = () => setOpened(false);

	return (
		<AdaptivePopover
			opened={opened}
			onClose={close}
			title="Jump to date"
			target={renderTrigger({ opened, onClick: () => setOpened((o) => !o) })}
		>
			<DatePickerGrid
				value={selectedDate.toISODate()}
				onChange={(date) => {
					navigateToDate(DateTime.fromISO(date));
					close();
				}}
			/>
		</AdaptivePopover>
	);
}
