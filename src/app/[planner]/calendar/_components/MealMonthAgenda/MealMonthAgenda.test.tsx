import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { MealMonthAgenda } from './MealMonthAgenda';

import { useCalendarContext } from '../Calendar';
import type { CalendarMeal } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridMeal } from '../Calendar/MobileMonthGrid/types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../Calendar', async () => ({
	useCalendarContext: vi.fn(),
}));

vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

vi.mock('../Calendar/MobileMonthGrid/MobileMonthGrid', async () => ({
	MobileMonthGrid: vi.fn(({ meals }: { meals?: MobileMonthGridMeal[] }) => (
		<div data-testid="mobile-month-grid">
			{(meals ?? []).map((meal) => (
				<span
					key={meal.id}
					data-testid="mobile-month-grid-meal"
					data-date={meal.date}
					data-color={meal.color}
				>
					{meal.date}
				</span>
			))}
		</div>
	)),
}));

vi.mock('../Calendar/MobileAgenda/MobileAgenda', async () => ({
	MobileAgenda: vi.fn(() => <div data-testid="mobile-agenda" />),
}));

vi.mock('../AddMealButton/MobileAddMealButton', () => ({
	MobileAddMealButton: vi.fn(() => (
		<div data-testid="mobile-add-meal-button" />
	)),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockMobileMonthGrid = vi.mocked(MobileMonthGrid);
const mockMobileAgenda = vi.mocked(MobileAgenda);
const mockUseCalendarMeals = vi.mocked(useCalendarMeals);

const defaultProps = {
	plannerId: 'planner-1',
};

const calendarMeals: CalendarMeal[] = [
	{
		id: 'meal-1',
		date: '2024-06-15',
		name: 'Breakfast Bowl',
		borderColor: '#111',
		dishes: [],
	},
	{
		id: 'meal-2',
		date: '2024-06-16',
		name: 'Grilled Salmon',
		borderColor: '#222',
		dishes: [],
	},
];

function renderAgenda(
	selectedDate = DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
) {
	mockUseCalendarContext.mockReturnValue({
		selectedDate,
		viewType: 'month',
		jump: null,
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	});

	return render(<MealMonthAgenda {...defaultProps} />);
}

describe('MealMonthAgenda', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCalendarMeals.mockReturnValue(calendarMeals);
	});

	it('gives MobileMonthGrid one dot per meal, on its date and in its border colour', () => {
		renderAgenda();

		const calls = mockMobileMonthGrid.mock.calls;
		expect(calls[calls.length - 1][0].meals).toEqual([
			{ id: 'meal-1', date: '2024-06-15', color: '#111' },
			{ id: 'meal-2', date: '2024-06-16', color: '#222' },
		]);
	});

	it('shows the agenda’s skeleton while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.local(2024, 6, 15)),
		);

		renderAgenda();

		expect(screen.getByTestId('mobile-agenda-skeleton')).toBeDefined();
		expect(screen.queryByTestId('mobile-agenda')).toBeNull();
	});

	it('shows the agenda once the day is known', () => {
		renderAgenda();

		expect(screen.getByTestId('mobile-agenda')).toBeDefined();
		expect(screen.queryByTestId('mobile-agenda-skeleton')).toBeNull();
	});

	it('updates MobileAgenda when the selected date changes', () => {
		const { rerender } = renderAgenda(
			DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
		);

		expect(screen.getByTestId('mobile-agenda')).toBeDefined();
		expect(mockMobileAgenda).toHaveBeenCalledTimes(1);

		mockUseCalendarContext.mockReturnValue({
			selectedDate: DateTime.fromObject({ year: 2024, month: 6, day: 16 }),
			viewType: 'month',
			jump: null,
			setSelectedDate: vi.fn(),
			setViewType: vi.fn(),
			navigateToDate: vi.fn(),
			goToToday: vi.fn(),
			goToPrevious: vi.fn(),
			goToNext: vi.fn(),
		});

		rerender(<MealMonthAgenda {...defaultProps} />);

		expect(screen.getByTestId('mobile-agenda')).toBeDefined();
		expect(mockMobileAgenda).toHaveBeenCalledTimes(2);
	});

	it('handles an empty calendar without errors', () => {
		mockUseCalendarMeals.mockReturnValue([]);
		mockUseCalendarContext.mockReturnValue({
			selectedDate: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
			viewType: 'month',
			jump: null,
			setSelectedDate: vi.fn(),
			setViewType: vi.fn(),
			navigateToDate: vi.fn(),
			goToToday: vi.fn(),
			goToPrevious: vi.fn(),
			goToNext: vi.fn(),
		});

		expect(() =>
			render(<MealMonthAgenda plannerId="planner-1" />),
		).not.toThrow();

		expect(screen.queryAllByTestId('mobile-month-grid-meal')).toHaveLength(0);
		expect(screen.getByTestId('mobile-agenda')).toBeDefined();
	});
});
