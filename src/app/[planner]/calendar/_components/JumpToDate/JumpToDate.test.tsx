import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { DatePickerPopover } from '@/_components';

import { JumpToDate } from './JumpToDate';

import { useMealDates } from '../../_hooks/useCalendarMeals';
import { useCalendarContext } from '../Calendar/CalendarContext';
import type { CalendarContextValue } from '../Calendar/types';

vi.mock('@/_components', () => ({
	DatePickerPopover: vi.fn(() => null),
}));

vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

vi.mock('../Calendar/CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

const mockNavigateToDate = vi.fn();

const popoverProps = () => vi.mocked(DatePickerPopover).mock.lastCall?.[0];

function renderJumpToDate() {
	vi.mocked(useCalendarContext).mockReturnValue({
		selectedDate: DateTime.local(2024, 6, 15),
		navigateToDate: mockNavigateToDate,
	} as unknown as CalendarContextValue);

	return render(
		<JumpToDate
			renderTrigger={({ onClick }) => (
				<button type="button" onClick={onClick}>
					Jump
				</button>
			)}
		/>,
	);
}

describe('JumpToDate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('selects the date in view', () => {
		renderJumpToDate();

		expect(popoverProps()?.value).toBe('2024-06-15');
	});

	it('marks the days with meals', () => {
		vi.mocked(useMealDates).mockReturnValue(['2024-06-12', '2024-06-14']);

		renderJumpToDate();

		expect(popoverProps()?.markedDates).toEqual(['2024-06-12', '2024-06-14']);
	});

	it('moves the calendar to the picked date', () => {
		renderJumpToDate();

		popoverProps()?.onChange('2024-07-20');

		expect(mockNavigateToDate).toHaveBeenCalledTimes(1);
		expect(mockNavigateToDate.mock.calls[0]?.[0].toISODate()).toBe(
			'2024-07-20',
		);
	});
});
