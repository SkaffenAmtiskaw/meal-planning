'use client';

import type { ReactElement, ReactNode, RefCallback } from 'react';

import { Box } from '@mantine/core';

import type { DateTime } from 'luxon';

import { useTodayOrThrow } from '@/_hooks';

import styles from './ScrollingDayList.module.css';

import { useListScroll } from '../../_hooks/useListScroll';
import { getListDayRange } from '../_utils/getListDayRange';

interface ScrollingDay {
	// The ref the day's element takes, so the list can scroll to it.
	ref: RefCallback<HTMLElement>;
	date: DateTime;
	today: DateTime;
}

interface ScrollingDayListProps {
	// The layout of the list that holds the days.
	listClassName?: string;
	renderDay: (day: ScrollingDay) => ReactNode;
}

/**
 * A calendar list's days in a scroll region: the window of days around
 * today, scrolled as `useListScroll` describes. Each list draws its own day
 * through `renderDay`. Only draw it once the viewer's day is known.
 */
export function ScrollingDayList({
	listClassName,
	renderDay,
}: ScrollingDayListProps): ReactElement {
	const today = useTodayOrThrow();
	const days = getListDayRange(today);
	const { regionRef, dayRef } = useListScroll(days);

	return (
		<Box ref={regionRef} flex={1} mih={0} className={styles.scrollRegion}>
			<ul className={listClassName}>
				{days.map((date) => (
					<li key={date.toISODate()}>
						{renderDay({ ref: dayRef(date), date, today })}
					</li>
				))}
			</ul>
		</Box>
	);
}
