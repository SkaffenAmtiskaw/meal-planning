import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { DatePickerGrid } from '@/_components';

import { JumpToDate } from './JumpToDate';

import { useCalendarContext } from '../Calendar/CalendarContext';
import type { CalendarContextValue } from '../Calendar/types';

vi.mock('@/_components', () => ({
	AdaptivePopover: vi.fn(
		({
			opened,
			onClose,
			target,
			children,
		}: {
			opened: boolean;
			onClose: () => void;
			target: React.ReactNode;
			children: React.ReactNode;
		}) => (
			<>
				{target}
				{opened && (
					<div>
						<button type="button" onClick={onClose}>
							Dismiss
						</button>
						{children}
					</div>
				)}
			</>
		),
	),
	DatePickerGrid: vi.fn(
		({
			value,
			onChange,
		}: {
			value: string | null;
			onChange: (date: string) => void;
		}) => (
			<input
				type="date"
				data-testid="date-picker-grid"
				value={value ?? ''}
				onChange={(event) => onChange(event.target.value)}
			/>
		),
	),
}));

vi.mock('../Calendar/CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

const mockNavigateToDate = vi.fn();

function renderJumpToDate() {
	vi.mocked(useCalendarContext).mockReturnValue({
		selectedDate: DateTime.local(2024, 6, 15),
		navigateToDate: mockNavigateToDate,
	} as unknown as CalendarContextValue);

	return render(
		<JumpToDate
			renderTrigger={({ opened, onClick }) => (
				<button type="button" data-opened={String(opened)} onClick={onClick}>
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

	it('opens the picker when the trigger is clicked', () => {
		renderJumpToDate();

		expect(screen.queryByTestId('date-picker-grid')).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

		expect(screen.getByTestId('date-picker-grid')).toBeDefined();
		expect(
			screen.getByRole('button', { name: 'Jump' }).getAttribute('data-opened'),
		).toBe('true');
	});

	it('closes the picker when the trigger is clicked again', () => {
		renderJumpToDate();

		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));
		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

		expect(screen.queryByTestId('date-picker-grid')).toBeNull();
	});

	it('closes when the popover or sheet asks to, such as on Esc or a click outside', () => {
		renderJumpToDate();
		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

		fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

		expect(screen.queryByTestId('date-picker-grid')).toBeNull();
	});

	it('selects the date in view', () => {
		renderJumpToDate();
		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

		expect(vi.mocked(DatePickerGrid)).toHaveBeenCalledWith(
			expect.objectContaining({ value: '2024-06-15' }),
			undefined,
		);
	});

	it('moves the calendar to the picked date and closes', () => {
		renderJumpToDate();
		fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

		fireEvent.change(screen.getByTestId('date-picker-grid'), {
			target: { value: '2024-07-20' },
		});

		expect(mockNavigateToDate).toHaveBeenCalledTimes(1);
		expect(mockNavigateToDate.mock.calls[0]?.[0].toISODate()).toBe(
			'2024-07-20',
		);
		expect(screen.queryByTestId('date-picker-grid')).toBeNull();
	});
});
