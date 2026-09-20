import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonthGrid } from './MonthGrid';
import type { MonthGridMeal, MonthGridMealRenderProps } from './MonthGrid';

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

	it('starts the grid on Sunday', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 2, 25),
			DateTime.local(2024, 2, 26),
			DateTime.local(2024, 2, 27),
			DateTime.local(2024, 2, 28),
			DateTime.local(2024, 2, 29),
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
		]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(getMonthGridDates).toHaveBeenCalledWith(initialDate);
		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells.length).toBeGreaterThan(0);
		expect(dayCells[0].textContent).toBe('25');
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
		expect(badge?.getAttribute('data-color')).toBe('ember');
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

	it('renders meals in the correct day cell', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Meal A' },
		];

		const renderMeal = vi.fn(
			(meal: MonthGridMeal, props: MonthGridMealRenderProps) => (
				<span key={meal.id} tabIndex={props.tabIndex} ref={props.ref}>
					{meal.title} custom
				</span>
			),
		);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		expect(renderMeal).toHaveBeenCalledWith(
			meals[0],
			expect.objectContaining({ tabIndex: expect.any(Number) }),
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[1].textContent).toContain('Meal A custom');
		expect(dayCells[0].textContent).not.toContain('Meal A custom');
		expect(dayCells[2].textContent).not.toContain('Meal A custom');
	});

	it('limits visible meals to 2 and shows +N more', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Meal A' },
			{ id: '2', date: '2024-03-15', title: 'Meal B' },
			{ id: '3', date: '2024-03-15', title: 'Meal C' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid meals={meals} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toContain('Meal A');
		expect(dayCells[0].textContent).toContain('Meal B');
		expect(dayCells[0].textContent).not.toContain('Meal C');
		expect(dayCells[0].textContent).toContain('+1 more');
	});

	it('does not show +N more when meals are 2 or fewer', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Meal A' },
			{ id: '2', date: '2024-03-15', title: 'Meal B' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid meals={meals} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].textContent).toContain('Meal A');
		expect(dayCells[0].textContent).toContain('Meal B');
		expect(dayCells[0].textContent).not.toContain('more');
	});

	it('adds aria-label with meal count to day cells with meals', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Meal A' },
			{ id: '2', date: '2024-03-15', title: 'Meal B' },
		];

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid meals={meals} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].getAttribute('aria-label')).toBeNull();
		expect(dayCells[1].getAttribute('aria-label')).toBe('March 15, 2 meals');
	});

	it('does not break when meals prop is undefined', () => {
		const initialDate = DateTime.local(2024, 3, 15);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 15)]);

		render(
			<CalendarProvider initialDate={initialDate}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells.length).toBe(1);
		expect(dayCells[0].textContent).toBe('15');
	});
});

describe('MonthGrid keyboard navigation', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function createRenderMealMock() {
		return vi.fn(
			(
				meal: MonthGridMeal,
				props: { tabIndex: number; ref: React.RefCallback<HTMLElement> },
			) => (
				<div
					key={meal.id}
					data-testid={`meal-${meal.id}`}
					tabIndex={props.tabIndex}
					ref={props.ref}
				>
					{meal.title}
				</div>
			),
		);
	}

	it('sets tabIndex=0 on today and -1 on other days initially', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		expect(dayCells[0].getAttribute('tabindex')).toBe('-1');
		expect(dayCells[1].getAttribute('tabindex')).toBe('0');
		expect(dayCells[2].getAttribute('tabindex')).toBe('-1');
	});

	it('moves focus to next day with ArrowRight', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'ArrowRight' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		expect(dayCells[2].getAttribute('tabindex')).toBe('0');
	});

	it('calls onMealClick when Enter pressed on single-meal day', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
		];

		const onMealClick = vi.fn();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid meals={meals} onMealClick={onMealClick} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		expect(onMealClick).toHaveBeenCalledWith(meals[0]);
	});

	it('enters meal mode when Enter pressed on multi-meal day', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderMeal = createRenderMealMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		const meal1 = screen.getByTestId('meal-1');
		const meal2 = screen.getByTestId('meal-2');
		expect(meal1.getAttribute('tabindex')).toBe('0');
		expect(meal2.getAttribute('tabindex')).toBe('-1');
	});

	it('navigates meals with ArrowDown/ArrowUp in meal mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderMeal = createRenderMealMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const meal1 = screen.getByTestId('meal-1');
		const meal2 = screen.getByTestId('meal-2');

		fireEvent.keyDown(meal1, { key: 'ArrowDown' });
		expect(meal1.getAttribute('tabindex')).toBe('-1');
		expect(meal2.getAttribute('tabindex')).toBe('0');

		fireEvent.keyDown(meal2, { key: 'ArrowUp' });
		expect(meal1.getAttribute('tabindex')).toBe('0');
		expect(meal2.getAttribute('tabindex')).toBe('-1');
	});

	it('meal click does not exit meal mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderMeal = createRenderMealMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const meal1 = screen.getByTestId('meal-1');
		fireEvent.click(meal1);

		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		expect(meal1.getAttribute('tabindex')).toBe('0');
		expect(screen.getByTestId('meal-2').getAttribute('tabindex')).toBe('-1');
	});

	it('exits meal mode and returns focus to day cell on Escape', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', title: 'Event A' },
			{ id: '2', date: '2024-03-15', title: 'Event B' },
		];

		const renderMeal = createRenderMealMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid meals={meals} renderMeal={renderMeal} />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const meal1 = screen.getByTestId('meal-1');
		fireEvent.keyDown(meal1, { key: 'Escape' });

		expect(dayCells[1].getAttribute('tabindex')).toBe('0');
		expect(meal1.getAttribute('tabindex')).toBe('-1');
		expect(screen.getByTestId('meal-2').getAttribute('tabindex')).toBe('-1');
	});
});
