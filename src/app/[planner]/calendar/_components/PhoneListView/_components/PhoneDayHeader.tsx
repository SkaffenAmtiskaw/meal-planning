import type { ReactElement, ReactNode } from 'react';

import { Divider, Group } from '@mantine/core';

import type { DateTime } from 'luxon';

import { PhoneDayLabel } from './PhoneDayLabel';

interface PhoneDayHeaderProps {
	date: DateTime;
	isToday: boolean;
	/** Shown at the end of the row, such as the add-meal button. */
	addMealButton?: ReactNode;
}

// A phone list day's header row: its label, a hairline rule, then its add-meal button.
export function PhoneDayHeader({
	date,
	isToday,
	addMealButton,
}: PhoneDayHeaderProps): ReactElement {
	return (
		<Group gap="xs" wrap="nowrap" mih={28}>
			<PhoneDayLabel date={date} isToday={isToday} />
			<Divider flex={1} color="chalk.2" />
			{addMealButton}
		</Group>
	);
}
