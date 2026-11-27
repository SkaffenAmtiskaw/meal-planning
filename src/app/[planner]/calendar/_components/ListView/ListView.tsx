'use client';

import type { ReactElement } from 'react';

import { useToday } from '@/_hooks';

import styles from './ListView.module.css';

import { ScrollingDayList } from '../ScrollingDayList/ScrollingDayList';
import { DayRow } from './_components/DayRow';

interface ListViewProps {
	plannerId: string;
}

/**
 * The list's days run from today, so it waits for the viewer's day. It never
 * shows at first paint, since the calendar opens on month view.
 */
export function ListView({ plannerId }: ListViewProps): ReactElement | null {
	const { isKnown } = useToday();
	if (!isKnown('day')) return null;

	return (
		<ScrollingDayList
			listClassName={styles.innerColumn}
			renderDay={({ ref, date, today }) => (
				<DayRow ref={ref} date={date} today={today} plannerId={plannerId} />
			)}
		/>
	);
}
