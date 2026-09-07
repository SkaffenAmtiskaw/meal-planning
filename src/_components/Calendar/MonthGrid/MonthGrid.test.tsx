import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonthGrid } from './MonthGrid';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('../_utils/getMonthGridDates', () => ({
	getMonthGridDates: vi.fn(),
}));

import { getMonthGridDates } from '../_utils/getMonthGridDates';

function NextMonthButton() {
	const { goToNext } = useCalendarContext();
	return <button onClick={goToNext}>Next</button>;
}

describe('MonthGrid', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts the grid on Monday', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
		]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(getMonthGridDates).toHaveBeenCalledWith(initialDate);
		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells.length).toBeGreaterThan(0);
		expect(dayCells[0].textContent).toBe('26');
	});

	it('highlights today with an ember badge', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
			DateTime.local(2024, 3, 4),
			DateTime.local(2024, 3, 5),
			DateTime.local(2024, 3, 6),
			DateTime.local(2024, 3, 7),
			DateTime.local(2024, 3, 8),
			DateTime.local(2024, 3, 9),
			DateTime.local(2024, 3, 10),
			DateTime.local(2024, 3, 11),
			DateTime.local(2024, 3, 12),
			DateTime.local(2024, 3, 13),
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(getMonthGridDates).toHaveBeenCalledWith(today);
		const dayText = screen.getByText('15');
		const badge = dayText.closest('[data-testid="badge"]');
		expect(badge).not.toBeNull();
		expect(badge!.getAttribute('data-color')).toBe('ember');
	});

	it('dims overflow days from adjacent months', () => {
		vi.useFakeTimers();
		vi.setSystemTime(DateTime.local(2024, 6, 15, 12, 0, 0).toJSDate());

		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
		]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');

		expect(dayCells[0].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[1].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[2].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[3].querySelector('p')?.getAttribute('data-c')).toBe(
			'gray.5',
		);
		expect(dayCells[4].querySelector('p')?.getAttribute('data-c')).not.toBe(
			'gray.5',
		);
	});

	it('updates the grid when selectedDate changes', () => {
		vi.mocked(getMonthGridDates)
			.mockReturnValueOnce([
				DateTime.local(2024, 2, 26),
				DateTime.local(2024, 2, 27),
				DateTime.local(2024, 2, 28),
			])
			.mockReturnValueOnce([
				DateTime.local(2024, 4, 1),
				DateTime.local(2024, 4, 2),
				DateTime.local(2024, 4, 3),
			]);

		render(
			<CalendarProvider initialDate={DateTime.local(2024, 3, 15)}>
				<MonthGrid />
				<NextMonthButton />
			</CalendarProvider>,
		);

		let dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toBe('26');
		expect(getMonthGridDates).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Next'));

		dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toBe('1');
		expect(getMonthGridDates).toHaveBeenCalledTimes(2);
	});
});
