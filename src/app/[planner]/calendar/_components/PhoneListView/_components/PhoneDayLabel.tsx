import type { ReactElement } from 'react';

import { Badge } from '@mantine/core';

import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';

interface PhoneDayLabelProps {
	date: DateTime;
	isToday: boolean;
}

/**
 * A phone list day's short label, such as "SAT 21 NOV". Today's is navy inside
 * the today ring and marked as the current date, as every calendar view marks
 * today. Every other day's is a muted badge with no fill, so its text has
 * today's type and sits where today's does inside the ring.
 */
export function PhoneDayLabel({
	date,
	isToday,
}: PhoneDayLabelProps): ReactElement {
	const label = formatDate(date, 'shortWeekdayDayMonth');

	if (isToday) {
		return (
			<Badge
				variant="ring"
				size="lg"
				aria-current="date"
				data-testid="phone-day-today"
			>
				{label}
			</Badge>
		);
	}

	return (
		<Badge
			variant="transparent"
			size="lg"
			c="var(--text-muted)"
			data-testid="phone-day-label"
		>
			{label}
		</Badge>
	);
}
