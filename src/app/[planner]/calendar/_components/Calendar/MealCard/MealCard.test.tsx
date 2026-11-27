import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCard } from './MealCard';

import type { CalendarMeal } from '../types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../_components/MealDishList/MealDishList', () => ({
	MealDishList: vi.fn(() => <ul data-testid="meal-dish-list" />),
}));

const baseMeal: CalendarMeal = {
	id: 'meal-1',
	date: '2024-06-15',
	name: 'Grilled Salmon',
	borderColor: '#F5B47A',
	dishes: [],
};

function renderCard(meal: CalendarMeal = baseMeal) {
	return render(<MealCard meal={meal} plannerId="planner-1" />);
}

describe('MealCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('shows the description when the meal has one', () => {
		renderCard({ ...baseMeal, description: 'With lemon and herbs' });

		expect(screen.getByText('With lemon and herbs')).toBeDefined();
	});

	it('shows no description when the meal has none', () => {
		renderCard();

		expect(screen.getByTestId('meal-card').textContent).toBe('Grilled Salmon');
	});

	it("draws the rail in the meal's tag color", () => {
		renderCard();

		const card = screen.getByTestId('meal-card');
		expect(card.style.borderLeft).toBe('4px solid rgb(245, 180, 122)');
	});

	it('draws the dish list when the meal has dishes', () => {
		renderCard({ ...baseMeal, dishes: [{ _id: 'dish-1', name: 'Salmon' }] });

		expect(screen.getByTestId('meal-dish-list')).toBeDefined();
	});

	it('draws no dish list when the meal has no dishes', () => {
		renderCard();

		expect(screen.queryByTestId('meal-dish-list')).toBeNull();
	});

	it('shows the actions it is given', () => {
		render(
			<MealCard
				meal={baseMeal}
				plannerId="planner-1"
				actions={<button type="button">Edit</button>}
			/>,
		);

		expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined();
	});
});
