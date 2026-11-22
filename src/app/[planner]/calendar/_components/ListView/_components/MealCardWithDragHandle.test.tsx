import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCardWithDragHandle } from './MealCardWithDragHandle';

import { MealCard } from '../../Calendar/MealCard/MealCard';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../../Calendar/MealCard/MealCard', () => ({
	MealCard: vi.fn(({ meal, renderActions }) => (
		<div data-testid="meal-card" data-meal-name={meal.name}>
			{renderActions}
		</div>
	)),
}));

describe('MealCardWithDragHandle', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseMeal = {
		id: 'meal-1',
		date: '2024-06-15',
		name: 'Grilled Salmon',
		borderColor: '#F5B47A',
		dishes: [],
	};

	it('renders six drag handle dots', () => {
		render(<MealCardWithDragHandle meal={baseMeal} />);

		expect(screen.getAllByTestId('drag-handle-dot')).toHaveLength(6);
	});

	it('renders the MealCard with the meal', () => {
		render(<MealCardWithDragHandle meal={baseMeal} />);

		expect(screen.getByTestId('meal-card').getAttribute('data-meal-name')).toBe(
			'Grilled Salmon',
		);
	});

	it('passes renderDish to MealCard', () => {
		const renderDish = vi.fn(() => <span>Custom dish</span>);

		render(<MealCardWithDragHandle meal={baseMeal} renderDish={renderDish} />);

		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ meal: baseMeal, renderDish }),
			undefined,
		);
	});

	it('passes renderActions to MealCard when provided', () => {
		const renderActions = (
			<button type="button" data-testid="action-button">
				Action
			</button>
		);

		render(
			<MealCardWithDragHandle meal={baseMeal} renderActions={renderActions} />,
		);

		expect(screen.getByTestId('action-button')).toBeDefined();
	});
});
