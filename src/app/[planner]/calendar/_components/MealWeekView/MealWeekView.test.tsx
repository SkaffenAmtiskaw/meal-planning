import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DayInterface } from '@/_models/types';

import { MealWeekView } from './MealWeekView';
import { WeekMealCard } from './WeekMealCard';

import { WeekView } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import type { CalendarMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

vi.mock('../Calendar', async () => ({
	WeekView: vi.fn(({ meals, renderMeal, onMealClick }) => (
		<div data-testid="week-view">
			{meals?.map((meal: { id: string; date: string; name: string }) => (
				<div key={meal.id} data-testid="week-view-meal">
					{renderMeal
						? renderMeal(meal, {
								tabIndex: 0,
								ref: vi.fn(),
							})
						: meal.name}
					<button
						type="button"
						data-testid={`week-view-meal-${meal.id}`}
						onClick={() => onMealClick?.(meal)}
					>
						Trigger
					</button>
				</div>
			))}
		</div>
	)),
}));

vi.mock('./WeekMealCard', async () => ({
	WeekMealCard: vi.fn(({ meal, onClick, plannerId }) => (
		<button
			type="button"
			data-testid="week-meal-card"
			data-meal-id={meal.id}
			data-planner-id={plannerId}
			onClick={onClick}
		>
			{meal.name}
		</button>
	)),
}));

vi.mock(
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
);

const open = vi.fn();

describe('MealWeekView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open,
			close: vi.fn(),
		});
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

	it('converts calendar to meals and passes to WeekView', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		expect(toCalendarMeals).toHaveBeenCalledWith(mockCalendar, undefined);
		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.meals).toBe(mockCalendarMeals);
	});

	it('passes savedItems to toCalendarMeals', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(
			<MealWeekView
				calendar={mockCalendar}
				savedItems={mockSavedItems}
				plannerId="planner-1"
			/>,
		);

		expect(toCalendarMeals).toHaveBeenCalledWith(mockCalendar, mockSavedItems);
	});

	it('renders WeekMealCard via renderMeal prop', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const mealCards = screen.getAllByTestId('week-meal-card');
		expect(mealCards).toHaveLength(1);
		expect(mealCards[0].getAttribute('data-meal-id')).toBe('meal-1');
		expect(mealCards[0].getAttribute('data-planner-id')).toBe('planner-1');
	});

	it('opens the meal detail modal with the meal id when WeekView onMealClick fires', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		fireEvent.click(screen.getByTestId('week-view-meal-meal-1'));

		expect(open).toHaveBeenCalledTimes(1);
		expect(open).toHaveBeenCalledWith('meal_detail', { mealId: 'meal-1' });
	});

	it('opens the meal detail modal with the meal id when WeekMealCard is clicked', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		fireEvent.click(screen.getByTestId('week-meal-card'));

		expect(open).toHaveBeenCalledTimes(1);
		expect(open).toHaveBeenCalledWith('meal_detail', { mealId: 'meal-1' });
	});

	it('passes tabIndex and ref to WeekMealCard via renderMeal', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderMeal).toBeDefined();

		const ref = vi.fn();
		const node = weekViewCall.renderMeal?.(
			{ id: 'meal-1', date: '2024-01-15', name: 'Breakfast' },
			{ tabIndex: -1, ref },
		);

		render(<div>{node}</div>);

		expect(WeekMealCard).toHaveBeenCalledWith(
			expect.objectContaining({ tabIndex: -1, ref }),
			undefined,
		);
	});

	it('returns null when renderMeal is called with a missing meal id', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);
		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderMeal).toBeDefined();

		const result = weekViewCall.renderMeal?.(
			{
				id: 'non-existent',
				date: '2024-01-15',
				name: 'Missing',
			},
			{ tabIndex: 0, ref: vi.fn() },
		);

		expect(result).toBeNull();
	});

	it('opens no modal when WeekView fires onMealClick with an unknown meal id', () => {
		vi.mocked(toCalendarMeals).mockReturnValue(mockCalendarMeals);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.onMealClick).toBeDefined();

		weekViewCall.onMealClick?.({
			id: 'non-existent',
			date: '2024-01-15',
			name: 'Missing',
		});

		expect(open).not.toHaveBeenCalled();
	});
});
