'use client';

import { type ReactElement, useEffect, useRef } from 'react';

import { Box } from '@mantine/core';

import { useToday, useTodayOrThrow } from '@/_hooks';

import styles from './ListView.module.css';

import { useCalendarContext } from '../Calendar';
import { DayRow } from './_components/DayRow';
import { useScrolledDate } from './_hooks/useScrolledDate';
import { useScrollToDate } from './_hooks/useScrollToDate';
import { getListDayRange } from './_utils/getListDayRange';

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
	const { rangeAnchor, selectedDate, setSelectedDate } = useCalendarContext();
	const today = useTodayOrThrow();
	const days = getListDayRange(rangeAnchor, today);

	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollToDate = useScrollToDate(scrollRef);
	const rangeAnchorKey = rangeAnchor.toISODate() ?? '';

	useScrolledDate(scrollRef, rangeAnchorKey, selectedDate, setSelectedDate);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to selectedDate once on mount after layout
	useEffect(() => {
		let frame1: number;
		let frame2: number;

		frame1 = requestAnimationFrame(() => {
			frame2 = requestAnimationFrame(() => {
				scrollToDate(selectedDate, 'auto');
			});
		});

		return () => {
			cancelAnimationFrame(frame1);
			cancelAnimationFrame(frame2);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll only when the day range changes
	useEffect(() => {
		scrollToDate(selectedDate, 'smooth');
	}, [rangeAnchorKey]);

	return (
		<Box
			ref={scrollRef}
			className={styles.scrollRegion}
			flex={1}
			mih={0}
			data-testid="scroll-region"
		>
			<ul className={styles.innerColumn}>
				{days.map((date) => (
					<li key={date.toISODate() ?? ''}>
						<DayRow date={date} today={today} plannerId={plannerId} />
					</li>
				))}
			</ul>
		</Box>
	);
}
