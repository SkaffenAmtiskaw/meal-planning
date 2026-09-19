import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';

import { MealMonthAgenda } from './MealMonthAgenda';

import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/Calendar', async () => ({
	useCalendarContext: vi.fn(() => ({
		selectedDate: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
		viewType: 'month',
		rangeAnchor: DateTime.fromObject({ year: 2024, month: 6, day: 15 }),
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
	})),
}));

const mockUseCalendarContext = vi.mocked(useCalendarContext);

const defaultProps = {
	plannerId: 'planner-1',
	calendar: [{ date: '2024-06-15', meals: [] }] as SerializedDay[],
	savedItems: [{ _id: 'item-1', name: 'Item 1' }] as SavedItem[],
};

describe('MealMonthAgenda', () => {
	beforeEach(() => {
		vi.resetAllMocks();
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
	});

	it('renders placeholder text with the selected date from context', () => {
		render(<MealMonthAgenda {...defaultProps} />);

		expect(screen.getByText('Mobile month view — June 15, 2024')).toBeDefined();
		expect(mockUseCalendarContext).toHaveBeenCalled();
	});

	it('accepts plannerId, calendar, and savedItems props without error', () => {
		expect(() =>
			render(
				<MealMonthAgenda
					plannerId="planner-2"
					calendar={[{ date: '2024-07-20', meals: [] }]}
					savedItems={[{ _id: 'item-2', name: 'Item 2' }]}
				/>,
			),
		).not.toThrow();

		expect(screen.getByText(/Mobile month view/)).toBeDefined();
	});
});
