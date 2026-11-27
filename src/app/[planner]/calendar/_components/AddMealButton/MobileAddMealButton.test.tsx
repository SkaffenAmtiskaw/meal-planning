import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';
import { useCanWrite } from '@/app/[planner]/_components';

import { MobileAddMealButton } from './MobileAddMealButton';

import { useCalendarContext } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

const mockOpen = vi.fn();

vi.mock(
	'@/app/[planner]/_components',
	async () => await import('#mocks/@/app/[planner]/_components'),
);

vi.mock('../Calendar', () => ({
	useCalendarContext: vi.fn(),
}));

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

describe('MobileAddMealButton', () => {
	const selectedDate = DateTime.local(2024, 6, 15);

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open: mockOpen,
			close: vi.fn(),
		});
		vi.mocked(useCalendarContext).mockReturnValue({
			selectedDate,
		} as ReturnType<typeof useCalendarContext>);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders an ember Add Meal FAB named for the selected date', () => {
		render(<MobileAddMealButton />);

		expect(
			screen.getByRole('button', { name: 'Add meal for Saturday, June 15' }),
		).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	it("is disabled, with no date in its name, until the viewer's day is known", () => {
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(selectedDate));

		render(<MobileAddMealButton />);

		const button = screen.getByRole('button', { name: 'Add Meal' });
		expect(button.hasAttribute('disabled')).toBe(true);
	});

	it('opens the add_meal modal with the selected date when clicked', () => {
		render(<MobileAddMealButton />);

		fireEvent.click(screen.getByTestId('mobile-add-meal-button'));

		expect(mockOpen).toHaveBeenCalledTimes(1);
		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: '2024-06-15',
		});
	});

	it('falls back to undefined when the selected date has no ISO representation', () => {
		const noIsoDate = DateTime.local(2024, 6, 15);
		vi.spyOn(noIsoDate, 'toISODate').mockReturnValue(null);
		vi.mocked(useCalendarContext).mockReturnValue({
			selectedDate: noIsoDate,
		} as ReturnType<typeof useCalendarContext>);

		render(<MobileAddMealButton />);

		fireEvent.click(screen.getByTestId('mobile-add-meal-button'));

		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: undefined,
		});
	});

	it('does not render for read-only users', () => {
		vi.mocked(useCanWrite).mockReturnValue(false);

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
