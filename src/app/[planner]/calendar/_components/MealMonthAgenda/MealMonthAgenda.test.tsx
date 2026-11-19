import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactElement } from 'react';

import { DateTime } from 'luxon';

import type { DayInterface } from '@/_models/types';

import { MealMonthAgenda } from './MealMonthAgenda';

import { useCalendarContext } from '../Calendar';
import type { CalendarDish, CalendarMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import type { MobileAgendaProps } from '../Calendar/MobileAgenda/types';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridMeal } from '../Calendar/MobileMonthGrid/types';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../Calendar', async () => ({
	useCalendarContext: vi.fn(),
}));

vi.mock(
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
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
	MobileAgenda: vi.fn(({ meals }: MobileAgendaProps) => (
		<div data-testid="mobile-agenda">
			{(meals ?? []).map((meal) => (
				<span
					key={meal.id}
					data-testid="mobile-agenda-meal"
					data-date={meal.date}
					data-border-color={meal.borderColor}
				>
					{meal.name}
				</span>
			))}
		</div>
	)),
}));

vi.mock('../DishLink/DishLink', async () => ({
	DishLink: vi.fn(() => <span data-testid="dish-link" />),
}));

vi.mock('../AddMealButton/MobileAddMealButton', () => ({
	MobileAddMealButton: vi.fn(() => (
		<div data-testid="mobile-add-meal-button" />
	)),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockMobileMonthGrid = vi.mocked(MobileMonthGrid);
const mockMobileAgenda = vi.mocked(MobileAgenda);
const mockDishLink = vi.mocked(DishLink);
const mockToCalendarMeals = vi.mocked(toCalendarMeals);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [
		{
			date: '2024-06-15',
			meals: [{ _id: 'meal-1', name: 'Breakfast Bowl', dishes: [] }],
		},
	] as DayInterface[],
	savedItems: [{ _id: 'item-1', name: 'Item 1' }] as SavedItem[],
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
		rangeAnchor: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
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
		mockToCalendarMeals.mockReturnValue(calendarMeals);
	});

	it('builds meals from the calendar and saved items', () => {
		renderAgenda();

		expect(mockToCalendarMeals).toHaveBeenCalledWith(
			defaultProps.calendar,
			defaultProps.savedItems,
		);
	});

	it('gives MobileMonthGrid one dot per meal, on its date and in its border colour', () => {
		renderAgenda();

		const calls = mockMobileMonthGrid.mock.calls;
		expect(calls[calls.length - 1][0].meals).toEqual([
			{ id: 'meal-1', date: '2024-06-15', color: '#111' },
			{ id: 'meal-2', date: '2024-06-16', color: '#222' },
		]);
	});

	it('passes the meals to MobileAgenda', () => {
		renderAgenda();

		const calls = mockMobileAgenda.mock.calls;
		expect(calls[calls.length - 1][0].meals).toEqual(calendarMeals);
	});

	it('passes a renderDish function that uses DishLink', () => {
		renderAgenda();

		const calls = mockMobileAgenda.mock.calls;
		const renderDish = calls[calls.length - 1][0].renderDish as
			| ((dish: CalendarDish) => ReactElement)
			| undefined;

		expect(renderDish).toBeDefined();

		const dish: CalendarDish = { name: 'Test Dish' };
		render(renderDish?.(dish) ?? null);

		expect(mockDishLink).toHaveBeenCalledTimes(1);
		expect(mockDishLink.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				dish,
				plannerId: defaultProps.plannerId,
				size: 'sm',
			}),
		);
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
			rangeAnchor: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
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
		mockToCalendarMeals.mockReturnValue([]);
		mockUseCalendarContext.mockReturnValue({
			selectedDate: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
			viewType: 'month',
			rangeAnchor: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
			setSelectedDate: vi.fn(),
			setViewType: vi.fn(),
			navigateToDate: vi.fn(),
			goToToday: vi.fn(),
			goToPrevious: vi.fn(),
			goToNext: vi.fn(),
		});

		expect(() =>
			render(<MealMonthAgenda plannerId="planner-1" calendar={[]} />),
		).not.toThrow();

		expect(screen.queryAllByTestId('mobile-month-grid-meal')).toHaveLength(0);
		expect(screen.getByTestId('mobile-agenda')).toBeDefined();
		expect(screen.queryAllByTestId('mobile-agenda-meal')).toHaveLength(0);
	});
});
