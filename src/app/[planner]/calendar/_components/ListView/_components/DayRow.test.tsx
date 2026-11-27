import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { DateTime } from 'luxon';

import { useCanWrite } from '@/app/[planner]/_components';

import { DayRow } from './DayRow';

import { useDayMeals } from '../../../_hooks/useCalendarMeals';
import type { CalendarMeal } from '../../Calendar';
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

vi.mock(
	'../../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

vi.mock('./MealCardWithDragHandle', () => ({
	MealCardWithDragHandle: vi.fn(({ meal }: { meal: CalendarMeal }) => (
		<div data-testid="meal-card" data-meal-id={meal.id} />
	)),
}));

vi.mock('./ListDayGutter', () => ({
	ListDayGutter: vi.fn(
		({
			isToday,
			addMealButton,
		}: {
			isToday: boolean;
			addMealButton?: ReactNode;
		}) => (
			<div data-testid="day-gutter" data-today={String(isToday)}>
				{addMealButton}
			</div>
		),
	),
}));

vi.mock('./AddMealGutterButton', () => ({
	AddMealGutterButton: vi.fn(({ onClick }) => (
		<button type="button" data-testid="gutter-trigger" onClick={onClick} />
	)),
}));

vi.mock('./AddMealRow', () => ({
	AddMealRow: vi.fn(({ onClick }) => (
		<button type="button" data-testid="ghost-trigger" onClick={onClick}>
			Add meal
		</button>
	)),
}));

const open = vi.fn();
const date = DateTime.local(2024, 6, 15);
const otherDay = DateTime.local(2024, 6, 10);

function createMeal(id: string): CalendarMeal {
	return {
		id,
		date: '2024-06-15',
		name: `Meal ${id}`,
		borderColor: 'red',
		dishes: [],
	};
}

function renderRow(today: DateTime = otherDay, rowDate: DateTime = date) {
	return render(<DayRow date={rowDate} today={today} plannerId="planner-1" />);
}

describe('DayRow', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarModal).mockReturnValue({
			state: { type: null, data: null },
			open,
			close: vi.fn(),
		});
	});

	it('tells the gutter the day is today when date is today', () => {
		renderRow(date);

		expect(screen.getByTestId('day-gutter').getAttribute('data-today')).toBe(
			'true',
		);
	});

	it('tells the gutter the day is not today for other days', () => {
		renderRow();

		expect(screen.getByTestId('day-gutter').getAttribute('data-today')).toBe(
			'false',
		);
	});

	it("reads its own day's meals", () => {
		renderRow();

		expect(useDayMeals).toHaveBeenCalledWith(date);
	});

	it("renders a card for each of the day's meals", () => {
		vi.mocked(useDayMeals).mockReturnValue([
			createMeal('meal-1'),
			createMeal('meal-2'),
		]);

		renderRow();

		const cards = screen.getAllByTestId('meal-card');
		expect(cards.map((card) => card.getAttribute('data-meal-id'))).toEqual([
			'meal-1',
			'meal-2',
		]);
	});

	it('renders no cards for a day with no meals', () => {
		renderRow();

		expect(screen.queryByTestId('meal-card')).toBeNull();
	});

	describe('add meal triggers', () => {
		it('calls open with add_meal and the ISO date when the gutter trigger is clicked', () => {
			renderRow();

			screen.getByTestId('gutter-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: '2024-06-15',
			});
		});

		it('falls back to undefined when the date has no ISO representation', () => {
			const noIsoDate = DateTime.local(2024, 6, 15);
			vi.spyOn(noIsoDate, 'toISODate').mockReturnValue(null);

			renderRow(otherDay, noIsoDate);

			screen.getByTestId('gutter-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: undefined,
			});
		});

		it('calls open with add_meal and the ISO date when the ghost trigger is clicked', () => {
			renderRow();

			screen.getByTestId('ghost-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: '2024-06-15',
			});
		});

		it('renders both triggers when user has write access and there are no meals', () => {
			renderRow();

			expect(screen.getByTestId('gutter-trigger')).toBeDefined();
			expect(screen.getByTestId('ghost-trigger')).toBeDefined();
		});

		it('does not render add affordances when user has read-only access', () => {
			vi.mocked(useCanWrite).mockReturnValue(false);

			renderRow();

			expect(screen.queryByText('Add meal')).toBeNull();
			expect(screen.queryByRole('button')).toBeNull();
		});

		it('does not render the ghost trigger when the day has meals', () => {
			vi.mocked(useDayMeals).mockReturnValue([createMeal('meal-1')]);

			renderRow();

			expect(screen.getByTestId('meal-card')).toBeDefined();
			expect(screen.queryByTestId('ghost-trigger')).toBeNull();
		});
	});
});
