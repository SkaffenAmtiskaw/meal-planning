import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { MealListView } from './MealListView';

import type { CalendarDish, CalendarMeal } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ListView/ListView', async () => ({
	ListView: vi.fn(({ meals, renderDish }) => (
		<div data-testid="list-view" data-meals={JSON.stringify(meals)}>
			{meals.map((meal: CalendarMeal) => (
				<div key={meal.id} data-testid={`meal-${meal.id}`}>
					{meal.dishes.map((dish) => (
						<div key={dish.name} data-testid={`dish-${meal.id}-${dish.name}`}>
							{renderDish?.(dish)}
						</div>
					))}
				</div>
			))}
		</div>
	)),
}));

vi.mock('../DishLink/DishLink', async () => ({
	DishLink: vi.fn(() => <div data-testid="dish-link" />),
}));

vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

const mockUseCalendarMeals = vi.mocked(useCalendarMeals);
const mockDishLink = vi.mocked(DishLink);
const mockUseIsMobile = vi.mocked(useIsMobile);

const plannerId = 'planner-123';

const calendarMeals: CalendarMeal[] = [
	{
		id: 'meal-1',
		date: '2024-06-15',
		name: 'Breakfast',
		description: 'Morning meal',
		borderColor: '#000',
		dishes: [{ name: 'Resolved Eggs', source: { _id: 'saved-1' } }],
	},
];

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseIsMobile.mockReturnValue(false);
		mockUseCalendarMeals.mockReturnValue([]);
	});

	it('renders ListView', () => {
		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
	});

	it('renders MobileListViewPlaceholder on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByText('Coming soon')).toBeDefined();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('does not render ListView on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('does not render MobileListViewPlaceholder on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('passes a renderDish function that uses DishLink with size sm', () => {
		const dish: CalendarDish = {
			name: 'Rendered Dish',
			source: { _id: 'recipe-1' },
		};
		mockUseCalendarMeals.mockReturnValue([
			{
				id: 'meal-1',
				date: '2024-06-15',
				name: 'Breakfast',
				borderColor: '#000',
				dishes: [dish],
			},
		]);

		render(<MealListView plannerId={plannerId} />);

		expect(screen.getByTestId('dish-link')).toBeDefined();
		expect(mockDishLink).toHaveBeenCalledWith(
			expect.objectContaining({
				dish,
				plannerId,
				size: 'sm',
			}),
			undefined,
		);
	});

	it("passes the calendar's meals to ListView", () => {
		mockUseCalendarMeals.mockReturnValue(calendarMeals);

		render(<MealListView plannerId={plannerId} />);

		const listView = screen.getByTestId('list-view');
		const meals = JSON.parse(listView.getAttribute('data-meals') ?? '[]');

		expect(meals).toEqual(calendarMeals);
	});
});
