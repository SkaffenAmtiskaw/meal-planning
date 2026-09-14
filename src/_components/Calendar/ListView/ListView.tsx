'use client';

import { type ReactElement, useEffect, useRef } from 'react';

import { Box } from '@mantine/core';

import { DateTime } from 'luxon';

import styles from './ListView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { DayRow } from './_components/DayRow';
import { getListDayRange } from './_utils/getListDayRange';

export interface ListViewProps {
	today?: DateTime;
	onAddMeal?: (date: DateTime) => void;
}

export function ListView({ today, onAddMeal }: ListViewProps): ReactElement {
	const { rangeAnchor, selectedDate, setSelectedDate } = useCalendarContext();
	const days = getListDayRange(rangeAnchor);
	const todayDate = today ?? DateTime.now().startOf('day');

	const scrollRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const selectedDateRef = useRef(selectedDate);
	const setSelectedDateRef = useRef(setSelectedDate);

	selectedDateRef.current = selectedDate;
	setSelectedDateRef.current = setSelectedDate;

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-observe rows when the day range changes
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) {
			return;
		}

		const rows = Array.from(
			container.querySelectorAll('[data-iso]'),
		) as HTMLElement[];
		if (rows.length === 0) {
			return;
		}

		const handleEntries = (entries: IntersectionObserverEntry[]) => {
			const visibleEntries = entries.filter((entry) => entry.isIntersecting);
			if (visibleEntries.length === 0) {
				if (debounceRef.current) {
					clearTimeout(debounceRef.current);
					debounceRef.current = null;
				}
				return;
			}

			const topEntry = visibleEntries.reduce((top, entry) =>
				entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top,
			);

			const topRow = topEntry.target as HTMLElement;
			const parsed = DateTime.fromISO(
				topRow.getAttribute('data-iso') as string,
			);

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				if (parsed.toISODate() !== selectedDateRef.current.toISODate()) {
					setSelectedDateRef.current(parsed);
				}
				debounceRef.current = null;
			}, 150);
		};

		const observer = new IntersectionObserver(handleEntries, {
			root: container,
			threshold: 0,
		});

		rows.forEach((row) => {
			observer.observe(row);
		});

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
				debounceRef.current = null;
			}
			observer.disconnect();
		};
	}, [rangeAnchor.toISODate()]);

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
						<DayRow date={date} today={todayDate} onAddMeal={onAddMeal} />
					</li>
				))}
			</ul>
		</Box>
	);
}
