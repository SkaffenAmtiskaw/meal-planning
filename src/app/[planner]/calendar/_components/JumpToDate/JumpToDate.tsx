'use client';

import type { AriaAttributes, ReactElement } from 'react';

import { useDisclosure } from '@mantine/hooks';

import { DateTime } from 'luxon';

import { AdaptivePopover, DatePickerGrid } from '@/_components';

import { useCalendarContext } from '../Calendar';
import { useMealDates } from '../../_hooks/useCalendarMeals';

type JumpToDateProps = {
	/**
	 * Renders the element that opens the picker, given whether the picker is
	 * open and the click handler that opens or closes it. The element has to
	 * take a ref, since the desktop popover anchors to it.
	 */
	renderTrigger: (trigger: {
		opened: boolean;
		onClick: () => void;
	}) => ReactElement<AriaAttributes>;
};

/**
 * Opens a date picker from the trigger it renders, with the date in view
 * selected and a dot on each day with meals, and moves the calendar to the
 * date picked. The picker is a popover on desktop and a bottom sheet on phones.
 */
export function JumpToDate({ renderTrigger }: JumpToDateProps): ReactElement {
	const { selectedDate, navigateToDate } = useCalendarContext();
	const mealDates = useMealDates();
	const [opened, { toggle, close }] = useDisclosure(false);

	return (
		<AdaptivePopover
			opened={opened}
			onClose={close}
			title="Jump to date"
			target={renderTrigger({ opened, onClick: toggle })}
		>
			<DatePickerGrid
				value={selectedDate.toISODate()}
				markedDates={mealDates}
				onChange={(date) => {
					navigateToDate(DateTime.fromISO(date));
					close();
				}}
			/>
		</AdaptivePopover>
	);
}
