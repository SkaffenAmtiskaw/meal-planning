import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DayRow } from './DayRow';

import type { CalendarDish } from '../../_components/DishListItem/DishListItem';
import type { CalendarMeal } from '../../_types/CalendarMeal.types';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./MealCardWithDragHandle', () => ({
	MealCardWithDragHandle: vi.fn(
		({
			event,
			renderDish,
		}: {
			event: CalendarMeal;
			renderDish?: (dish: CalendarDish) => ReactNode;
		}) => (
			<div
				data-testid="meal-card"
				data-event-id={event.id}
				data-render-dish={renderDish ? 'provided' : 'omitted'}
			/>
		),
	),
}));

vi.mock('./ListViewAddMealTrigger', () => ({
	ListViewAddMealTrigger: vi.fn(({ variant, onClick }) => (
		<button type="button" data-testid={`${variant}-trigger`} onClick={onClick}>
			{variant}
		</button>
	)),
}));

vi.mock('./DayRow.module.css', () => ({
	default: {
		row: 'row',
		gutter: 'gutter',
		gutterContent: 'gutterContent',
		gutterText: 'gutterText',
		dateLine: 'dateLine',
	},
}));

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
	});

	it('renders the day number for a non-today day', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.getByText('15')).toBeDefined();
	});

	it('renders the ember badge content for today', () => {
		const date = DateTime.local(2024, 6, 15);

		render(<DayRow date={date} today={date} />);

		expect(screen.getByTestId('badge').textContent).toBe('15');
	});

	it('shows the month abbreviation on the first of the month', () => {
		const date = DateTime.local(2024, 6, 1);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.getByText('JUN')).toBeDefined();
	});

	it('does not show the month abbreviation on other days', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.queryByText('JUN')).toBeNull();
	});

	it('has data-iso with the correct ISO date', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		const { container } = render(<DayRow date={date} today={today} />);

		expect(container.querySelector('[data-iso="2024-06-15"]')).not.toBeNull();
	});

	it('applies the today-row tint when date is today', () => {
		const date = DateTime.local(2024, 6, 15);

		const { container } = render(<DayRow date={date} today={date} />);

		expect((container.firstChild as HTMLElement)?.style.backgroundColor).toBe(
			'rgba(var(--mantine-color-ember-0), 0.5)',
		);
	});

	it('does not apply the today-row tint for other days', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		const { container } = render(<DayRow date={date} today={today} />);

		expect((container.firstChild as HTMLElement)?.style.backgroundColor).toBe(
			'',
		);
	});

	it('calls onAddMeal with date when the gutter trigger is clicked', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const onAddMeal = vi.fn();

		render(<DayRow date={date} today={today} onAddMeal={onAddMeal} />);

		screen.getByTestId('gutter-trigger').click();

		expect(onAddMeal).toHaveBeenCalledWith(date);
	});

	it('calls onAddMeal with date when the ghost trigger is clicked', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const onAddMeal = vi.fn();

		render(<DayRow date={date} today={today} onAddMeal={onAddMeal} />);

		screen.getByTestId('ghost-trigger').click();

		expect(onAddMeal).toHaveBeenCalledWith(date);
	});

	it('renders the gutter trigger and ghost trigger when onAddMeal is provided and there are no meals', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} onAddMeal={vi.fn()} />);

		expect(screen.getByTestId('gutter-trigger')).toBeDefined();
		expect(screen.getByTestId('ghost-trigger')).toBeDefined();
	});

	it('does not render add affordances when onAddMeal is omitted', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);

		render(<DayRow date={date} today={today} />);

		expect(screen.queryByText('Add meal')).toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('renders MealCardWithDragHandles when meals are provided', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const meals = [createMeal('meal-1'), createMeal('meal-2')];

		render(<DayRow date={date} today={today} meals={meals} />);

		const cards = screen.getAllByTestId('meal-card');
		expect(cards).toHaveLength(2);
		expect(cards[0].getAttribute('data-event-id')).toBe('meal-1');
		expect(cards[1].getAttribute('data-event-id')).toBe('meal-2');
	});

	it('does not render the ghost trigger when meals are provided', () => {
		const date = DateTime.local(2024, 6, 15);
		const today = DateTime.local(2024, 6, 10);
		const meals = [createMeal('meal-1')];

		render(
			<DayRow date={date} today={today} meals={meals} onAddMeal={vi.fn()} />,
		);

		expect(screen.getByTestId('meal-card')).toBeDefined();
		expect(screen.queryByTestId('ghost-trigger')).toBeNull();
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
});
