'use client';

import type { ReactElement } from 'react';

import { Box } from '@mantine/core';

import { useToday } from '@/_hooks';

import styles from './PhoneListView.module.css';

import { MobileAddMealButton } from '../AddMealButton';
import { ScrollingDayList } from '../ScrollingDayList/ScrollingDayList';
import { PhoneDayListSkeleton } from './_components/PhoneDayListSkeleton';
import { PhoneDaySection } from './_components/PhoneDaySection';

interface PhoneListViewProps {
	plannerId: string;
}

/**
 * The list view on a phone: one scroll of days, each with its meals. The
 * list's days run from today, so it shows skeleton days until the viewer's
 * day is known.
 */
export function PhoneListView({ plannerId }: PhoneListViewProps): ReactElement {
	const { isKnown } = useToday();

	return (
		<Box bg="chalk.0" flex={1} mih={0} display="flex">
			{isKnown('day') ? (
				<ScrollingDayList
					listClassName={styles.days}
					renderDay={({ ref, date, today }) => (
						<PhoneDaySection
							ref={ref}
							date={date}
							today={today}
							plannerId={plannerId}
						/>
					)}
				/>
			) : (
				<Box flex={1} mih={0} className={styles.skeleton}>
					<PhoneDayListSkeleton />
				</Box>
			)}
			<MobileAddMealButton />
		</Box>
	);
}
