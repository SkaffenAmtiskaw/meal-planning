import { useCallback, useEffect, useRef, useState } from 'react';

import type { DateTime } from 'luxon';

export interface UseRovingGridFocusOptions {
	days: DateTime[];
	initialFocusIndex: number;
}

export interface RovingGridFocusDayProps {
	tabIndex: 0 | -1;
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
	ref: (el: HTMLElement | null) => void;
}

export interface UseRovingGridFocusResult {
	getDayProps: (dayIndex: number) => RovingGridFocusDayProps;
	setFocusedDayIndex: (index: number) => void;
	focusDay: (dayIndex: number) => void;
}

export function useRovingGridFocus(
	options: UseRovingGridFocusOptions,
): UseRovingGridFocusResult {
	const { days, initialFocusIndex } = options;

	const [focusedDayIndex, setFocusedDayIndex] = useState(initialFocusIndex);
	const dayRefs = useRef<(HTMLElement | null)[]>([]);
	const focusFlag = useRef(false);
	const daysRef = useRef(days);
	daysRef.current = days;

	useEffect(() => {
		setFocusedDayIndex(initialFocusIndex);
	}, [initialFocusIndex]);

	useEffect(() => {
		if (focusFlag.current) {
			focusFlag.current = false;
			dayRefs.current[focusedDayIndex]?.focus();
		}
	}, [focusedDayIndex]);

	const focusDay = useCallback((dayIndex: number) => {
		dayRefs.current[dayIndex]?.focus();
	}, []);

	const handleKeyDown = useCallback(
		(dayIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				const col = dayIndex % 7;
				if (col < 6 && dayIndex + 1 < daysRef.current.length) {
					focusFlag.current = true;
					setFocusedDayIndex(dayIndex + 1);
				}
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const col = dayIndex % 7;
				if (col > 0) {
					focusFlag.current = true;
					setFocusedDayIndex(dayIndex - 1);
				}
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (dayIndex + 7 < daysRef.current.length) {
					focusFlag.current = true;
					setFocusedDayIndex(dayIndex + 7);
				}
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (dayIndex - 7 >= 0) {
					focusFlag.current = true;
					setFocusedDayIndex(dayIndex - 7);
				}
			}
		},
		[],
	);

	const getDayProps = useCallback(
		(dayIndex: number): RovingGridFocusDayProps => ({
			tabIndex: (focusedDayIndex === dayIndex ? 0 : -1) as 0 | -1,
			onKeyDown: handleKeyDown(dayIndex),
			ref: (el: HTMLElement | null) => {
				dayRefs.current[dayIndex] = el;
			},
		}),
		[focusedDayIndex, handleKeyDown],
	);

	return { getDayProps, setFocusedDayIndex, focusDay };
}
