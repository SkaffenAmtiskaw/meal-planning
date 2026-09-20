import { act, renderHook } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMonthGridKeyboard } from './useMonthGridKeyboard';
import type { MonthGridMeal } from './MonthGrid';

function createDays(startDate: DateTime, count: number = 42): DateTime[] {
	return Array.from({ length: count }, (_, i) => startDate.plus({ days: i }));
}

function createKeyboardEvent(key: string): React.KeyboardEvent<HTMLElement> {
	return {
		key,
		preventDefault: vi.fn(),
		currentTarget: document.createElement('div'),
	} as unknown as React.KeyboardEvent<HTMLElement>;
}

describe('useMonthGridKeyboard', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	const selectedDate = DateTime.local(2025, 9, 1);
	const selectedDateOct = DateTime.local(2025, 10, 1);

	it('throws when days array is empty', () => {
		expect(() => {
			renderHook(() =>
				useMonthGridKeyboard({
					days: [],
					mealsByDate: new Map(),
					selectedDate,
				}),
			);
		}).toThrow('days array cannot be empty');
	});

	it('initially focuses today when today is in the grid', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, 2025

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Sep 15 is index 14 (Sep 1 is index 0)
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		expect(result.current.getDayProps(13).tabIndex).toBe(-1);
		expect(result.current.getDayProps(15).tabIndex).toBe(-1);
	});

	it('calls day ref callback', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		const el = document.createElement('div');
		result.current.getDayProps(14).ref(el);

		// Trigger focus effect by clicking the day
		act(() => {
			result.current.getDayProps(14).onClick();
		});

		// Should not throw and focused day should remain 14
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
	});

	it('initially focuses first day of month when today is not in the grid', () => {
		vi.setSystemTime(new Date(2025, 7, 15)); // Aug 15, 2025

		// October 2025 grid: Sep 29 - Nov 9 (starts Monday before Oct 1)
		const days = createDays(DateTime.local(2025, 9, 29));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate: selectedDateOct,
			}),
		);

		// Oct 1 is index 2
		expect(result.current.getDayProps(2).tabIndex).toBe(0);
		expect(result.current.getDayProps(0).tabIndex).toBe(-1);
		expect(result.current.getDayProps(1).tabIndex).toBe(-1);
	});

	it('resets focus to today when days change', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, 2025

		const days1 = createDays(DateTime.local(2025, 10, 1));
		const { result, rerender } = renderHook(
			({ days, selectedDate }) =>
				useMonthGridKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			{
				initialProps: {
					days: days1,
					selectedDate: selectedDateOct,
				},
			},
		);

		// Initially focused on first Nov day (Nov 1 is index 0 in this grid)
		expect(result.current.getDayProps(0).tabIndex).toBe(0);

		// Move focus to a different day
		act(() => {
			result.current
				.getDayProps(5)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		expect(result.current.getDayProps(5).tabIndex).toBe(-1);
		expect(result.current.getDayProps(6).tabIndex).toBe(0);

		// Change to September grid
		const days2 = createDays(DateTime.local(2025, 9, 1));
		rerender({ days: days2, selectedDate });

		// Focus should reset to Sep 15 (index 14)
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		expect(result.current.getDayProps(6).tabIndex).toBe(-1);
	});

	it('exits meal mode when days change', () => {
		vi.setSystemTime(new Date(2025, 9, 15)); // Oct 15, 2025

		const days1 = createDays(DateTime.local(2025, 9, 1));
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const { result, rerender } = renderHook(
			({ days, selectedDate }) =>
				useMonthGridKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			{
				initialProps: { days: days1, selectedDate },
			},
		);

		// Enter meal mode on Sep 15 (index 14)
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Change days to October grid
		const days2 = createDays(DateTime.local(2025, 10, 1));
		rerender({ days: days2, selectedDate: selectedDateOct });

		// Event mode should be exited; Oct 15 is index 14 and should be focused
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		expect(result.current.getMealProps(14, 0, '2025-10-16').tabIndex).toBe(-1);
	});

	it('clears meal refs when days change', () => {
		vi.setSystemTime(new Date(2025, 9, 15)); // Oct 15, 2025

		const days1 = createDays(DateTime.local(2025, 9, 1));
		const meals1 = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const { result, rerender } = renderHook(
			({ days, mealsByDate, selectedDate }) =>
				useMonthGridKeyboard({
					days,
					mealsByDate,
					selectedDate,
				}),
			{
				initialProps: {
					days: days1,
					mealsByDate: meals1,
					selectedDate,
				},
			},
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Call ref callbacks to register elements
		const ref1 = result.current.getMealProps(14, 0, '2025-09-15').ref;
		const ref2 = result.current.getMealProps(14, 1, '2025-09-15').ref;
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		ref1(el1);
		ref2(el2);

		// Change days and meals
		const days2 = createDays(DateTime.local(2025, 10, 1));
		const meals2 = new Map<string, MonthGridMeal[]>([
			[
				'2025-10-16',
				[
					{ id: '3', date: '2025-10-16', title: 'Event 3' },
					{ id: '4', date: '2025-10-16', title: 'Event 4' },
				],
			],
		]);
		rerender({
			days: days2,
			mealsByDate: meals2,
			selectedDate: selectedDateOct,
		});

		// Should be able to cleanly enter meal mode on new day (Oct 16 = index 15)
		act(() => {
			result.current.getDayProps(15).onKeyDown(createKeyboardEvent('Enter'));
		});

		expect(result.current.getDayProps(15).tabIndex).toBe(-1);
		expect(result.current.getMealProps(15, 0, '2025-10-16').tabIndex).toBe(0);
	});

	it('returns tabIndex=0 for focused day and -1 for others', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Focused day (index 14)
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		// Other days
		expect(result.current.getDayProps(0).tabIndex).toBe(-1);
		expect(result.current.getDayProps(13).tabIndex).toBe(-1);
		expect(result.current.getDayProps(15).tabIndex).toBe(-1);
		expect(result.current.getDayProps(41).tabIndex).toBe(-1);
	});

	it('moves focus right with ArrowRight', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getDayProps(15).tabIndex).toBe(0);
	});

	it('stops at right boundary with ArrowRight', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Move to index 20 (Saturday of week 3)
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		act(() => {
			result.current
				.getDayProps(15)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		act(() => {
			result.current
				.getDayProps(16)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		act(() => {
			result.current
				.getDayProps(17)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		act(() => {
			result.current
				.getDayProps(18)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		act(() => {
			result.current
				.getDayProps(19)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});

		// Index 20 is col 6 (Saturday), should stay there
		expect(result.current.getDayProps(20).tabIndex).toBe(0);

		act(() => {
			result.current
				.getDayProps(20)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});

		expect(result.current.getDayProps(20).tabIndex).toBe(0);
		expect(result.current.getDayProps(21).tabIndex).toBe(-1);
	});

	it('moves focus left with ArrowLeft', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Move to index 15 first (Sep 16, Tuesday)
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});
		expect(result.current.getDayProps(15).tabIndex).toBe(0);

		act(() => {
			result.current
				.getDayProps(15)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});

		expect(result.current.getDayProps(15).tabIndex).toBe(-1);
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
	});

	it('stops at left boundary with ArrowLeft', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Move to index 7 (Monday of week 2)
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current
				.getDayProps(13)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current
				.getDayProps(12)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current
				.getDayProps(11)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current
				.getDayProps(10)
				.onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current.getDayProps(9).onKeyDown(createKeyboardEvent('ArrowLeft'));
		});
		act(() => {
			result.current.getDayProps(8).onKeyDown(createKeyboardEvent('ArrowLeft'));
		});

		// Index 7 is col 0 (Monday), should stay there
		expect(result.current.getDayProps(7).tabIndex).toBe(0);

		act(() => {
			result.current.getDayProps(7).onKeyDown(createKeyboardEvent('ArrowLeft'));
		});

		expect(result.current.getDayProps(7).tabIndex).toBe(0);
		expect(result.current.getDayProps(6).tabIndex).toBe(-1);
	});

	it('moves focus down a week with ArrowDown', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getDayProps(21).tabIndex).toBe(0);
	});

	it('stops at bottom boundary with ArrowDown', () => {
		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Focus on index 35 (start of last full week)
		act(() => {
			result.current.getDayProps(35).onClick();
		});

		// Move to index 42 which is beyond the array
		act(() => {
			result.current
				.getDayProps(35)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});

		// Should stay at 35 since 35 + 7 = 42 >= 42
		expect(result.current.getDayProps(35).tabIndex).toBe(0);
	});

	it('moves focus up a week with ArrowUp', () => {
		vi.setSystemTime(new Date(2025, 8, 22)); // Sep 22, index 21

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		act(() => {
			result.current.getDayProps(21).onKeyDown(createKeyboardEvent('ArrowUp'));
		});

		expect(result.current.getDayProps(21).tabIndex).toBe(-1);
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
	});

	it('stops at top boundary with ArrowUp', () => {
		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Focus on index 6
		act(() => {
			result.current.getDayProps(6).onClick();
		});

		act(() => {
			result.current.getDayProps(6).onKeyDown(createKeyboardEvent('ArrowUp'));
		});

		// Should stay at 6 since 6 - 7 = -1 < 0
		expect(result.current.getDayProps(6).tabIndex).toBe(0);
	});

	it('calls onMealClick on Enter for single-meal day', () => {
		const onMealClick = vi.fn();
		const meal: MonthGridMeal = {
			id: '1',
			date: '2025-09-15',
			title: 'Event 1',
		};
		const meals = new Map<string, MonthGridMeal[]>([['2025-09-15', [meal]]]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				onMealClick,
				selectedDate,
			}),
		);

		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(meal);
	});

	it('does nothing on Enter for empty day', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Should remain focused without entering meal mode
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
	});

	it('enters meal mode on Enter for multi-meal day', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(-1);
	});

	it('does nothing on unhandled key in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Press an unhandled key (e.g., ArrowRight)
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});

		// Should stay in meal mode on first meal
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
	});

	it('does nothing on unhandled key in day mode', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		// Press an unhandled key (e.g., Home)
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Home'));
		});

		// Should remain focused on day 14
		expect(result.current.getDayProps(14).tabIndex).toBe(0);
	});

	it('sets day tabIndex to -1 and first meal to 0 in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Day should have tabIndex -1
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		// First meal should have tabIndex 0
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);
		// Other meals should have tabIndex -1
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(-1);
		// Other days should still have tabIndex -1
		expect(result.current.getDayProps(13).tabIndex).toBe(-1);
		expect(result.current.getDayProps(15).tabIndex).toBe(-1);
	});

	it('navigates meals with ArrowDown in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
					{ id: '3', date: '2025-09-15', title: 'Event 3' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// ArrowDown to next meal
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(0);
	});

	it('navigates meals with ArrowUp in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
					{ id: '3', date: '2025-09-15', title: 'Event 3' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Move down twice
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});
		expect(result.current.getMealProps(14, 2, '2025-09-15').tabIndex).toBe(0);

		// ArrowUp to previous meal
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('ArrowUp'));
		});
		expect(result.current.getMealProps(14, 2, '2025-09-15').tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(0);
	});

	it('stops at first meal boundary with ArrowUp in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Try to move up from first meal
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('ArrowUp'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);
	});

	it('stops at last meal boundary with ArrowDown in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Move to last meal
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(0);

		// Try to move down from last meal
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(0);
	});

	it('calls onMealClick on Enter in meal mode', () => {
		const onMealClick = vi.fn();
		const meal2: MonthGridMeal = {
			id: '2',
			date: '2025-09-15',
			title: 'Event 2',
		};
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[{ id: '1', date: '2025-09-15', title: 'Event 1' }, meal2],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				onMealClick,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		// Move to second meal
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});

		// Press Enter
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(meal2);
	});

	it('does not call onMealClick when meals disappear while in meal mode', () => {
		const onMealClick = vi.fn();
		const meals1 = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result, rerender } = renderHook(
			({ mealsByDate }) =>
				useMonthGridKeyboard({
					days,
					mealsByDate,
					onMealClick,
					selectedDate,
				}),
			{ initialProps: { mealsByDate: meals1 } },
		);

		// Enter meal mode and move to second meal
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});

		// Events disappear
		const meals2 = new Map<string, MonthGridMeal[]>();
		rerender({ mealsByDate: meals2 });

		// Press Enter - should not call onMealClick due to stale guard
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});

		expect(onMealClick).not.toHaveBeenCalled();
	});

	it('exits meal mode on Escape', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Press Escape
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Escape'));
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(-1);
	});

	it('sets focused day on click', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: new Map(),
				selectedDate,
			}),
		);

		expect(result.current.getDayProps(14).tabIndex).toBe(0);

		act(() => {
			result.current.getDayProps(20).onClick();
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
		expect(result.current.getDayProps(20).tabIndex).toBe(0);
	});

	it('exits meal mode on click', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);

		// Click on a different day
		act(() => {
			result.current.getDayProps(20).onClick();
		});

		expect(result.current.getDayProps(20).tabIndex).toBe(0);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(-1);
	});

	it('meal mode persists through accessing meal props', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Accessing meal props should not clear meal mode
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(-1);
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
	});

	it('meal mode persists through day keydown in meal mode', () => {
		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);

		// Pressing an unhandled key should not clear meal mode
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowRight'));
		});

		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(0);
		expect(result.current.getDayProps(14).tabIndex).toBe(-1);
	});

	it('exits meal mode on Escape after navigating meals', () => {
		vi.setSystemTime(new Date(2025, 8, 15)); // Sep 15, index 14

		const meals = new Map<string, MonthGridMeal[]>([
			[
				'2025-09-15',
				[
					{ id: '1', date: '2025-09-15', title: 'Event 1' },
					{ id: '2', date: '2025-09-15', title: 'Event 2' },
				],
			],
		]);

		const days = createDays(DateTime.local(2025, 9, 1));
		const { result } = renderHook(() =>
			useMonthGridKeyboard({
				days,
				mealsByDate: meals,
				selectedDate,
			}),
		);

		// Enter meal mode and navigate to second meal
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Enter'));
		});
		act(() => {
			result.current
				.getDayProps(14)
				.onKeyDown(createKeyboardEvent('ArrowDown'));
		});

		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(0);

		// Press Escape
		act(() => {
			result.current.getDayProps(14).onKeyDown(createKeyboardEvent('Escape'));
		});

		expect(result.current.getDayProps(14).tabIndex).toBe(0);
		expect(result.current.getMealProps(14, 0, '2025-09-15').tabIndex).toBe(-1);
		expect(result.current.getMealProps(14, 1, '2025-09-15').tabIndex).toBe(-1);
	});
});
