'use client';

import type { ReactElement } from 'react';

import { Box } from '@mantine/core';

import { useToday, useTodayOrThrow } from '@/_hooks';

import styles from './PhoneListView.module.css';

import { useListScroll } from '../../_hooks/useListScroll';
import { getListDayRange } from '../_utils/getListDayRange';
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
export function PhoneListView(props: PhoneListViewProps): ReactElement {
	const { isKnown } = useToday();

	return (
		<Box bg="chalk.0" flex={1} mih={0} display="flex">
			{isKnown('day') ? (
				<PhoneListDays {...props} />
			) : (
				<Box flex={1} className={styles.scrollRegion}>
					<PhoneDayListSkeleton />
				</Box>
			)}
		</Box>
	);
}

function PhoneListDays({ plannerId }: PhoneListViewProps): ReactElement {
	const today = useTodayOrThrow();
	const days = getListDayRange(today);
	const { regionRef, dayRef } = useListScroll(days);

	return (
		<Box ref={regionRef} flex={1} className={styles.scrollRegion}>
			<ul className={styles.days}>
				{days.map((date) => (
					<li key={date.toISODate()}>
						<PhoneDaySection
							ref={dayRef(date)}
							date={date}
							today={today}
							plannerId={plannerId}
						/>
					</li>
				))}
			</ul>
		</Box>
	);
}
