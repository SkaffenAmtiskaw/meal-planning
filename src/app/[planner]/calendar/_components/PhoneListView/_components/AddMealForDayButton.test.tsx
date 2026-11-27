import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { useCanWrite } from '@/app/[planner]/_components';

import { AddMealForDayButton } from './AddMealForDayButton';

import { useCalendarModal } from '../../CalendarModal';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'@/app/[planner]/_components',
	async () => await import('#mocks/@/app/[planner]/_components'),
);

vi.mock(
	'../../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

const mockOpen = vi.fn();
const date = DateTime.local(2026, 11, 21);

describe('AddMealForDayButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open: mockOpen,
			close: vi.fn(),
		});
	});

	it('opens Add Meal with its day filled in', () => {
		render(<AddMealForDayButton date={date} />);

		fireEvent.click(
			screen.getByRole('button', {
				name: 'Add meal for Saturday, November 21',
			}),
		);

		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: '2026-11-21',
		});
	});

	it('falls back to undefined when the date has no ISO representation', () => {
		const noIsoDate = DateTime.local(2026, 11, 21);
		vi.spyOn(noIsoDate, 'toISODate').mockReturnValue(null);

		render(<AddMealForDayButton date={noIsoDate} />);

		fireEvent.click(screen.getByRole('button'));

		expect(mockOpen).toHaveBeenCalledWith('add_meal', {
			initialDate: undefined,
		});
	});

	it('does not render for read-only users', () => {
		vi.mocked(useCanWrite).mockReturnValueOnce(false);

		render(<AddMealForDayButton date={date} />);

		expect(screen.queryByRole('button')).toBeNull();
	});
});
