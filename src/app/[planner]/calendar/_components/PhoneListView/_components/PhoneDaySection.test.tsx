import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { PhoneDayLabel } from './PhoneDayLabel';
import { PhoneDaySection } from './PhoneDaySection';

import { useDayMeals } from '../../../_hooks/useCalendarMeals';
import type { CalendarMeal } from '../../Calendar';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'../../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

vi.mock('../../Calendar/MealCard/MealCard', () => ({
	MealCard: vi.fn(({ meal }: { meal: CalendarMeal }) => (
		<div data-testid="meal-card" data-meal-id={meal.id} />
	)),
}));

vi.mock('./PhoneDayLabel', () => ({
	PhoneDayLabel: vi.fn(() => <span data-testid="day-label" />),
}));

vi.mock('./AddMealForDayButton', () => ({
	AddMealForDayButton: vi.fn(() => <button type="button" />),
}));

const date = DateTime.local(2026, 11, 21);

function createMeal(id: string): CalendarMeal {
	return {
		id,
		date: '2026-11-21',
		name: `Meal ${id}`,
		borderColor: 'red',
		dishes: [],
	};
}

describe('PhoneDaySection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('is labelled with its full date', () => {
		render(<PhoneDaySection date={date} today={date} plannerId="p1" />);

		expect(screen.getByLabelText('Saturday, November 21')).toBeDefined();
	});

	it("shows the day's meals", () => {
		vi.mocked(useDayMeals).mockReturnValueOnce([
			createMeal('a'),
			createMeal('b'),
		]);

		render(<PhoneDaySection date={date} today={date} plannerId="p1" />);

		expect(
			screen
				.getAllByTestId('meal-card')
				.map((card) => card.getAttribute('data-meal-id')),
		).toEqual(['a', 'b']);
		expect(screen.queryByText('No meals planned')).toBeNull();
	});

	it('says so when the day has no meals', () => {
		render(<PhoneDaySection date={date} today={date} plannerId="p1" />);

		expect(screen.getByText('No meals planned')).toBeDefined();
		expect(screen.queryByTestId('meal-card')).toBeNull();
	});

	it('marks the label as today on today', () => {
		render(<PhoneDaySection date={date} today={date} plannerId="p1" />);

		expect(vi.mocked(PhoneDayLabel).mock.lastCall?.[0].isToday).toBe(true);
	});

	it('does not mark any other day as today', () => {
		render(
			<PhoneDaySection
				date={date}
				today={date.plus({ days: 1 })}
				plannerId="p1"
			/>,
		);

		expect(vi.mocked(PhoneDayLabel).mock.lastCall?.[0].isToday).toBe(false);
	});
});
