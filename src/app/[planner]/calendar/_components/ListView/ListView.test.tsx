import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { ListView } from './ListView';

import { useCalendarContext } from '../Calendar';
import type { CalendarContextValue } from '../Calendar/types';
import { DayRow } from './_components/DayRow';
import { useScrolledDate } from './_hooks/useScrolledDate';
import { useScrollToDate } from './_hooks/useScrollToDate';
import { getListDayRange } from './_utils/getListDayRange';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('./_utils/getListDayRange', () => ({
	getListDayRange: vi.fn(),
}));

vi.mock('./_components/DayRow', () => ({
	DayRow: vi.fn(({ date }: { date: DateTime }) => (
		<div data-testid="day-row" data-iso={date.toISODate()} />
	)),
}));

vi.mock('../Calendar', async () => ({
	...(await vi.importActual('../Calendar')),
	useCalendarContext: vi.fn(),
}));

vi.mock('./_hooks/useScrollToDate', async () => ({
	useScrollToDate: vi.fn(),
}));

vi.mock('./_hooks/useScrolledDate', async () => ({
	useScrolledDate: vi.fn(),
}));

const mockScrollToDate = vi.fn();

function createMockContextValue(
	overrides: Partial<CalendarContextValue> = {},
): CalendarContextValue {
	return {
		selectedDate: DateTime.local(2024, 6, 15),
		viewType: 'list',
		rangeAnchor: DateTime.local(2024, 6, 15),
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
		...overrides,
	};
}

describe('ListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useScrollToDate).mockReturnValue(mockScrollToDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders a DayRow for every day in the range', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		render(<ListView plannerId="planner-1" />);

		expect(screen.getAllByTestId('day-row')).toHaveLength(3);
	});

	it('passes today to each DayRow', () => {
		const today = DateTime.local(2024, 6, 15);
		const dates = [
			DateTime.local(2024, 6, 13),
			DateTime.local(2024, 6, 14),
			DateTime.local(2024, 6, 15),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 13) }),
		);

		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		render(<ListView plannerId="planner-1" />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].today).toBe(today);
		}
	});

	it('builds the day range from rangeAnchor and today', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 10);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
		vi.mocked(getListDayRange).mockReturnValue([rangeAnchor]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor }),
		);

		render(<ListView plannerId="planner-1" />);

		expect(getListDayRange).toHaveBeenCalledWith(rangeAnchor, today);
	});

	it('renders nothing while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.local(2024, 6, 15)),
		);
		vi.mocked(useCalendarContext).mockReturnValue(createMockContextValue());

		const { container } = render(<ListView plannerId="planner-1" />);

		expect(container.innerHTML).toBe('');
	});

	describe('scroll behavior', () => {
		it('scrolls to selectedDate on mount with auto behavior', () => {
			vi.useFakeTimers();

			const selectedDate = DateTime.local(2024, 6, 13);
			const dates = [
				DateTime.local(2024, 6, 13),
				DateTime.local(2024, 6, 14),
				DateTime.local(2024, 6, 15),
			];
			vi.mocked(getListDayRange).mockReturnValue(dates);
			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({
					selectedDate,
					rangeAnchor: DateTime.local(2024, 6, 14),
				}),
			);

			render(<ListView plannerId="planner-1" />);

			act(() => {
				vi.advanceTimersByTime(32);
			});
			act(() => {
				vi.advanceTimersByTime(32);
			});

			expect(mockScrollToDate).toHaveBeenCalledWith(selectedDate, 'auto');
		});

		it('scrolls to selectedDate with smooth behavior when rangeAnchor changes', () => {
			const initialSelectedDate = DateTime.local(2024, 6, 13);
			const newSelectedDate = DateTime.local(2024, 6, 20);
			const dates = [
				DateTime.local(2024, 6, 13),
				DateTime.local(2024, 6, 14),
				DateTime.local(2024, 6, 15),
			];
			vi.mocked(getListDayRange).mockReturnValue(dates);
			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({
					selectedDate: initialSelectedDate,
					rangeAnchor: DateTime.local(2024, 6, 14),
				}),
			);

			const { rerender } = render(<ListView plannerId="planner-1" />);
			mockScrollToDate.mockClear();

			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({
					selectedDate: newSelectedDate,
					rangeAnchor: DateTime.local(2024, 6, 20),
				}),
			);

			act(() => {
				rerender(<ListView plannerId="planner-1" />);
			});

			expect(mockScrollToDate).toHaveBeenCalledWith(newSelectedDate, 'smooth');
		});

		it('passes the container ref, rangeAnchorKey, selectedDate, and setSelectedDate to useScrolledDate', () => {
			const rangeAnchor = DateTime.local(2024, 6, 14);
			const selectedDate = DateTime.local(2024, 6, 15);
			const setSelectedDate = vi.fn();
			const dates = [
				DateTime.local(2024, 6, 13),
				DateTime.local(2024, 6, 14),
				DateTime.local(2024, 6, 15),
			];
			vi.mocked(getListDayRange).mockReturnValue(dates);
			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({ rangeAnchor, selectedDate, setSelectedDate }),
			);

			render(<ListView plannerId="planner-1" />);

			expect(useScrolledDate).toHaveBeenCalledWith(
				expect.objectContaining({
					current: screen.getByTestId('scroll-region'),
				}),
				rangeAnchor.toISODate() ?? '',
				selectedDate,
				setSelectedDate,
			);
		});
	});

	it('renders without crashing when a day has no ISO date', () => {
		const invalidDate = DateTime.invalid('invalid');
		vi.mocked(getListDayRange).mockReturnValue([invalidDate]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		expect(() => render(<ListView plannerId="planner-1" />)).not.toThrow();
		expect(screen.getAllByTestId('day-row')).toHaveLength(1);
	});

	it('falls back to an empty rangeAnchorKey when rangeAnchor has no ISO date', () => {
		const invalidRangeAnchor = DateTime.invalid('invalid');
		const setSelectedDate = vi.fn();
		vi.mocked(getListDayRange).mockReturnValue([]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({
				rangeAnchor: invalidRangeAnchor,
				setSelectedDate,
			}),
		);

		render(<ListView plannerId="planner-1" />);

		expect(useScrolledDate).toHaveBeenCalledWith(
			expect.objectContaining({
				current: screen.getByTestId('scroll-region'),
			}),
			'',
			DateTime.local(2024, 6, 15),
			setSelectedDate,
		);
	});
});
