import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeekView } from '@/_components/Calendar';

import { MealWeekView } from './MealWeekView';
import { WeekMealCard } from './WeekMealCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@/_components/Calendar', async () => ({
	WeekView: vi.fn(({ meals, renderMeal, onMealClick }) => (
		<div data-testid="week-view">
			{meals?.map((event: { id: string; date: string; title: string }) => (
				<div key={event.id} data-testid="week-view-event">
					{renderMeal
						? renderMeal(event, {
								tabIndex: 0,
								ref: vi.fn(),
							})
						: event.title}
					<button
						type="button"
						data-testid={`week-view-event-${event.id}`}
						onClick={() => onMealClick?.(event)}
					>
						Trigger
					</button>
				</div>
			))}
		</div>
	)),
}));

vi.mock('./WeekMealCard', async () => ({
	WeekMealCard: vi.fn(({ event, onClick, plannerId }) => (
		<button
			type="button"
			data-testid="week-meal-card"
			data-event-id={event.id}
			data-planner-id={plannerId}
			onClick={onClick}
		>
			{event.title}
		</button>
	)),
}));

vi.mock('../../_utils/toCalendarEvents', async () => ({
	toCalendarEvents: vi.fn(),
}));

describe('MealWeekView', () => {
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

	it('converts calendar to meals and passes to WeekView', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, undefined);
		expect(WeekView).toHaveBeenCalled();

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.meals).toEqual([
			{
				id: 'meal-1',
				date: '2024-01-15',
				title: 'Breakfast',
				description: undefined,
			},
		]);
	});

	it('passes savedItems to toCalendarEvents', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				savedItems={mockSavedItems}
				plannerId="planner-1"
			/>,
		);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, mockSavedItems);
	});

	it('renders WeekMealCard via renderMeal prop', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const mealCards = screen.getAllByTestId('week-meal-card');
		expect(mealCards).toHaveLength(1);
		expect(mealCards[0].getAttribute('data-event-id')).toBe('meal-1');
		expect(mealCards[0].getAttribute('data-planner-id')).toBe('planner-1');
	});

	it('calls onMealClick with full CalendarEvent when WeekView onMealClick fires', () => {
		const onMealClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onMealClick={onMealClick}
			/>,
		);

		fireEvent.click(screen.getByTestId('week-view-event-meal-1'));

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('calls onMealClick with full CalendarEvent when WeekMealCard is clicked', () => {
		const onMealClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onMealClick={onMealClick}
			/>,
		);

		fireEvent.click(screen.getByTestId('week-meal-card'));

		expect(onMealClick).toHaveBeenCalledTimes(1);
		expect(onMealClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('passes tabIndex and ref to WeekMealCard via renderMeal', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderMeal).toBeDefined();

		const ref = vi.fn();
		const node = weekViewCall.renderMeal?.(
			{ id: 'meal-1', date: '2024-01-15', title: 'Breakfast' },
			{ tabIndex: -1, ref },
		);

		render(<div>{node}</div>);

		expect(WeekMealCard).toHaveBeenCalledWith(
			expect.objectContaining({ tabIndex: -1, ref }),
			undefined,
		);
	});

	it('returns null when renderMeal is called with a missing meal id', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);
		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderMeal).toBeDefined();

		const result = weekViewCall.renderMeal?.(
			{
				id: 'non-existent',
				date: '2024-01-15',
				title: 'Missing',
			},
			{ tabIndex: 0, ref: vi.fn() },
		);

		expect(result).toBeNull();
	});

	it('does not call onMealClick when WeekView fires onMealClick with an unknown meal id', () => {
		const onMealClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onMealClick={onMealClick}
			/>,
		);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.onMealClick).toBeDefined();

		weekViewCall.onMealClick?.({
			id: 'non-existent',
			date: '2024-01-15',
			title: 'Missing',
		});

		expect(onMealClick).not.toHaveBeenCalled();
	});
});
