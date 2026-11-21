import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { DayInterface } from '@/_models/types';

import { MealDetailModal } from './MealDetailModal';
import { MealDetails } from './MealDetails';

import type { CalendarMeal } from '../Calendar';
import { useCalendarDays } from '../../_hooks/useCalendarDays';
import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('./MealDetails', () => ({
	MealDetails: vi.fn(() => <div data-testid="meal-details" />),
}));
vi.mock(
	'../../_hooks/useCalendarDays',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarDays'),
);
vi.mock(
	'../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock(
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
);

const calendar: DayInterface[] = [
	{
		date: '2024-01-01',
		meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
	},
];

const savedItems: SavedItem[] = [{ _id: 'item-1', name: 'Pancakes' }];

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
		vi.mocked(useCalendarDays).mockReturnValue(calendar);
		vi.mocked(usePlannerSavedItems).mockReturnValue(savedItems);
		vi.mocked(toCalendarMeals).mockReturnValue([baseMeal]);
	});

	test('is not visible while it has no data', () => {
		renderModal(null);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('finds the meal by id in the calendar days, with its dishes resolved through the saved items', () => {
		renderModal('meal-1');

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(toCalendarMeals).toHaveBeenCalledWith(calendar, savedItems);
		expect(vi.mocked(MealDetails).mock.calls[0][0]).toEqual({
			meal: baseMeal,
			plannerId: 'p-1',
		});
	});

	test('renders no modal when the id is not in the calendar days', () => {
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
		vi.mocked(toCalendarMeals).mockReturnValue([
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
