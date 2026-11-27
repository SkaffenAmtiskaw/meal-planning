'use client';

import type { ReactElement } from 'react';

import { Button, Divider, Skeleton, Text } from '@mantine/core';

import { useToday } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

type TodayFooterProps = {
	// Called with today's ISO date when the Today button is clicked.
	onPick: (date: string) => void;
};

/**
 * The date picker's Today button, which shows today's date and picks it. It
 * only reports the pick, so its caller decides what a pick does.
 */
export function TodayFooter({ onPick }: TodayFooterProps): ReactElement {
	const { today, possibleDays } = useToday();

	return (
		<>
			<Divider />
			<Button
				variant="subtle"
				fullWidth
				justify="space-between"
				disabled={today === null}
				rightSection={
					// Until the day is known, a stand-in date of the same length sizes the skeleton.
					<Skeleton visible={today === null}>
						<Text size="sm" c="var(--text-muted)">
							{formatDate(today ?? possibleDays[0], 'shortWeekdayMonthDay')}
						</Text>
					</Skeleton>
				}
				onClick={today ? () => onPick(today.toISODate() as string) : undefined}
			>
				Today
			</Button>
		</>
	);
}
