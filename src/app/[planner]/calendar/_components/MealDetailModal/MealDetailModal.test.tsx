import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MealDetailModal } from './MealDetailModal';
import { MealDetails } from './MealDetails';

import type { CalendarMeal } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('./MealDetails', () => ({
	MealDetails: vi.fn(() => <div data-testid="meal-details" />),
}));
vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

const baseMeal: CalendarMeal = {
	id: 'meal-1',
	date: '2024-01-01',
	name: 'Breakfast',
	borderColor: '#000',
	dishes: [],
};

const renderModal = (mealId: string | null, close = vi.fn()) =>
	render(
		<MealDetailModal
			data={mealId === null ? null : { mealId }}
			close={close}
			plannerId="p-1"
		/>,
	);

describe('MealDetailModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useCalendarMeals).mockReturnValue([baseMeal]);
	});

	test('is not visible while it has no data', () => {
		renderModal(null);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test("finds the meal by id in the calendar's meals", () => {
		renderModal('meal-1');

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(vi.mocked(MealDetails).mock.calls[0][0]).toEqual({
			meal: baseMeal,
			plannerId: 'p-1',
		});
	});

	test("renders no modal when the id is not in the calendar's meals", () => {
		renderModal('meal-missing');

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(MealDetails).not.toHaveBeenCalled();
	});

	test('closes through the close it is given', () => {
		const close = vi.fn();
		renderModal('meal-1', close);

		fireEvent.click(screen.getByLabelText('close'));

		expect(close).toHaveBeenCalledTimes(1);
	});

	test('shows the meal title', () => {
		renderModal('meal-1');
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows the description when present', () => {
		vi.mocked(useCalendarMeals).mockReturnValue([
			{ ...baseMeal, description: 'Morning meal' },
		]);
		renderModal('meal-1');
		expect(screen.getByText('Morning meal')).toBeDefined();
	});

	test('does not show description when absent', () => {
		renderModal('meal-1');
		expect(screen.queryByText('Morning meal')).toBeNull();
	});
});
