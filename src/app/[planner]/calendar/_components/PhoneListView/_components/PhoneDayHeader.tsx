import type { ReactElement, ReactNode } from 'react';

import { Divider, Group } from '@mantine/core';

interface PhoneDayHeaderProps {
	/** The day's label, or a skeleton in its place. */
	label: ReactNode;
	/** Shown at the end of the row, such as the add-meal button. */
	addMealButton?: ReactNode;
}

// A phone list day's header row: its label, a hairline rule, then its add-meal button.
export function PhoneDayHeader({
	label,
	addMealButton,
}: PhoneDayHeaderProps): ReactElement {
	return (
		<Group gap="xs" wrap="nowrap" mih={28}>
			{label}
			<Divider flex={1} color="chalk.2" />
			{addMealButton}
		</Group>
	);
}
