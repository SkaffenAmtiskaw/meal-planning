'use client';

import {
	type ReactElement,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
} from 'react';

import { Box } from '@mantine/core';

import { DateTime } from 'luxon';

import type { ListViewDish, ListViewEvent } from './ListViewEvent.types';
import styles from './ListView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { DayRow } from './_components/DayRow';
import { useScrolledDate } from './_hooks/useScrolledDate';
import { useScrollToDate } from './_hooks/useScrollToDate';
import { getListDayRange } from './_utils/getListDayRange';

export interface ListViewProps {
	today?: DateTime;
	onAddMeal?: (date: DateTime) => void;
	events?: ListViewEvent[];
	renderDish?: (dish: ListViewDish) => ReactNode;
}

export function ListView({
	today,
	onAddMeal,
	events = [],
	renderDish,
}: ListViewProps): ReactElement {
	const { rangeAnchor, selectedDate, setSelectedDate } = useCalendarContext();
	const days = getListDayRange(rangeAnchor);
	const todayDate = today ?? DateTime.now().startOf('day');

	const eventsByDate = useMemo(() => {
		const map = new Map<string, ListViewEvent[]>();
		for (const event of events) {
			const list = map.get(event.date);
			if (list) {
				list.push(event);
			} else {
				map.set(event.date, [event]);
			}
		}
		return map;
	}, [events]);

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
						<DayRow
							date={date}
							today={todayDate}
							meals={eventsByDate.get(date.toISODate() ?? '') ?? []}
							onAddMeal={onAddMeal}
							renderDish={renderDish}
						/>
					</li>
				))}
			</ul>
		</Box>
	);
}
