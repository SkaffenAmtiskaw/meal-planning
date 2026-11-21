import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCanWrite } from '@/app/[planner]/_components';

import { AddMealButton } from './AddMealButton';

import { useCalendarModal } from '../CalendarModal';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const mockOpen = vi.fn();

vi.mock(
	'@/app/[planner]/_components',
	async () => await import('#mocks/@/app/[planner]/_components'),
);

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

describe('AddMealButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open: mockOpen,
			close: vi.fn(),
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders a button with the correct label when user has write access', () => {
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	it('calls open with the add_meal modal when the button is clicked', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		expect(mockOpen).toHaveBeenCalledTimes(1);
		expect(mockOpen).toHaveBeenCalledWith('add_meal', {});
	});

	it('does not render when user has read-only access', () => {
		vi.mocked(useCanWrite).mockReturnValue(false);
		render(<AddMealButton />);
		expect(screen.queryByTestId('add-meal-button')).toBeNull();
	});
});
