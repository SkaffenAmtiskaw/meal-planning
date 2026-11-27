import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay } from '#fixtures/viewerDay';
import { type ScrollItems, useScrollItems, useToday } from '@/_hooks';

import { useListScroll } from './useListScroll';

import { useCalendarContext } from '../../_components/Calendar';
import type {
	CalendarContextValue,
	CalendarJump,
} from '../../_components/Calendar/types';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../../_components/Calendar', () => ({
	useCalendarContext: vi.fn(),
}));

const today = DateTime.local(2024, 6, 15);
const days = [13, 14, 15, 16, 17].map((day) => DateTime.local(2024, 6, day));
const setSelectedDate = vi.fn();
const scrollTo = vi.fn<ScrollItems<string>['scrollTo']>();
const itemRef = vi.fn();

function setCalendar(
	selectedDate: DateTime,
	jump: CalendarJump | null = null,
): void {
	vi.mocked(useCalendarContext).mockReturnValue({
		selectedDate,
		jump,
		setSelectedDate,
	} as Partial<CalendarContextValue> as CalendarContextValue);
}

// Reports the day at the top of the list, as useScrollItems does once scrolling pauses.
function reportTopmost(key: string): void {
	act(() => {
		vi.mocked(useScrollItems).mock.lastCall?.[1]?.onTopmostChange?.(key);
	});
}

describe('useListScroll', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
		scrollTo.mockImplementation((key) =>
			days.some((day) => day.toISODate() === key),
		);
		vi.mocked(useScrollItems<string>).mockReturnValue({ itemRef, scrollTo });
	});

	describe('when the list opens', () => {
		it('scrolls the selected day to the top, with no animation', () => {
			setCalendar(DateTime.local(2024, 6, 16));

			renderHook(() => useListScroll(days));

			expect(scrollTo).toHaveBeenCalledExactlyOnceWith('2024-06-16', 'instant');
			expect(setSelectedDate).not.toHaveBeenCalled();
		});

		it('scrolls to today and selects it when the selected day is not in the list', () => {
			setCalendar(DateTime.local(2024, 9, 1));

			renderHook(() => useListScroll(days));

			expect(scrollTo).toHaveBeenLastCalledWith('2024-06-15', 'instant');
			expect(setSelectedDate).toHaveBeenCalledExactlyOnceWith(today);
		});

		it('does not replay a jump made before it opened', () => {
			setCalendar(DateTime.local(2024, 6, 16), {
				date: DateTime.local(2024, 6, 16),
				id: 3,
			});

			const { rerender } = renderHook(() => useListScroll(days));
			rerender();

			expect(scrollTo).not.toHaveBeenCalledWith('2024-06-16', 'smooth');
		});

		it('scrolls only once as the selected day changes', () => {
			setCalendar(DateTime.local(2024, 6, 16));
			const { rerender } = renderHook(() => useListScroll(days));

			setCalendar(DateTime.local(2024, 6, 17));
			rerender();

			expect(scrollTo).toHaveBeenCalledOnce();
		});
	});

	describe('on a jump', () => {
		it('smooth-scrolls the day to the top', () => {
			setCalendar(today);
			const { rerender } = renderHook(() => useListScroll(days));

			const date = DateTime.local(2024, 6, 17);
			setCalendar(date, { date, id: 1 });
			rerender();

			expect(scrollTo).toHaveBeenLastCalledWith('2024-06-17', 'smooth');
		});

		it('scrolls again on a second jump to the same day', () => {
			setCalendar(today);
			const { rerender } = renderHook(() => useListScroll(days));

			setCalendar(today, { date: today, id: 1 });
			rerender();
			setCalendar(today, { date: today, id: 2 });
			rerender();

			expect(
				scrollTo.mock.calls.filter(([, behavior]) => behavior === 'smooth'),
			).toHaveLength(2);
		});

		it('puts the selected day back to the opening day when the day is not in the list', () => {
			const opening = DateTime.local(2024, 6, 14);
			setCalendar(opening);
			const { rerender } = renderHook(() => useListScroll(days));

			const far = DateTime.local(2024, 9, 1);
			setCalendar(far, { date: far, id: 1 });
			rerender();

			expect(setSelectedDate).toHaveBeenLastCalledWith(opening);
		});

		it('puts the selected day back to the day at the top after scrolling', () => {
			setCalendar(today);
			const { rerender } = renderHook(() => useListScroll(days));
			reportTopmost('2024-06-17');

			const far = DateTime.local(2024, 9, 1);
			setCalendar(far, { date: far, id: 1 });
			rerender();

			expect(setSelectedDate).toHaveBeenLastCalledWith(days[4]);
		});
	});

	describe('as the list scrolls', () => {
		it('selects the day at the top', () => {
			setCalendar(today);
			renderHook(() => useListScroll(days));

			reportTopmost('2024-06-13');

			expect(setSelectedDate).toHaveBeenCalledExactlyOnceWith(days[0]);
		});

		it('ignores a day no longer in the list', () => {
			setCalendar(today);
			renderHook(() => useListScroll(days));

			reportTopmost('2024-01-01');

			expect(setSelectedDate).not.toHaveBeenCalled();
		});
	});

	it('gives each day the ref for its ISO date', () => {
		setCalendar(today);
		const { result } = renderHook(() => useListScroll(days));

		result.current.dayRef(days[2]);

		expect(itemRef).toHaveBeenCalledWith('2024-06-15');
	});
});
