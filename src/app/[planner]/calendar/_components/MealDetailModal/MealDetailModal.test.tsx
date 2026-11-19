import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MealDetailModal } from './MealDetailModal';

import type { CalendarMeal } from '../Calendar';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../DishLink/DishLink', () => ({
	DishLink: vi.fn(({ dish }) => (
		<span data-testid="dish-link">{dish.name}</span>
	)),
}));

const baseMeal: CalendarMeal = {
	id: 'meal-1',
	date: '2024-01-01',
	name: 'Breakfast',
	borderColor: '#000',
	dishes: [],
};

describe('MealDetailModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('is not visible when meal is null', () => {
		render(
			<MealDetailModal meal={null} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('is visible when meal is provided', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	test('shows the meal title', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows the description when present', () => {
		const meal = { ...baseMeal, description: 'Morning meal' };
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getByText('Morning meal')).toBeDefined();
	});

	test('does not show description when absent', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.queryByText('Morning meal')).toBeNull();
	});

	test('shows dish names', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Eggs' }, { name: 'Toast' }],
		};
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getByText('Eggs')).toBeDefined();
		expect(screen.getByText('Toast')).toBeDefined();
	});

	test('shows dish note when present', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Pasta', note: 'al dente' }],
		};
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getByText('al dente')).toBeDefined();
	});

	test('does not show note section when note is absent', () => {
		const meal = { ...baseMeal, dishes: [{ name: 'Salad' }] };
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.queryByText('al dente')).toBeNull();
	});

	test('renders a DishLink for each dish', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Eggs' }, { name: 'Toast' }],
		};
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getAllByTestId('dish-link')).toHaveLength(2);
		expect(vi.mocked(DishLink)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(DishLink).mock.calls[0][0]).toEqual(
			expect.objectContaining({
				dish: { name: 'Eggs' },
				plannerId: 'planner-1',
			}),
		);
		expect(vi.mocked(DishLink).mock.calls[1][0]).toEqual(
			expect.objectContaining({
				dish: { name: 'Toast' },
				plannerId: 'planner-1',
			}),
		);
	});

	test('shows ref text below dish name when source has a ref', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Roast Chicken', source: { ref: 'The Flavor Bible' } }],
		};
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getByText('The Flavor Bible')).toBeDefined();
	});
});
