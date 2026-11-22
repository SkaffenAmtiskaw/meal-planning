import type { ReactElement } from 'react';

import { Badge, Text } from '@mantine/core';

interface WeekDayLabelProps {
	label: string;
	isToday: boolean;
}

export function WeekDayLabel({
	label,
	isToday,
}: WeekDayLabelProps): ReactElement {
	if (isToday) {
		return (
			<Badge variant="ring" data-testid="week-day-today">
				{label}
			</Badge>
		);
	}

	return (
		<Text fw={700} size="sm" data-testid="week-day-label">
			{label}
		</Text>
	);
}
