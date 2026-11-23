import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { MonthGrid } from './MonthGrid';
import type { MonthGridMeal, MonthGridMealRenderProps } from './types';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock(
	'@/_components',
	async () => await import('#mocks/@/_components/NumberMark'),
);
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

	it('tells only today’s cell that it is today', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

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
		expect(screen.getByTestId('number-mark-15').getAttribute('data-ring')).toBe(
			'true',
		);
		expect(screen.getByTestId('number-mark-14').getAttribute('data-ring')).toBe(
			'false',
		);
	});

	it('tells no cell that it is today while the day is unknown', () => {
		const utcDay = DateTime.local(2024, 3, 2);
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(utcDay));
		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 1),
			DateTime.local(2024, 3, 2),
			DateTime.local(2024, 3, 3),
		]);

		render(
			<CalendarProvider initialDate={utcDay}>
				<MonthGrid />
			</CalendarProvider>,
		);

		for (const day of ['1', '2', '3']) {
			expect(
				screen.getByTestId(`number-mark-${day}`).getAttribute('data-ring'),
			).toBe('false');
		}
	});

	it('shows the days as a skeleton while today’s month is unknown', () => {
		// March 1, the first of its month.
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.local(2024, 3, 1)),
		);
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 1)]);

		render(
			<CalendarProvider initialDate={DateTime.local(2024, 3, 1)}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(screen.getByTestId('skeleton').getAttribute('data-visible')).toBe(
			'true',
		);
	});

	it('draws the days while today’s month is known', () => {
		vi.mocked(getMonthGridDates).mockReturnValue([DateTime.local(2024, 3, 1)]);

		render(
			<CalendarProvider initialDate={DateTime.local(2024, 3, 1)}>
				<MonthGrid />
			</CalendarProvider>,
		);

		expect(screen.getByTestId('skeleton').getAttribute('data-visible')).toBe(
			'false',
		);
	});

	it('tells days from adjacent months that they are outside the month', () => {
		const today = DateTime.local(2024, 6, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

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

		for (const day of ['26', '27', '28', '29']) {
			expect(
				screen.getByTestId(`number-mark-${day}`).getAttribute('data-muted'),
			).toBe('true');
		}
		expect(screen.getByTestId('number-mark-1').getAttribute('data-muted')).toBe(
			'false',
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
			{ id: '1', date: '2024-03-15', name: 'Meal A' },
		];

		const renderMeal = vi.fn(
			(meal: MonthGridMeal, props: MonthGridMealRenderProps) => (
				<span key={meal.id} tabIndex={props.tabIndex} ref={props.ref}>
					{meal.name} custom
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
					{meal.name}
				</div>
			),
		);
	}

	it('sets tabIndex=0 on today and -1 on other days initially', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
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
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
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

	it('moves focus to the previous day with ArrowLeft', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

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
		fireEvent.keyDown(dayCells[1], { key: 'ArrowLeft' });

		expect(dayCells[0].getAttribute('tabindex')).toBe('0');
		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
	});

	it('moves focus down one week with ArrowDown', () => {
		const today = DateTime.local(2024, 3, 8);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue(
			Array.from({ length: 14 }, (_, i) => DateTime.local(2024, 3, 1 + i)),
		);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[0], { key: 'ArrowDown' });

		expect(dayCells[0].getAttribute('tabindex')).toBe('-1');
		expect(dayCells[7].getAttribute('tabindex')).toBe('0');
	});

	it('moves focus up one week with ArrowUp', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue(
			Array.from({ length: 14 }, (_, i) => DateTime.local(2024, 3, 1 + i)),
		);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[7], { key: 'ArrowUp' });

		expect(dayCells[0].getAttribute('tabindex')).toBe('0');
		expect(dayCells[7].getAttribute('tabindex')).toBe('-1');
	});

	it('does not move focus right from the last column', () => {
		const today = DateTime.local(2024, 3, 16);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue(
			Array.from({ length: 7 }, (_, i) => DateTime.local(2024, 3, 10 + i)),
		);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[6], { key: 'ArrowRight' });

		expect(dayCells[6].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus down from the last row', () => {
		const today = DateTime.local(2024, 3, 7);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue(
			Array.from({ length: 7 }, (_, i) => DateTime.local(2024, 3, 1 + i)),
		);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[6], { key: 'ArrowDown' });

		expect(dayCells[6].getAttribute('tabindex')).toBe('0');
	});

	it('does not move focus up from the first row', () => {
		const today = DateTime.local(2024, 3, 1);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue(
			Array.from({ length: 14 }, (_, i) => DateTime.local(2024, 3, 1 + i)),
		);

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid />
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[0], { key: 'ArrowUp' });

		expect(dayCells[0].getAttribute('tabindex')).toBe('0');
	});

	it('moves focus to the clicked day cell and exits meal mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
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
		expect(meal1.getAttribute('tabindex')).toBe('0');
		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');

		fireEvent.click(dayCells[2]);

		expect(dayCells[2].getAttribute('tabindex')).toBe('0');
		expect(dayCells[1].getAttribute('tabindex')).toBe('-1');
		expect(meal1.getAttribute('tabindex')).toBe('-1');
	});

	it('calls onMealClick when Enter is pressed on a meal in meal mode', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([
			DateTime.local(2024, 3, 14),
			DateTime.local(2024, 3, 15),
			DateTime.local(2024, 3, 16),
		]);

		const meals: MonthGridMeal[] = [
			{ id: '1', date: '2024-03-15', name: 'MealA' },
			{ id: '2', date: '2024-03-15', name: 'MealB' },
		];

		const onMealClick = vi.fn();
		const renderMeal = createRenderMealMock();

		render(
			<CalendarProvider initialDate={today}>
				<MonthGrid
					meals={meals}
					onMealClick={onMealClick}
					renderMeal={renderMeal}
				/>
			</CalendarProvider>,
		);

		const dayCells = screen.getAllByTestId('day-cell');
		fireEvent.keyDown(dayCells[1], { key: 'Enter' });

		const meal1 = screen.getByTestId('meal-1');
		fireEvent.keyDown(meal1, { key: 'Enter' });

		expect(onMealClick).toHaveBeenCalledWith(meals[0]);
	});

	it('throws when days array is empty', () => {
		const today = DateTime.local(2024, 3, 15);
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		vi.mocked(getMonthGridDates).mockReturnValue([]);

		expect(() =>
			render(
				<CalendarProvider initialDate={DateTime.local(2024, 3, 15)}>
					<MonthGrid />
				</CalendarProvider>,
			),
		).toThrow('days array cannot be empty');
	});
});
