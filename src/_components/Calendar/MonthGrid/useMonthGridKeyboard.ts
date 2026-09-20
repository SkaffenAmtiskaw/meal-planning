import { useCallback, useEffect, useRef, useState } from 'react';

import { DateTime } from 'luxon';

import type { MonthGridMeal } from './MonthGrid';

import { useRovingGridFocus } from '../_hooks/useRovingGridFocus';

export interface UseMonthGridKeyboardOptions {
	days: DateTime[];
	mealsByDate: Map<string, MonthGridMeal[]>;
	onMealClick?: (meal: MonthGridMeal) => void;
	selectedDate: DateTime;
}

export interface DayKeyboardProps {
	tabIndex: 0 | -1;
	onClick: () => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
	ref: (el: HTMLElement | null) => void;
}

export interface MealKeyboardProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface UseMonthGridKeyboardResult {
	getDayProps: (dayIndex: number) => DayKeyboardProps;
	getMealProps: (
		dayIndex: number,
		mealIndex: number,
		isoDate: string,
	) => MealKeyboardProps;
}

function computeInitialFocusIndex(
	days: DateTime[],
	selectedDate: DateTime,
): number {
	if (days.length === 0) {
		throw new Error('days array cannot be empty');
	}

	const today = DateTime.now();
	const todayIndex = days.findIndex((d) => d.hasSame(today, 'day'));
	if (todayIndex !== -1) return todayIndex;

	return days.findIndex((d) => d.hasSame(selectedDate, 'month'));
}

export function useMonthGridKeyboard(
	options: UseMonthGridKeyboardOptions,
): UseMonthGridKeyboardResult {
	const { days, mealsByDate, onMealClick, selectedDate } = options;

	const initialFocusIndex = computeInitialFocusIndex(days, selectedDate);
	const {
		getDayProps: getRovingDayProps,
		setFocusedDayIndex,
		focusDay,
	} = useRovingGridFocus({ days, initialFocusIndex });

	const [mealMode, setMealMode] = useState<{
		dayIndex: number;
		mealIndex: number;
	} | null>(null);

	const mealRefs = useRef<Record<string, (HTMLElement | null)[]>>({});
	const focusMealFlag = useRef(false);
	const daysRef = useRef(days);
	daysRef.current = days;
	const mealModeRef = useRef(mealMode);
	mealModeRef.current = mealMode;

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset meal mode when the grid days change
	useEffect(() => {
		setMealMode(null);
		mealRefs.current = {};
	}, [days]);

	// Programmatic focus for meals.
	useEffect(() => {
		if (focusMealFlag.current && mealMode) {
			focusMealFlag.current = false;
			// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
			const isoDate = daysRef.current[mealMode.dayIndex].toISODate()!;
			const refs = mealRefs.current[isoDate];
			refs?.[mealMode.mealIndex]?.focus();
		}
	}, [mealMode]);

	const handleDayClick = useCallback(
		(dayIndex: number) => () => {
			setFocusedDayIndex(dayIndex);
			setMealMode(null);
		},
		[setFocusedDayIndex],
	);

	const handleDayKeyDown = useCallback(
		(dayIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
			if (mealModeRef.current && mealModeRef.current.dayIndex === dayIndex) {
				// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
				const isoDate = daysRef.current[dayIndex].toISODate()!;
				const dayMeals = mealsByDate.get(isoDate) ?? [];

				if (e.key === 'ArrowDown') {
					e.preventDefault();
					const nextIndex = mealModeRef.current.mealIndex + 1;
					if (nextIndex < dayMeals.length) {
						focusMealFlag.current = true;
						setMealMode({ dayIndex, mealIndex: nextIndex });
					}
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					const prevIndex = mealModeRef.current.mealIndex - 1;
					if (prevIndex >= 0) {
						focusMealFlag.current = true;
						setMealMode({ dayIndex, mealIndex: prevIndex });
					}
				} else if (e.key === 'Enter') {
					e.preventDefault();
					if (mealModeRef.current.mealIndex < dayMeals.length) {
						onMealClick?.(dayMeals[mealModeRef.current.mealIndex]);
					}
				} else if (e.key === 'Escape') {
					e.preventDefault();
					const previousDayIndex = mealModeRef.current.dayIndex;
					setMealMode(null);
					focusDay(previousDayIndex);
				}
				return;
			}

			if (e.key === 'Enter') {
				e.preventDefault();
				// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
				const isoDate = daysRef.current[dayIndex].toISODate()!;
				const dayMeals = mealsByDate.get(isoDate) ?? [];
				if (dayMeals.length === 1) {
					onMealClick?.(dayMeals[0]);
				} else if (dayMeals.length > 1) {
					focusMealFlag.current = true;
					setMealMode({ dayIndex, mealIndex: 0 });
				}
				return;
			}

			getRovingDayProps(dayIndex).onKeyDown(e);
		},
		[mealsByDate, onMealClick, focusDay, getRovingDayProps],
	);

	const getDayProps = useCallback(
		(dayIndex: number): DayKeyboardProps => {
			const rovingProps = getRovingDayProps(dayIndex);
			const isEventModeDay = mealMode?.dayIndex === dayIndex;

			return {
				tabIndex: isEventModeDay ? -1 : rovingProps.tabIndex,
				onClick: handleDayClick(dayIndex),
				onKeyDown: handleDayKeyDown(dayIndex),
				ref: rovingProps.ref,
			};
		},
		[mealMode, getRovingDayProps, handleDayClick, handleDayKeyDown],
	);

	const getMealProps = useCallback(
		(
			dayIndex: number,
			mealIndex: number,
			isoDate: string,
		): MealKeyboardProps => {
			const isEventModeDay = mealMode?.dayIndex === dayIndex;
			const tabIndex =
				isEventModeDay && mealMode?.mealIndex === mealIndex ? 0 : -1;

			return {
				tabIndex: tabIndex as 0 | -1,
				ref: (el: HTMLElement | null) => {
					if (!mealRefs.current[isoDate]) {
						mealRefs.current[isoDate] = [];
					}
					mealRefs.current[isoDate][mealIndex] = el;
				},
			};
		},
		[mealMode],
	);

	return {
		getDayProps,
		getMealProps,
	};
}
