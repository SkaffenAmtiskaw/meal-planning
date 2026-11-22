import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { WeekView } from './WeekView';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';
import { getWeekDates } from '../_utils/getWeekDates';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('./WeekDayLabel', () => ({
	WeekDayLabel: ({ label, isToday }: { label: string; isToday: boolean }) => (
		<span data-testid="week-day-label" data-today={String(isToday)}>
			{label}
		</span>
	),
}));

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

	it("marks today's column as the current date", () => {
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

		const columns = screen.getAllByTestId('week-day-column');
		const labels = screen.getAllByTestId('week-day-label');
		expect(columns[3].getAttribute('aria-current')).toBe('date');
		expect(labels[3].getAttribute('data-today')).toBe('true');
		for (const index of [0, 1, 2, 4, 5, 6]) {
			expect(columns[index].getAttribute('aria-current')).toBeNull();
			expect(labels[index].getAttribute('data-today')).toBe('false');
		}
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

	it('groups meals by date and renders them in the correct day column', () => {
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

		const meals = [
			{ id: '1', date: '2024-09-16', name: 'Monday Meal' },
			{ id: '2', date: '2024-09-18', name: 'Wednesday Meal' },
			{ id: '3', date: '2024-09-18', name: 'Another Wednesday Meal' },
		];

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView meals={meals} />
			</CalendarProvider>,
		);

		const columns = screen.getAllByTestId('week-day-column');
		expect(within(columns[1]).getByText('Monday Meal')).toBeDefined();
		expect(within(columns[3]).getByText('Wednesday Meal')).toBeDefined();
		expect(
			within(columns[3]).getByText('Another Wednesday Meal'),
		).toBeDefined();
		expect(within(columns[0]).queryByTestId('week-meal')).toBeNull();
		expect(within(columns[2]).queryByTestId('week-meal')).toBeNull();
		expect(within(columns[4]).queryByTestId('week-meal')).toBeNull();
		expect(within(columns[5]).queryByTestId('week-meal')).toBeNull();
		expect(within(columns[6]).queryByTestId('week-meal')).toBeNull();
	});

	it('uses renderMeal when provided', () => {
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

		const meals = [{ id: '1', date: '2024-09-18', name: 'Custom Meal' }];
		const renderMeal = vi.fn((meal, props) => (
			<div data-testid="custom-meal" data-tab-index={props.tabIndex}>
				{meal.name}
			</div>
		));

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		expect(screen.getByTestId('custom-meal')).toBeDefined();
		expect(renderMeal).toHaveBeenCalledWith(
			meals[0],
			expect.objectContaining({
				tabIndex: expect.any(Number),
				ref: expect.any(Function),
			}),
		);
	});

	it('calls onMealClick when a default meal is clicked', () => {
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

		const meal = { id: '1', date: '2024-09-18', name: 'Clickable Meal' };
		const onMealClick = vi.fn();

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView meals={[meal]} onMealClick={onMealClick} />
			</CalendarProvider>,
		);

		fireEvent.click(screen.getByTestId('week-meal'));
		expect(onMealClick).toHaveBeenCalledWith(meal);
	});

	it('renders default meals with button role', () => {
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
				<WeekView meals={[{ id: '1', date: '2024-09-18', name: 'Meal' }]} />
			</CalendarProvider>,
		);

		expect(screen.getByRole('button', { name: 'Meal' })).toBeDefined();
	});

	it('renders nothing for days without meals', () => {
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
				<WeekView meals={[]} />
			</CalendarProvider>,
		);

		expect(screen.queryAllByTestId('week-meal')).toHaveLength(0);
	});
});
