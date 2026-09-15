import type { ReactNode } from 'react';

import { act, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListView } from './ListView';
import type { ListViewEvent } from './ListViewEvent.types';

import {
	type CalendarContextValue,
	useCalendarContext,
} from '../CalendarContext';
import { DayRow } from './_components/DayRow';
import type { ListViewDish } from './_components/DishListItem';
import { useScrolledDate } from './_hooks/useScrolledDate';
import { useScrollToDate } from './_hooks/useScrollToDate';
import { getListDayRange } from './_utils/getListDayRange';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./_utils/getListDayRange', () => ({
	getListDayRange: vi.fn(),
}));

vi.mock('./_components/DayRow', () => ({
	DayRow: vi.fn(
		({
			date,
			onAddMeal,
			meals,
			renderDish,
		}: {
			date: DateTime;
			onAddMeal?: (date: DateTime) => void;
			meals?: ListViewEvent[];
			renderDish?: (dish: ListViewDish) => ReactNode;
		}) => (
			<div
				data-testid="day-row"
				data-iso={date.toISODate()}
				data-meals-count={meals?.length ?? 0}
				data-meal-ids={meals?.map((meal) => meal.id).join(',')}
			>
				<button
					type="button"
					data-testid="gutter-trigger"
					onClick={() => onAddMeal?.(date)}
				>
					gutter
				</button>
				<button
					type="button"
					data-testid="ghost-trigger"
					onClick={() => onAddMeal?.(date)}
				>
					ghost
				</button>
				{meals?.map((meal) => (
					<div key={meal.id} data-testid="meal">
						{meal.dishes.map((dish) => (
							<span key={dish.name} data-testid="dish-name">
								{renderDish?.(dish)}
							</span>
						))}
					</div>
				))}
			</div>
		),
	),
}));

vi.mock('./ListView.module.css', () => ({
	default: {
		scrollRegion: 'scrollRegion',
		innerColumn: 'innerColumn',
	},
}));

vi.mock('../CalendarContext', () => ({
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

		render(<ListView />);

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

		render(<ListView today={today} />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].today).toEqual(today);
		}
	});

	it('defaults today to the start of the current day when omitted', () => {
		const now = DateTime.local(2024, 6, 20, 14, 30);
		vi.useFakeTimers();
		vi.setSystemTime(now.toJSDate());

		const today = DateTime.local(2024, 6, 20).startOf('day');
		const dates = [DateTime.local(2024, 6, 20)];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 20) }),
		);

		render(<ListView />);

		expect(DayRow).toHaveBeenCalledTimes(1);
		expect(vi.mocked(DayRow).mock.calls[0][0].today).toEqual(today);
	});

	it('uses rangeAnchor from CalendarContext to build the day range', () => {
		const rangeAnchor = DateTime.local(2024, 6, 10);
		vi.mocked(getListDayRange).mockReturnValue([rangeAnchor]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor }),
		);

		render(<ListView />);

		expect(getListDayRange).toHaveBeenCalledWith(rangeAnchor);
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

			render(<ListView />);

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

			const { rerender } = render(<ListView />);
			mockScrollToDate.mockClear();

			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({
					selectedDate: newSelectedDate,
					rangeAnchor: DateTime.local(2024, 6, 20),
				}),
			);

			act(() => {
				rerender(<ListView />);
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

			render(<ListView />);

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

		expect(() => render(<ListView />)).not.toThrow();
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

		render(<ListView />);

		expect(useScrolledDate).toHaveBeenCalledWith(
			expect.objectContaining({
				current: screen.getByTestId('scroll-region'),
			}),
			'',
			DateTime.local(2024, 6, 15),
			setSelectedDate,
		);
	});

	it('passes onAddMeal to each DayRow', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		const mockOnAddMeal = vi.fn();

		render(<ListView onAddMeal={mockOnAddMeal} />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].onAddMeal).toBe(mockOnAddMeal);
		}
	});

	it('calls onAddMeal with the correct date when a day row trigger is clicked', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		const mockOnAddMeal = vi.fn();

		render(<ListView onAddMeal={mockOnAddMeal} />);

		const gutterTrigger = screen.getAllByTestId('gutter-trigger')[1];
		const ghostTrigger = screen.getAllByTestId('ghost-trigger')[2];

		gutterTrigger.click();
		ghostTrigger.click();

		expect(mockOnAddMeal).toHaveBeenCalledTimes(2);
		expect(mockOnAddMeal).toHaveBeenNthCalledWith(1, dates[1]);
		expect(mockOnAddMeal).toHaveBeenNthCalledWith(2, dates[2]);
	});

	it('passes renderDish to each DayRow', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		const mockRenderDish = vi.fn((dish: ListViewDish) => dish.name);

		render(<ListView renderDish={mockRenderDish} />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].renderDish).toBe(mockRenderDish);
		}
	});

	it('calls renderDish when a dish name is rendered through the day row', () => {
		const dates = [DateTime.local(2024, 6, 10)];
		const dishes: ListViewDish[] = [
			{ name: 'Pasta Primavera' },
			{ name: 'Caesar Salad' },
		];
		const events: ListViewEvent[] = [
			{
				id: 'lunch',
				date: '2024-06-10',
				name: 'Lunch',
				borderColor: 'green',
				dishes,
			},
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: dates[0] }),
		);

		const mockRenderDish = vi.fn((dish: ListViewDish) => dish.name);

		render(<ListView events={events} renderDish={mockRenderDish} />);

		expect(mockRenderDish).toHaveBeenCalledTimes(2);
		expect(mockRenderDish).toHaveBeenCalledWith(dishes[0]);
		expect(mockRenderDish).toHaveBeenCalledWith(dishes[1]);
		expect(screen.getByText('Pasta Primavera')).toBeDefined();
		expect(screen.getByText('Caesar Salad')).toBeDefined();
	});

	it('passes meals grouped by ISO date to each DayRow', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		const events: ListViewEvent[] = [
			{
				id: 'a',
				date: '2024-06-10',
				name: 'A',
				borderColor: 'red',
				dishes: [],
			},
			{
				id: 'b',
				date: '2024-06-10',
				name: 'B',
				borderColor: 'red',
				dishes: [],
			},
			{
				id: 'c',
				date: '2024-06-12',
				name: 'C',
				borderColor: 'red',
				dishes: [],
			},
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		render(<ListView events={events} />);

		const rows = screen.getAllByTestId('day-row');
		expect(rows[0].getAttribute('data-meals-count')).toBe('2');
		expect(rows[0].getAttribute('data-meal-ids')).toBe('a,b');
		expect(rows[1].getAttribute('data-meals-count')).toBe('0');
		expect(rows[2].getAttribute('data-meals-count')).toBe('1');
		expect(rows[2].getAttribute('data-meal-ids')).toBe('c');
	});

	it('passes an empty meals array to DayRow for dates with no events', () => {
		const dates = [DateTime.local(2024, 6, 10), DateTime.local(2024, 6, 11)];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 10) }),
		);

		render(<ListView events={[]} />);

		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].meals).toEqual([]);
		}
	});
});
