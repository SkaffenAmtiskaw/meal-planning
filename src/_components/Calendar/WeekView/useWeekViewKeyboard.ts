import { useCallback, useEffect, useRef, useState } from 'react';

import { DateTime } from 'luxon';

import type { WeekViewMeal } from './WeekView';

export interface UseWeekViewKeyboardOptions {
	days: DateTime[];
	mealsByDate: Map<string, WeekViewMeal[]>;
	onMealClick?: (meal: WeekViewMeal) => void;
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

export interface UseWeekViewKeyboardResult {
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

	const selectedIndex = days.findIndex((d) => d.hasSame(selectedDate, 'day'));
	return selectedIndex !== -1 ? selectedIndex : 0;
}

export function useWeekViewKeyboard(
	options: UseWeekViewKeyboardOptions,
): UseWeekViewKeyboardResult {
	const { days, mealsByDate, onMealClick, selectedDate } = options;

	const [focusedDayIndex, setFocusedDayIndex] = useState(() =>
		computeInitialFocusIndex(days, selectedDate),
	);
	const [mealMode, setMealMode] = useState<{
		dayIndex: number;
		mealIndex: number;
	} | null>(null);

	const dayRefs = useRef<(HTMLElement | null)[]>([]);
	const mealRefs = useRef<Record<string, (HTMLElement | null)[]>>({});
	const focusDayFlag = useRef(false);
	const focusMealFlag = useRef(false);
	const daysRef = useRef(days);
	daysRef.current = days;
	const mealModeRef = useRef(mealMode);
	mealModeRef.current = mealMode;

	// Reset on days or selectedDate change
	useEffect(() => {
		setFocusedDayIndex(computeInitialFocusIndex(days, selectedDate));
		setMealMode(null);
		mealRefs.current = {};
	}, [days, selectedDate]);

	// Programmatic focus for days
	useEffect(() => {
		if (focusDayFlag.current) {
			focusDayFlag.current = false;
			dayRefs.current[focusedDayIndex]?.focus();
		}
	}, [focusedDayIndex]);

	// Programmatic focus for meals
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
			focusDayFlag.current = true;
			setFocusedDayIndex(dayIndex);
			setMealMode(null);
		},
		[],
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
					setMealMode(null);
					dayRefs.current[mealModeRef.current.dayIndex]?.focus();
				}
				return;
			}

			if (e.key === 'ArrowRight') {
				e.preventDefault();
				if (dayIndex < daysRef.current.length - 1) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex + 1);
				}
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				if (dayIndex > 0) {
					focusDayFlag.current = true;
					setFocusedDayIndex(dayIndex - 1);
				}
			} else if (e.key === 'ArrowDown' || e.key === 'Enter') {
				e.preventDefault();
				// biome-ignore lint/style/noNonNullAssertion: We know this will always be defined.
				const isoDate = daysRef.current[dayIndex].toISODate()!;
				const dayMeals = mealsByDate.get(isoDate) ?? [];
				if (dayMeals.length > 0) {
					focusMealFlag.current = true;
					setMealMode({ dayIndex, mealIndex: 0 });
				}
			}
		},
		[mealsByDate, onMealClick],
	);

	const getDayProps = useCallback(
		(dayIndex: number): DayKeyboardProps => {
			const isActiveDay = focusedDayIndex === dayIndex;
			const isMealModeDay = mealMode?.dayIndex === dayIndex;
			const tabIndex = isMealModeDay ? -1 : isActiveDay ? 0 : -1;

			return {
				tabIndex: tabIndex as 0 | -1,
				onClick: handleDayClick(dayIndex),
				onKeyDown: handleDayKeyDown(dayIndex),
				ref: (el: HTMLElement | null) => {
					dayRefs.current[dayIndex] = el;
				},
			};
		},
		[focusedDayIndex, mealMode, handleDayClick, handleDayKeyDown],
	);

	const getMealProps = useCallback(
		(
			dayIndex: number,
			mealIndex: number,
			isoDate: string,
		): MealKeyboardProps => {
			const isMealModeDay = mealMode?.dayIndex === dayIndex;
			const tabIndex =
				isMealModeDay && mealMode?.mealIndex === mealIndex ? 0 : -1;

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
