import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MonthGridMeal } from '@/_components/Calendar';
import { MonthGrid } from '@/_components/Calendar';

import { MealCalendar } from './MealCalendar';
import { MealEventCard } from './MealEventCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@/_components/Calendar', async () => ({
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

vi.mock('../../_utils/toCalendarEvents', async () => ({
	toCalendarEvents: vi.fn(),
}));

describe('MealCalendar', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const mockCalendar: SerializedDay[] = [
		{
			date: '2024-01-15',
			meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
		},
	];

	const mockSavedItems: SavedItem[] = [{ _id: 'item-1', name: 'Saved Item 1' }];

	const mockCalendarEvents: CalendarEvent[] = [
		{
			id: 'meal-1',
			start: '2024-01-15',
			end: '2024-01-15',
			title: 'Breakfast',
			dishes: [],
		},
	];

	it('converts calendar to meals and passes to MonthGrid', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealCalendar calendar={mockCalendar} />);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, undefined);
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

	it('maps CalendarEvent start field to MonthGridMeal date field', () => {
		const events: CalendarEvent[] = [
			{
				id: 'meal-1',
				start: '2024-06-01',
				end: '2024-06-01',
				title: 'Lunch',
				description: 'Test description',
				dishes: [],
			},
		];
		vi.mocked(toCalendarEvents).mockReturnValue(events);

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
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

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

	it('calls onMealClick with full CalendarEvent when card is clicked', () => {
		const onMealClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealCalendar calendar={mockCalendar} onMealClick={onMealClick} />);

		fireEvent.click(screen.getByTestId('meal-event-card'));

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('does not break when onMealClick is undefined', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealCalendar calendar={mockCalendar} />);

		expect(() => {
			fireEvent.click(screen.getByTestId('meal-event-card'));
		}).not.toThrow();
	});

	it('passes savedItems to toCalendarEvents', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealCalendar calendar={mockCalendar} savedItems={mockSavedItems} />,
		);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, mockSavedItems);
	});

	it('returns null when renderMeal is called with a missing meal id', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);
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

	it('calls prop onMealClick with CalendarEvent when MonthGrid onMealClick fires', () => {
		const handleClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealCalendar calendar={mockCalendar} onMealClick={handleClick} />);

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		const monthGridMeal = {
			id: 'meal-1',
			date: '2024-01-15',
			title: 'Breakfast',
		};
		monthGridCall.onMealClick?.(monthGridMeal);

		expect(handleClick).toHaveBeenCalledTimes(1);
		expect(handleClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('does not call prop onMealClick when MonthGrid onMealClick fires for a missing meal', () => {
		const handleClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

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
