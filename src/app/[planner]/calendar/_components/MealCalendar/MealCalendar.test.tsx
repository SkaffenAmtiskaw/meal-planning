import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DayInterface } from '@/_models/types';

import { MealCalendar } from './MealCalendar';
import { MealEventCard } from './MealEventCard';

import { MonthGrid } from '../Calendar';
import type { CalendarMeal, MonthGridMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

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
						: meal.title}
				</div>
			))}
		</div>
	)),
}));

vi.mock('./MealEventCard', async () => ({
	MealEventCard: vi.fn(({ event, onClick, tabIndex, ref }) => (
		<button
			data-testid="meal-event-card"
			data-event-id={event.id}
			data-tabindex={tabIndex}
			data-has-ref={ref ? 'true' : 'false'}
			onClick={onClick}
			type="button"
		>
			{event.title}
		</button>
	)),
}));

vi.mock(
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
);

describe('MealCalendar', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const mockCalendar: DayInterface[] = [
		{
			date: '2024-01-15',
			meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
		},
	];

	const mockSavedItems: SavedItem[] = [{ _id: 'item-1', name: 'Saved Item 1' }];

	const mockCalendarMeals: CalendarMeal[] = [
		{
			id: 'meal-1',
			date: '2024-01-15',
			name: 'Breakfast',
			borderColor: '#000',
			dishes: [],
		},
	];

	it('converts calendar to meals and passes to MonthGrid', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} />);

		expect(toCalendarMeals).toHaveBeenCalledWith(mockCalendar, undefined);
		expect(MonthGrid).toHaveBeenCalled();

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.meals).toEqual([
			{
				id: 'meal-1',
				date: '2024-01-15',
				title: 'Breakfast',
				description: undefined,
			},
		]);
	});

	it('maps CalendarMeal date and name to MonthGridMeal date and title', () => {
		const meals: CalendarMeal[] = [
			{
				id: 'meal-1',
				date: '2024-06-01',
				name: 'Lunch',
				description: 'Test description',
				borderColor: '#000',
				dishes: [],
			},
		];
		vi.mocked(toCalendarMeals).mockReturnValue(meals);

		render(<MealCalendar calendar={mockCalendar} />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.meals).toEqual([
			{
				id: 'meal-1',
				date: '2024-06-01',
				title: 'Lunch',
				description: 'Test description',
			},
		]);
	});

	it('renders MealEventCard via renderMeal prop', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} />);

		const mealCards = screen.getAllByTestId('meal-event-card');
		expect(mealCards).toHaveLength(1);
		expect(mealCards[0].getAttribute('data-event-id')).toBe('meal-1');
		expect(vi.mocked(MealEventCard).mock.calls[0][0]).toEqual(
			expect.objectContaining({
				event: expect.objectContaining({
					id: 'meal-1',
					title: 'Breakfast',
				}),
			}),
		);
	});

	it('calls onMealClick with the full CalendarMeal when card is clicked', () => {
		const onMealClick = vi.fn();
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} onMealClick={onMealClick} />);

		fireEvent.click(screen.getByTestId('meal-event-card'));

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(mockCalendarMeals[0]);
	});

	it('does not break when onMealClick is undefined', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} />);

		expect(() => {
			fireEvent.click(screen.getByTestId('meal-event-card'));
		}).not.toThrow();
	});

	it('passes savedItems to toCalendarMeals', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(
			<MealCalendar calendar={mockCalendar} savedItems={mockSavedItems} />,
		);

		expect(toCalendarMeals).toHaveBeenCalledWith(mockCalendar, mockSavedItems);
	});

	it('returns null when renderMeal is called with a missing meal id', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);
		render(<MealCalendar calendar={mockCalendar} />);

		// Extract renderMeal from the MonthGrid mock call
		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.renderMeal).toBeDefined();

		// Call renderMeal with a meal ID that doesn't exist in mealMap
		const result = monthGridCall.renderMeal?.(
			{
				id: 'non-existent',
				date: '2024-01-15',
				title: 'Missing',
			},
			{ tabIndex: -1, ref: vi.fn() },
		);

		expect(result).toBeNull();
	});

	it('calls prop onMealClick with CalendarMeal when MonthGrid onMealClick fires', () => {
		const handleClick = vi.fn();
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} onMealClick={handleClick} />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		const monthGridMeal = {
			id: 'meal-1',
			date: '2024-01-15',
			title: 'Breakfast',
		};
		monthGridCall.onMealClick?.(monthGridMeal);

		expect(handleClick).toHaveBeenCalledTimes(1);
		expect(handleClick).toHaveBeenCalledWith(mockCalendarMeals[0]);
	});

	it('does not call prop onMealClick when MonthGrid onMealClick fires for a missing meal', () => {
		const handleClick = vi.fn();
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealCalendar calendar={mockCalendar} onMealClick={handleClick} />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		monthGridCall.onMealClick?.({
			id: 'non-existent',
			date: '2024-01-15',
			title: 'Missing',
		});

		expect(handleClick).not.toHaveBeenCalled();
	});
});
