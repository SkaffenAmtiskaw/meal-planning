import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MonthGridEvent } from '@/_components/Calendar';
import { MonthGrid } from '@/_components/Calendar';

import { MealCalendar } from './MealCalendar';
import { MealEventCard } from './MealEventCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@/_components/Calendar', async () => ({
	MonthGrid: vi.fn(({ events, renderEvent }) => (
		<div data-testid="month-grid">
			{events?.map((event: MonthGridEvent) => (
				<div key={event.id} data-testid="grid-event">
					{renderEvent ? renderEvent(event) : event.title}
				</div>
			))}
		</div>
	)),
}));

vi.mock('./MealEventCard', async () => ({
	MealEventCard: vi.fn(({ event, onClick }) => (
		<button
			data-testid="meal-event-card"
			data-event-id={event.id}
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

	it('converts calendar to events and passes to MonthGrid', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(<MealCalendar calendar={mockCalendar} />);

		expect(toCalendarEvents).toHaveBeenCalledWith(mockCalendar, undefined);
		expect(MonthGrid).toHaveBeenCalled();

		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.events).toEqual([
			{
				id: 'meal-1',
				date: '2024-01-15',
				title: 'Breakfast',
				description: undefined,
			},
		]);
	});

	it('maps CalendarEvent start field to MonthGridEvent date field', () => {
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
		expect(monthGridCall.events).toEqual([
			{
				id: 'meal-1',
				date: '2024-06-01',
				title: 'Lunch',
				description: 'Test description',
			},
		]);
	});

	it('renders MealEventCard via renderEvent prop', () => {
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

	it('calls onEventClick with full CalendarEvent when card is clicked', () => {
		const onEventClick = vi.fn();
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);

		render(
			<MealCalendar calendar={mockCalendar} onEventClick={onEventClick} />,
		);

		fireEvent.click(screen.getByTestId('meal-event-card'));

		expect(onEventClick).toHaveBeenCalledTimes(1);
		expect(onEventClick).toHaveBeenCalledWith(mockCalendarEvents[0]);
	});

	it('does not break when onEventClick is undefined', () => {
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

	it('returns null when renderEvent is called with a missing event id', () => {
		vi.mocked(toCalendarEvents).mockReturnValue(mockCalendarEvents);
		render(<MealCalendar calendar={mockCalendar} />);

		// Extract renderEvent from the MonthGrid mock call
		const monthGridCall = vi.mocked(MonthGrid).mock.calls[0][0];
		expect(monthGridCall.renderEvent).toBeDefined();

		// Call renderEvent with an event ID that doesn't exist in eventMap
		const result = monthGridCall.renderEvent?.({
			id: 'non-existent',
			date: '2024-01-15',
			title: 'Missing',
		});

		expect(result).toBeNull();
	});
});
