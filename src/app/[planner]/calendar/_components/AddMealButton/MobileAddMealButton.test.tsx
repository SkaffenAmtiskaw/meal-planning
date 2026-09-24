import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from '@/_components/Calendar';

import { MobileAddMealButton } from './MobileAddMealButton';

import { useCalendarModal } from '../CalendarModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const { mockUseCanWrite, mockOpen } = vi.hoisted(() => ({
	mockUseCanWrite: vi.fn(),
	mockOpen: vi.fn(),
}));

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: mockUseCanWrite,
}));

vi.mock('@/_components/Calendar', () => ({
	useCalendarContext: vi.fn(),
}));

vi.mock('../CalendarModal', () => ({
	useCalendarModal: vi.fn(() => ({
		open: mockOpen,
		state: { type: null, data: null },
	})),
}));

describe('MobileAddMealButton', () => {
	const selectedDate = DateTime.local(2024, 6, 15);

	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
		vi.mocked(useCalendarContext).mockReturnValue({
			selectedDate,
		} as ReturnType<typeof useCalendarContext>);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders an ember Add Meal FAB for users with write access', () => {
		render(<MobileAddMealButton />);

		expect(screen.getByTestId('mobile-add-meal-button')).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	it('opens the add_meal modal with the selected date when clicked', () => {
		render(<MobileAddMealButton />);

		fireEvent.click(screen.getByTestId('mobile-add-meal-button'));

		expect(mockOpen).toHaveBeenCalledTimes(1);
		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: '2024-06-15',
		});
	});

	it('opens the add_meal modal without an initial date when selectedDate is invalid', () => {
		vi.mocked(useCalendarContext).mockReturnValue({
			selectedDate: DateTime.invalid('invalid'),
		} as ReturnType<typeof useCalendarContext>);

		render(<MobileAddMealButton />);

		fireEvent.click(screen.getByTestId('mobile-add-meal-button'));

		expect(mockOpen).toHaveBeenCalledTimes(1);
		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: undefined,
		});
	});

	it('does not render for read-only users', () => {
		mockUseCanWrite.mockReturnValue(false);

		render(<MobileAddMealButton />);

		expect(screen.queryByTestId('mobile-add-meal-button')).toBeNull();
	});

	it('does not render while a modal is open', () => {
		vi.mocked(useCalendarModal).mockReturnValue({
			open: mockOpen,
			state: { type: 'add_meal', data: { initialDate: '2024-06-15' } },
			close: vi.fn(),
		} as ReturnType<typeof useCalendarModal>);

		render(<MobileAddMealButton />);

		expect(screen.queryByTestId('mobile-add-meal-button')).toBeNull();
	});
});
