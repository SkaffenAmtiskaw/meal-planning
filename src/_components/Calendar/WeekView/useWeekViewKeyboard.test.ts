import { act, renderHook } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeekViewKeyboard } from './useWeekViewKeyboard';
import type { WeekViewMeal } from './WeekView';

function createWeek(startDate: DateTime): DateTime[] {
	return Array.from({ length: 7 }, (_, i) => startDate.plus({ days: i }));
}

function createKeyboardEvent(key: string): React.KeyboardEvent<HTMLElement> {
	return {
		key,
		preventDefault: vi.fn(),
		currentTarget: document.createElement('div'),
	} as unknown as React.KeyboardEvent<HTMLElement>;
}

const selectedDate = DateTime.local(2025, 9, 1);

describe('useWeekViewKeyboard', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	describe('initial focus', () => {
		it('focuses today when today is in the week', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025 (Wednesday)

			const days = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			expect(result.current.getDayProps(3).tabIndex).toBe(0);
			for (let i = 0; i < 7; i++) {
				if (i !== 3) {
					expect(result.current.getDayProps(i).tabIndex).toBe(-1);
				}
			}
		});

		it('focuses selectedDate when today is not in the week', () => {
			vi.setSystemTime(new Date(2025, 7, 15)); // Aug 15, 2025

			const days = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			expect(result.current.getDayProps(1).tabIndex).toBe(0); // Sep 1
			for (let i = 0; i < 7; i++) {
				if (i !== 1) {
					expect(result.current.getDayProps(i).tabIndex).toBe(-1);
				}
			}
		});

		it('falls back to the first day when neither is in the week', () => {
			vi.setSystemTime(new Date(2025, 7, 15)); // Aug 15, 2025

			const days = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			const outOfWeekSelectedDate = DateTime.local(2025, 9, 15);
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate: outOfWeekSelectedDate,
				}),
			);

			expect(result.current.getDayProps(0).tabIndex).toBe(0); // Aug 31
			for (let i = 1; i < 7; i++) {
				expect(result.current.getDayProps(i).tabIndex).toBe(-1);
			}
		});

		it('throws when days array is empty', () => {
			expect(() => {
				renderHook(() =>
					useWeekViewKeyboard({
						days: [],
						mealsByDate: new Map(),
						selectedDate,
					}),
				);
			}).toThrow('days array cannot be empty');
		});
	});

	describe('day navigation', () => {
		it('moves focus right with ArrowRight', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			const day3 = { focus: vi.fn() } as unknown as HTMLElement;
			const day4 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getDayProps(3).ref(day3);
				result.current.getDayProps(4).ref(day4);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowRight'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getDayProps(4).tabIndex).toBe(0);
			expect(day4.focus).toHaveBeenCalled();
		});

		it('stops at the right boundary with ArrowRight', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			act(() => {
				result.current.getDayProps(6).onClick();
			});
			act(() => {
				result.current
					.getDayProps(6)
					.onKeyDown(createKeyboardEvent('ArrowRight'));
			});

			expect(result.current.getDayProps(6).tabIndex).toBe(0);
		});

		it('moves focus left with ArrowLeft', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			act(() => {
				result.current.getDayProps(4).onClick();
			});

			const day3 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getDayProps(3).ref(day3);
			});

			act(() => {
				result.current
					.getDayProps(4)
					.onKeyDown(createKeyboardEvent('ArrowLeft'));
			});

			expect(result.current.getDayProps(4).tabIndex).toBe(-1);
			expect(result.current.getDayProps(3).tabIndex).toBe(0);
			expect(day3.focus).toHaveBeenCalled();
		});

		it('stops at the left boundary with ArrowLeft', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			act(() => {
				result.current.getDayProps(0).onClick();
			});
			act(() => {
				result.current
					.getDayProps(0)
					.onKeyDown(createKeyboardEvent('ArrowLeft'));
			});

			expect(result.current.getDayProps(0).tabIndex).toBe(0);
		});
	});

	describe('entering meal mode', () => {
		it('enters meal mode on ArrowDown for a day with meals', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const eventEl = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 0, isoDate).ref(eventEl);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);
			expect(eventEl.focus).toHaveBeenCalled();
		});

		it('enters meal mode on Enter for a day with meals', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const eventEl = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 0, isoDate).ref(eventEl);
			});

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('Enter'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);
			expect(eventEl.focus).toHaveBeenCalled();
		});

		it('does nothing on ArrowDown for an empty day', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: new Map(),
					selectedDate,
				}),
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(0);
		});

		it('ignores unhandled keys when not in meal mode', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const onMealClick = vi.fn();
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
					onMealClick,
				}),
			);

			const day3 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getDayProps(3).ref(day3);
			});

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('Escape'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(0);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
			expect(day3.focus).not.toHaveBeenCalled();
			expect(onMealClick).not.toHaveBeenCalled();
		});
	});

	describe('meal mode navigation', () => {
		it('navigates meals with ArrowDown', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
					],
				],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const event0 = { focus: vi.fn() } as unknown as HTMLElement;
			const event1 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 0, isoDate).ref(event0);
				result.current.getMealProps(3, 1, isoDate).ref(event1);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 1, isoDate).tabIndex).toBe(0);
			expect(event1.focus).toHaveBeenCalled();
		});

		it('navigates meals with ArrowUp', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
						{ id: '3', date: isoDate, title: 'Event 3' },
					],
				],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const event1 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 1, isoDate).ref(event1);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getMealProps(3, 2, isoDate).tabIndex).toBe(0);

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('ArrowUp'));
			});

			expect(result.current.getMealProps(3, 2, isoDate).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 1, isoDate).tabIndex).toBe(0);
			expect(event1.focus).toHaveBeenCalled();
		});

		it('stops at the first meal with ArrowUp', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
					],
				],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('ArrowUp'));
			});

			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);
			expect(result.current.getMealProps(3, 1, isoDate).tabIndex).toBe(-1);
		});

		it('stops at the last meal with ArrowDown', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
					],
				],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getMealProps(3, 1, isoDate).tabIndex).toBe(0);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			expect(result.current.getMealProps(3, 1, isoDate).tabIndex).toBe(0);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
		});

		it('calls onMealClick on Enter in meal mode', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meal: WeekViewMeal = {
				id: '2',
				date: isoDate,
				title: 'Event 2',
			};
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }, meal]],
			]);
			const onMealClick = vi.fn();

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
					onMealClick,
				}),
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('Enter'));
			});

			expect(onMealClick).toHaveBeenCalledTimes(1);
			expect(onMealClick).toHaveBeenCalledWith(meal);
		});

		it('does not call onMealClick when meals disappear while in meal mode', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals1 = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
					],
				],
			]);
			const onMealClick = vi.fn();

			const { result, rerender } = renderHook(
				({ mealsByDate }) =>
					useWeekViewKeyboard({
						days,
						mealsByDate,
						selectedDate,
						onMealClick,
					}),
				{
					initialProps: { mealsByDate: meals1 },
				},
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			const meals2 = new Map<string, WeekViewMeal[]>();
			rerender({ mealsByDate: meals2 });

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('Enter'));
			});

			expect(onMealClick).not.toHaveBeenCalled();
		});

		it('only the focused meal is a tab stop in meal mode', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const activeIsoDate = days[3].toISODate() as string;
			const otherIsoDate = days[5].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[
					activeIsoDate,
					[
						{ id: '1', date: activeIsoDate, title: 'Active event 1' },
						{ id: '2', date: activeIsoDate, title: 'Active event 2' },
					],
				],
				[otherIsoDate, [{ id: '3', date: otherIsoDate, title: 'Other event' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, activeIsoDate).tabIndex).toBe(0);
			expect(result.current.getMealProps(3, 1, activeIsoDate).tabIndex).toBe(
				-1,
			);
			expect(result.current.getMealProps(5, 0, otherIsoDate).tabIndex).toBe(-1);
			expect(result.current.getDayProps(5).tabIndex).toBe(-1);
		});

		it('ignores unhandled keys while in meal mode', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const onMealClick = vi.fn();
			const meals = new Map<string, WeekViewMeal[]>([
				[
					isoDate,
					[
						{ id: '1', date: isoDate, title: 'Event 1' },
						{ id: '2', date: isoDate, title: 'Event 2' },
					],
				],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
					onMealClick,
				}),
			);

			const event0 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 0, isoDate).ref(event0);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);
			expect(event0.focus).toHaveBeenCalledOnce();

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('a'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);
			expect(event0.focus).toHaveBeenCalledOnce();
			expect(onMealClick).not.toHaveBeenCalled();
		});
	});

	describe('exiting meal mode', () => {
		it('exits meal mode on Escape and focuses the day', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const day3 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getDayProps(3).ref(day3);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);

			act(() => {
				result.current.getDayProps(3).onKeyDown(createKeyboardEvent('Escape'));
			});

			expect(result.current.getDayProps(3).tabIndex).toBe(0);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
			expect(day3.focus).toHaveBeenCalled();
		});

		it('exits meal mode when a different day is clicked', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31));
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result } = renderHook(() =>
				useWeekViewKeyboard({
					days,
					mealsByDate: meals,
					selectedDate,
				}),
			);

			const day5 = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getDayProps(5).ref(day5);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);

			act(() => {
				result.current.getDayProps(5).onClick();
			});

			expect(result.current.getDayProps(5).tabIndex).toBe(0);
			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
			expect(day5.focus).toHaveBeenCalled();
		});
	});

	describe('reset', () => {
		it('resets focus when days change', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days1 = createWeek(DateTime.local(2025, 10, 5)); // Oct 5 - Oct 11
			const { result, rerender } = renderHook(
				({ days, selectedDate: sd }) =>
					useWeekViewKeyboard({
						days,
						mealsByDate: new Map(),
						selectedDate: sd,
					}),
				{
					initialProps: {
						days: days1,
						selectedDate: DateTime.local(2025, 10, 7),
					},
				},
			);

			expect(result.current.getDayProps(2).tabIndex).toBe(0); // Oct 7 (selectedDate)

			act(() => {
				result.current
					.getDayProps(2)
					.onKeyDown(createKeyboardEvent('ArrowRight'));
			});
			expect(result.current.getDayProps(3).tabIndex).toBe(0);
			expect(result.current.getDayProps(2).tabIndex).toBe(-1);

			const days2 = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			rerender({ days: days2, selectedDate });

			expect(result.current.getDayProps(3).tabIndex).toBe(0); // Sep 3 (today)
			expect(result.current.getDayProps(2).tabIndex).toBe(-1);
		});

		it('clears meal refs when days change', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result, rerender } = renderHook(
				({ days: d }) =>
					useWeekViewKeyboard({
						days: d,
						mealsByDate: meals,
						selectedDate,
					}),
				{
					initialProps: { days },
				},
			);

			const oldEvent = { focus: vi.fn() } as unknown as HTMLElement;
			act(() => {
				result.current.getMealProps(3, 0, isoDate).ref(oldEvent);
			});

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(oldEvent.focus).toHaveBeenCalledOnce();

			const newDays = createWeek(DateTime.local(2025, 8, 31)); // same dates, new array
			rerender({ days: newDays });

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(oldEvent.focus).toHaveBeenCalledOnce();
		});

		it('exits meal mode when days change', () => {
			vi.setSystemTime(new Date(2025, 8, 3)); // Sep 3, 2025

			const days = createWeek(DateTime.local(2025, 8, 31)); // Aug 31 - Sep 6
			const isoDate = days[3].toISODate() as string;
			const meals = new Map<string, WeekViewMeal[]>([
				[isoDate, [{ id: '1', date: isoDate, title: 'Event 1' }]],
			]);

			const { result, rerender } = renderHook(
				({ days: d, selectedDate: sd }) =>
					useWeekViewKeyboard({
						days: d,
						mealsByDate: meals,
						selectedDate: sd,
					}),
				{
					initialProps: { days, selectedDate },
				},
			);

			act(() => {
				result.current
					.getDayProps(3)
					.onKeyDown(createKeyboardEvent('ArrowDown'));
			});
			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(0);

			const newDays = createWeek(DateTime.local(2025, 9, 7)); // Sep 7 - Sep 13
			rerender({ days: newDays, selectedDate: DateTime.local(2025, 9, 8) });

			expect(result.current.getDayProps(1).tabIndex).toBe(0); // Sep 8 (selectedDate)
			expect(result.current.getDayProps(3).tabIndex).toBe(-1);
			expect(result.current.getMealProps(3, 0, isoDate).tabIndex).toBe(-1);
		});
	});
});
