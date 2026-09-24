import { useEffect, useRef } from 'react';

import { DateTime } from 'luxon';

import { LIST_VIEW_TOP_PADDING } from './constants';

const DEBOUNCE_MS = 150;

export function useScrolledDate(
	containerRef: React.RefObject<HTMLElement | null>,
	rangeAnchorKey: string,
	selectedDate: DateTime,
	onScrolledDate: (date: DateTime) => void,
): void {
	const onScrolledDateRef = useRef(onScrolledDate);
	onScrolledDateRef.current = onScrolledDate;

	const selectedDateRef = useRef(selectedDate);
	selectedDateRef.current = selectedDate;

	const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-attach listener when the day range changes
	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const rows = Array.from(
			container.querySelectorAll('[data-iso]'),
		) as HTMLElement[];
		if (rows.length === 0) {
			return;
		}

		const detectScrolledDate = () => {
			const containerRect = container.getBoundingClientRect();
			const scrollTop = container.scrollTop;
			const threshold = scrollTop + LIST_VIEW_TOP_PADDING;

			let selectedRow: HTMLElement | null = null;
			for (let i = rows.length - 1; i >= 0; i--) {
				const row = rows[i];
				const rowRect = row.getBoundingClientRect();
				const rowOffsetTop = rowRect.top - containerRect.top + scrollTop;
				if (rowOffsetTop <= threshold) {
					selectedRow = row;
					break;
				}
			}

			if (!selectedRow) {
				selectedRow = rows[0];
			}

			const iso = selectedRow.getAttribute('data-iso');
			if (!iso) {
				return;
			}

			const parsed = DateTime.fromISO(iso);
			if (!parsed.isValid) {
				return;
			}

			if (parsed.toISODate() === selectedDateRef.current.toISODate()) {
				if (debounceRef.current) {
					clearTimeout(debounceRef.current);
					debounceRef.current = null;
				}
				return;
			}

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				onScrolledDateRef.current(parsed);
				debounceRef.current = null;
			}, DEBOUNCE_MS);
		};

		const handleScroll = () => {
			if (rafRef.current !== null) {
				return;
			}

			rafRef.current = requestAnimationFrame(() => {
				rafRef.current = null;
				detectScrolledDate();
			});
		};

		container.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			container.removeEventListener('scroll', handleScroll);

			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
				debounceRef.current = null;
			}
		};
	}, [containerRef, rangeAnchorKey]);
}
