import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WeekView } from './WeekView';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';
import { getWeekDates } from '../_utils/getWeekDates';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../_utils/getWeekDates', () => ({
	getWeekDates: vi.fn(),
}));

function NextWeekButton() {
	const { goToNext } = useCalendarContext();
	return <button onClick={goToNext}>Next</button>;
}

describe('WeekView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	afterEach(() => vi.useRealTimers());

	it('renders 7 day columns', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		expect(screen.getAllByTestId('week-day-column')).toHaveLength(7);
	});

	it('renders correct day header labels', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		expect(screen.getByText('Sun 9/15')).toBeDefined();
		expect(screen.getByText('Mon 9/16')).toBeDefined();
		expect(screen.getByText('Tue 9/17')).toBeDefined();
		expect(screen.getByText('Wed 9/18')).toBeDefined();
		expect(screen.getByText('Thu 9/19')).toBeDefined();
		expect(screen.getByText('Fri 9/20')).toBeDefined();
		expect(screen.getByText('Sat 9/21')).toBeDefined();
	});

	it('highlights today with an ember badge', () => {
		const today = DateTime.local(2024, 9, 18);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={today} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		const todayBadge = screen.getByTestId('week-day-today');
		expect(todayBadge).toBeDefined();
		expect(todayBadge.getAttribute('data-color')).toBe('ember');
		expect(todayBadge.textContent).toBe('Wed 9/18');

		vi.useRealTimers();
	});

	it('updates the week when selectedDate changes', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates)
			.mockReturnValueOnce([
				DateTime.local(2024, 9, 15),
				DateTime.local(2024, 9, 16),
				DateTime.local(2024, 9, 17),
				DateTime.local(2024, 9, 18),
				DateTime.local(2024, 9, 19),
				DateTime.local(2024, 9, 20),
				DateTime.local(2024, 9, 21),
			])
			.mockReturnValueOnce([
				DateTime.local(2024, 9, 22),
				DateTime.local(2024, 9, 23),
				DateTime.local(2024, 9, 24),
				DateTime.local(2024, 9, 25),
				DateTime.local(2024, 9, 26),
				DateTime.local(2024, 9, 27),
				DateTime.local(2024, 9, 28),
			]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
				<NextWeekButton />
			</CalendarProvider>,
		);

		expect(screen.getByText('Sun 9/15')).toBeDefined();
		expect(getWeekDates).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Next'));

		expect(screen.getByText('Sun 9/22')).toBeDefined();
		expect(getWeekDates).toHaveBeenCalledTimes(2);
	});
});
