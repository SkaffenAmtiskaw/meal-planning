import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeekView } from '@/_components/Calendar';

import { MealWeekView } from './MealWeekView';
import { WeekMealCard } from './WeekMealCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@/_components/Calendar', async () => ({
	WeekView: vi.fn(({ events, renderEvent, onEventClick }) => (
		<div data-testid="week-view">
			{events?.map((event: { id: string; date: string; title: string }) => (
				<div key={event.id} data-testid="week-view-event">
					{renderEvent
						? renderEvent(event, {
								tabIndex: 0,
								ref: vi.fn(),
							})
						: event.title}
					<button
						type="button"
						data-testid={`week-view-event-${event.id}`}
						onClick={() => onEventClick?.(event)}
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

	it('converts calendar to events and passes to WeekView', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, undefined);
		expect(WeekView).toHaveBeenCalled();

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.events).toEqual([
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

	it('renders WeekMealCard via renderEvent prop', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const mealCards = screen.getAllByTestId('week-meal-card');
		expect(mealCards).toHaveLength(1);
		expect(mealCards[0].getAttribute('data-event-id')).toBe('meal-1');
		expect(mealCards[0].getAttribute('data-planner-id')).toBe('planner-1');
	});

	it('calls onEventClick with full CalendarEvent when WeekView onEventClick fires', () => {
		const onEventClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onEventClick={onEventClick}
			/>,
		);

		fireEvent.click(screen.getByTestId('week-view-event-meal-1'));

		expect(onEventClick).toHaveBeenCalledTimes(1);
		expect(onEventClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('calls onEventClick with full CalendarEvent when WeekMealCard is clicked', () => {
		const onEventClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onEventClick={onEventClick}
			/>,
		);

		fireEvent.click(screen.getByTestId('week-meal-card'));

		expect(onEventClick).toHaveBeenCalledTimes(1);
		expect(onEventClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('passes tabIndex and ref to WeekMealCard via renderEvent', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderEvent).toBeDefined();

		const ref = vi.fn();
		const node = weekViewCall.renderEvent?.(
			{ id: 'meal-1', date: '2024-01-15', title: 'Breakfast' },
			{ tabIndex: -1, ref },
		);

		render(<div>{node}</div>);

		expect(WeekMealCard).toHaveBeenCalledWith(
			expect.objectContaining({ tabIndex: -1, ref }),
			undefined,
		);
	});

	it('returns null when renderEvent is called with a missing event id', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);
		render(<MealWeekView calendar={mockCalendar} plannerId="planner-1" />);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.renderEvent).toBeDefined();

		const result = weekViewCall.renderEvent?.(
			{
				id: 'non-existent',
				date: '2024-01-15',
				title: 'Missing',
			},
			{ tabIndex: 0, ref: vi.fn() },
		);

		expect(result).toBeNull();
	});

	it('does not call onEventClick when WeekView fires onEventClick with an unknown event id', () => {
		const onEventClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealWeekView
				calendar={mockCalendar}
				plannerId="planner-1"
				onEventClick={onEventClick}
			/>,
		);

		const weekViewCall = vi.mocked(WeekView).mock.calls[0][0];
		expect(weekViewCall.onEventClick).toBeDefined();

		weekViewCall.onEventClick?.({
			id: 'non-existent',
			date: '2024-01-15',
			title: 'Missing',
		});

		expect(onEventClick).not.toHaveBeenCalled();
	});
});
