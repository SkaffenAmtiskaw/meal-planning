import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCalendar } from './MealCalendar';
import { MonthMealCard } from './MonthMealCard';

import { MonthGrid } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import type { CalendarMeal, MonthGridMeal } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

vi.mock('../Calendar', async () => ({
	MonthGrid: vi.fn(({ meals, renderMeal }) => (
		<div data-testid="month-grid">
			{meals?.map((meal: MonthGridMeal, index: number) => (
				<div key={meal.id} data-testid="grid-meal">
					{renderMeal
						? renderMeal(meal, {
								tabIndex: index === 0 ? 0 : -1,
								ref: vi.fn(),
							})
						: meal.name}
				</div>
			))}
		</div>
	)),
}));

vi.mock('./MonthMealCard', async () => ({
	MonthMealCard: vi.fn(({ meal, onClick, tabIndex, ref }) => (
		<button
			data-testid="month-meal-card"
			data-meal-id={meal.id}
			data-tabindex={tabIndex}
			data-has-ref={ref ? 'true' : 'false'}
			onClick={onClick}
			type="button"
		>
			{meal.name}
		</button>
	)),
}));

vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

const open = vi.fn();

describe('MealCalendar', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open,
			close: vi.fn(),
		});
	});

	const mockCalendarMeals: CalendarMeal[] = [
		{
			id: 'meal-1',
			date: '2024-01-15',
			name: 'Breakfast',
			borderColor: '#000',
			dishes: [],
		},
	];

	it("passes the calendar's meals to MonthGrid", () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.meals).toBe(mockCalendarMeals);
	});

	it('renders MonthMealCard via renderMeal prop', () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar />);

		const mealCards = screen.getAllByTestId('month-meal-card');
		expect(mealCards).toHaveLength(1);
		expect(mealCards[0].getAttribute('data-meal-id')).toBe('meal-1');
		expect(vi.mocked(MonthMealCard).mock.calls[0][0]).toEqual(
			expect.objectContaining({
				meal: expect.objectContaining({
					id: 'meal-1',
					name: 'Breakfast',
				}),
			}),
		);
	});

	it('opens the meal detail modal with the meal id when a card is clicked', () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar />);

		fireEvent.click(screen.getByTestId('month-meal-card'));

		expect(open).toHaveBeenCalledTimes(1);
		expect(open).toHaveBeenCalledWith('meal_detail', { mealId: 'meal-1' });
	});

	it('returns null when renderMeal is called with a missing meal id', () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);
		render(<MealCalendar />);

		// Extract renderMeal from the MonthGrid mock call
		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.renderMeal).toBeDefined();

		// Call renderMeal with a meal ID that doesn't exist in mealMap
		const result = monthGridCall.renderMeal?.(
			{
				id: 'non-existent',
				date: '2024-01-15',
				name: 'Missing',
			},
			{ tabIndex: -1, ref: vi.fn() },
		);

		expect(result).toBeNull();
	});

	it('opens the meal detail modal with the meal id when MonthGrid onMealClick fires', () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		const monthGridMeal = {
			id: 'meal-1',
			date: '2024-01-15',
			name: 'Breakfast',
		};
		monthGridCall.onMealClick?.(monthGridMeal);

		expect(open).toHaveBeenCalledTimes(1);
		expect(open).toHaveBeenCalledWith('meal_detail', { mealId: 'meal-1' });
	});

	it('opens no modal when MonthGrid onMealClick fires for a missing meal', () => {
		vi.mocked(useCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		monthGridCall.onMealClick?.({
			id: 'non-existent',
			date: '2024-01-15',
			name: 'Missing',
		});

		expect(open).not.toHaveBeenCalled();
	});
});
