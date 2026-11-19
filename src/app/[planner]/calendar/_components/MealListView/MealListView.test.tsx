import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';
import type { DayInterface } from '@/_models/types';

import { MealListView } from './MealListView';

import type { CalendarDish, CalendarMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ListView/ListView', async () => ({
	ListView: vi.fn(({ events, renderDish }) => (
		<div data-testid="list-view" data-events={JSON.stringify(events)}>
			{events.map((event: CalendarMeal) => (
				<div key={event.id} data-testid={`event-${event.id}`}>
					{event.dishes.map((dish) => (
						<div key={dish.name} data-testid={`dish-${event.id}-${dish.name}`}>
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
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
);

const mockToCalendarMeals = vi.mocked(toCalendarMeals);
const mockDishLink = vi.mocked(DishLink);
const mockUseIsMobile = vi.mocked(useIsMobile);

const plannerId = 'planner-123';

const savedItems: SavedItem[] = [
	{ _id: 'saved-1', name: 'Saved Dish', url: 'http://example.com' },
];

const calendar: DayInterface[] = [
	{
		date: '2024-06-15',
		meals: [
			{
				_id: 'meal-1',
				name: 'Breakfast',
				description: 'Morning meal',
				dishes: [{ _id: 'dish-1', name: 'Eggs' }],
			},
		],
	},
];

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
		mockToCalendarMeals.mockReturnValue([]);
	});

	it('renders ListView', () => {
		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
	});

	it('renders MobileListViewPlaceholder on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByText('Coming soon')).toBeDefined();
		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('renders ListView on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('does not render ListView on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.queryByTestId('list-view')).toBeNull();
	});

	it('does not render MobileListViewPlaceholder on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} calendar={[]} />);

		expect(screen.queryByText('Coming soon')).toBeNull();
	});

	it('passes a renderDish function that uses DishLink with size sm', () => {
		const dish: CalendarDish = {
			name: 'Rendered Dish',
			source: { _id: 'recipe-1' },
		};
		mockToCalendarMeals.mockReturnValue([
			{
				id: 'meal-1',
				date: '2024-06-15',
				name: 'Breakfast',
				borderColor: '#000',
				dishes: [dish],
			},
		]);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);

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

	it('passes the meals built from the calendar and saved items to ListView', () => {
		mockToCalendarMeals.mockReturnValue(calendarMeals);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);

		expect(mockToCalendarMeals).toHaveBeenCalledWith(calendar, savedItems);

		const listView = screen.getByTestId('list-view');
		const events = JSON.parse(listView.getAttribute('data-events') ?? '[]');

		expect(events).toEqual(calendarMeals);
	});

	it('builds meals with no saved items when none are passed', () => {
		render(<MealListView plannerId={plannerId} calendar={calendar} />);

		expect(mockToCalendarMeals).toHaveBeenCalledWith(calendar, []);
	});
});
