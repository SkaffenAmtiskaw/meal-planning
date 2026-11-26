import type { ReactElement } from 'react';

import { Text } from '@mantine/core';

import { formatDate } from '@/_utils/formatDate';

type Props = {
	// An ISO date, or '' while the meal has no date.
	date: string;
};

/**
 * A meal modal's line under its title: the meal's date, such as "Friday,
 * November 27". With no date it's an empty line that keeps its height, so the
 * header doesn't jump when a date is picked.
 */
export function MealDateSubtitle({ date }: Props): ReactElement {
	return (
		<Text size="sm" c="var(--text-muted)" data-testid="modal-subtitle">
			{date === '' ? ' ' : formatDate(date, 'weekdayMonthDay')}
		</Text>
	);
}
