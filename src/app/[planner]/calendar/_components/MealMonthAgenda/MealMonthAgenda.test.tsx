import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';
import type { MobileMonthGridEvent } from '@/_components/Calendar/MobileMonthGrid/MobileMonthGrid';
import { MobileMonthGrid } from '@/_components/Calendar/MobileMonthGrid/MobileMonthGrid';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import { MealMonthAgenda } from './MealMonthAgenda';

import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/Calendar', async () => ({
	useCalendarContext: vi.fn(),
}));

vi.mock('../../_utils/resolveDishSource', () => ({
	resolveDishSource: vi.fn((dish) => dish),
}));

vi.mock('@/_components/Calendar/MobileMonthGrid/MobileMonthGrid', async () => ({
	MobileMonthGrid: vi.fn(({ events }: { events?: MobileMonthGridEvent[] }) => (
		<div data-testid="mobile-month-grid">
			{(events ?? []).map((event) => (
				<span
					key={event.id}
					data-testid="mobile-month-grid-event"
					data-date={event.date}
					data-color={event.color}
				>
					{event.date}
				</span>
			))}
		</div>
	)),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);
const mockMobileMonthGrid = vi.mocked(MobileMonthGrid);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [
		{
			date: '2024-06-15',
			meals: [
				{
					_id: 'meal-1',
					name: 'Breakfast Bowl',
					description: 'A hearty breakfast',
					dishes: [{ name: 'Oats' }],
				},
				{ _id: 'meal-2', name: 'Grilled Salmon', dishes: [] },
			],
		},
		{
			date: '2024-06-16',
			meals: [{ _id: 'meal-3', name: 'Veggie Stir Fry', dishes: [] }],
		},
		{ date: '2024-06-17' },
	] as SerializedDay[],
	savedItems: [{ _id: 'item-1', name: 'Item 1' }] as SavedItem[],
};

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
	});

	it('renders MobileMonthGrid with mapped dot events', () => {
		renderAgenda();

		expect(screen.getByTestId('mobile-month-grid')).toBeDefined();
		expect(screen.getAllByTestId('mobile-month-grid-event')).toHaveLength(3);

		const calls = mockMobileMonthGrid.mock.calls;
		expect(calls[calls.length - 1][0].events).toHaveLength(3);
	});

	it('uses the tag-color mapping for dot colors', () => {
		renderAgenda();

		const events = screen.getAllByTestId('mobile-month-grid-event');
		const expectedColor = TAG_COLORS[getMealColor('Breakfast Bowl')].border;

		expect(events[0].getAttribute('data-date')).toBe('2024-06-15');
		expect(events[0].getAttribute('data-color')).toBe(expectedColor);
	});

	it('updates the agenda placeholder when the selected date changes', () => {
		const { rerender } = renderAgenda(
			DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
		);

		expect(screen.getByText('Agenda for June 15, 2024')).toBeDefined();

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

		expect(screen.getByText('Agenda for June 16, 2024')).toBeDefined();
	});

	it('handles an empty calendar without errors', () => {
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

		expect(screen.queryAllByTestId('mobile-month-grid-event')).toHaveLength(0);
		expect(screen.getByText('Agenda for June 15, 2024')).toBeDefined();
	});
});
