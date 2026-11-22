import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { DateTime } from 'luxon';

import { useCanWrite } from '@/app/[planner]/_components';

import { DayRow } from './DayRow';

import type { CalendarDish, CalendarMeal } from '../../Calendar';
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

vi.mock('./MealCardWithDragHandle', () => ({
	MealCardWithDragHandle: vi.fn(
		({
			meal,
			renderDish,
		}: {
			meal: CalendarMeal;
			renderDish?: (dish: CalendarDish) => ReactNode;
		}) => (
			<div
				data-testid="meal-card"
				data-meal-id={meal.id}
				data-render-dish={renderDish ? 'provided' : 'omitted'}
			/>
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

function createMeal(id: string): CalendarMeal {
	return {
		id,
		date: '2024-06-15',
		name: `Meal ${id}`,
		borderColor: 'red',
		dishes: [],
	};
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

	it('marks the day number as today when date is today', () => {
		const date = DateTime.local(2024, 6, 15);

		render(<DayRow date={date} today={date} />);

		expect(screen.getByText('15').getAttribute('aria-current')).toBe('date');
	});

	it('does not mark the day number as today for other days', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.getByText('15').getAttribute('aria-current')).toBeNull();
	});

	it('has data-iso with the correct ISO date', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		const { container } = render(<DayRow date={date} today={today} />);

		expect(container.querySelector('[data-iso="2024-06-15"]')).not.toBeNull();
	});

	it('renders MealCardWithDragHandles when meals are provided', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const meals = [createMeal('meal-1'), createMeal('meal-2')];

		render(<DayRow date={date} today={today} meals={meals} />);

		const cards = screen.getAllByTestId('meal-card');
		expect(cards).toHaveLength(2);
		expect(cards[0].getAttribute('data-meal-id')).toBe('meal-1');
		expect(cards[1].getAttribute('data-meal-id')).toBe('meal-2');
	});

	it('does not render MealCards when no meals are provided', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.queryByTestId('meal-card')).toBeNull();
	});

	it('passes renderDish to MealCardWithDragHandle when provided', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const meals = [createMeal('meal-1'), createMeal('meal-2')];
		const renderDish = (dish: CalendarDish) => <span>{dish.name}</span>;

		render(
			<DayRow
				date={date}
				today={today}
				meals={meals}
				renderDish={renderDish}
			/>,
		);

		const cards = screen.getAllByTestId('meal-card');
		expect(cards).toHaveLength(2);
		expect(cards[0].getAttribute('data-render-dish')).toBe('provided');
		expect(cards[1].getAttribute('data-render-dish')).toBe('provided');
	});

	it('does not pass renderDish to MealCardWithDragHandle when omitted', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const meals = [createMeal('meal-1')];

		render(<DayRow date={date} today={today} meals={meals} />);

		expect(
			screen.getByTestId('meal-card').getAttribute('data-render-dish'),
		).toBe('omitted');
	});

	describe('add meal triggers', () => {
		it('calls open with add_meal and the ISO date when the gutter trigger is clicked', () => {
			const date = DateTime.local(2024, 6, 15);
			const today = DateTime.local(2024, 6, 10);

			render(<DayRow date={date} today={today} />);

			screen.getByTestId('gutter-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: '2024-06-15',
			});
		});

		it('falls back to undefined when the date has no ISO representation', () => {
			const date = DateTime.local(2024, 6, 15);
			vi.spyOn(date, 'toISODate').mockReturnValue(null);
			const today = DateTime.local(2024, 6, 10);

			render(<DayRow date={date} today={today} />);

			screen.getByTestId('gutter-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: undefined,
			});
		});

		it('calls open with add_meal and the ISO date when the ghost trigger is clicked', () => {
			const date = DateTime.local(2024, 6, 15);
			const today = DateTime.local(2024, 6, 10);

			render(<DayRow date={date} today={today} />);

			screen.getByTestId('ghost-trigger').click();

			expect(open).toHaveBeenCalledWith('add_meal', {
				initialDate: '2024-06-15',
			});
		});

		it('renders both triggers when user has write access and there are no meals', () => {
			const date = DateTime.local(2024, 6, 15);
			const today = DateTime.local(2024, 6, 10);

			render(<DayRow date={date} today={today} />);

			expect(screen.getByTestId('gutter-trigger')).toBeDefined();
			expect(screen.getByTestId('ghost-trigger')).toBeDefined();
		});

		it('does not render add affordances when user has read-only access', () => {
			vi.mocked(useCanWrite).mockReturnValue(false);

			const date = DateTime.local(2024, 6, 15);
			const today = DateTime.local(2024, 6, 10);

			render(<DayRow date={date} today={today} />);

			expect(screen.queryByText('Add meal')).toBeNull();
			expect(screen.queryByRole('button')).toBeNull();
		});

		it('does not render the ghost trigger when meals are provided', () => {
			const date = DateTime.local(2024, 6, 15);
			const today = DateTime.local(2024, 6, 10);
			const meals = [createMeal('meal-1')];

			render(<DayRow date={date} today={today} meals={meals} />);

			expect(screen.getByTestId('meal-card')).toBeDefined();
			expect(screen.queryByTestId('ghost-trigger')).toBeNull();
		});
	});
});
