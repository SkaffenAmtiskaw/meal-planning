'use client';

import type { ReactElement } from 'react';

import { Box } from '@mantine/core';

import { useToday, useTodayOrThrow } from '@/_hooks';

import styles from './ListView.module.css';

import { useListScroll } from '../../_hooks/useListScroll';
import { getListDayRange } from '../_utils/getListDayRange';
import { DayRow } from './_components/DayRow';

interface ListViewProps {
	plannerId: string;
}

/**
 * The list's days run from today, so it waits for the viewer's day. It never
 * shows at first paint, since the calendar opens on month view.
 */
export function ListView(props: ListViewProps): ReactElement | null {
	const { isKnown } = useToday();
	if (!isKnown('day')) return null;

	return <ListViewDays {...props} />;
}

function ListViewDays({ plannerId }: ListViewProps): ReactElement {
	const today = useTodayOrThrow();
	const days = getListDayRange(today);
	const { regionRef, dayRef } = useListScroll(days);

	return (
		<Box ref={regionRef} className={styles.scrollRegion} flex={1} mih={0}>
			<ul className={styles.innerColumn}>
				{days.map((date) => (
					<li key={date.toISODate()}>
						<DayRow
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
