'use client';

import { type ReactElement, useEffect, useMemo, useRef } from 'react';

import { Box } from '@mantine/core';

import { useToday } from '@/_hooks';

import styles from './ListView.module.css';

import { type CalendarMeal, useCalendarContext } from '../Calendar';
import type { MealCardProps } from '../Calendar/MealCard/types';
import { DayRow } from './_components/DayRow';
import { useScrolledDate } from './_hooks/useScrolledDate';
import { useScrollToDate } from './_hooks/useScrollToDate';
import { getListDayRange } from './_utils/getListDayRange';

interface ListViewProps {
	meals?: CalendarMeal[];
	renderDish?: MealCardProps['renderDish'];
}

export function ListView({
	meals = [],
	renderDish,
}: ListViewProps): ReactElement {
	const { rangeAnchor, selectedDate, setSelectedDate } = useCalendarContext();
	const today = useToday();
	const days = getListDayRange(rangeAnchor, today);

	const mealsByDate = useMemo(() => {
		const map = new Map<string, CalendarMeal[]>();
		for (const meal of meals) {
			const list = map.get(meal.date);
			if (list) {
				list.push(meal);
			} else {
				map.set(meal.date, [meal]);
			}
		}
		return map;
	}, [meals]);

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
							today={today}
							meals={mealsByDate.get(date.toISODate() ?? '') ?? []}
							renderDish={renderDish}
						/>
					</li>
				))}
			</ul>
		</Box>
	);
}
