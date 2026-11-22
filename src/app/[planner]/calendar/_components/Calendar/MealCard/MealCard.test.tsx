import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCard } from './MealCard';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../_components/DishListItem/DishListItem', () => ({
	DishListItem: vi.fn(({ dish, renderName }) => (
		<div data-testid="dish-list-item" data-dish-name={dish.name}>
			{renderName(dish)}
		</div>
	)),
}));

describe('MealCard', () => {
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

	it('renders the description when provided', () => {
		const meal = { ...baseMeal, description: 'With lemon and herbs' };

		render(<MealCard meal={meal} />);

		expect(screen.getByText('With lemon and herbs')).toBeDefined();
	});

	it('does not render a description when omitted', () => {
		render(<MealCard meal={baseMeal} />);

		expect(screen.queryByText('With lemon and herbs')).toBeNull();
	});

	it('applies the correct left rail border color from the meal', () => {
		render(<MealCard meal={baseMeal} />);

		const card = screen.getByTestId('meal-card');

		expect((card as HTMLElement).style.borderLeftWidth).toBe('4px');
		expect((card as HTMLElement).style.borderLeftStyle).toBe('solid');
		expect((card as HTMLElement).style.borderLeftColor).toBe(
			'rgb(245, 180, 122)',
		);
	});

	it('renders a DishListItem for each dish', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Salmon' }, { name: 'Asparagus' }],
		};

		render(<MealCard meal={meal} />);

		const items = screen.getAllByTestId('dish-list-item');

		expect(items).toHaveLength(2);
		expect(items[0]?.getAttribute('data-dish-name')).toBe('Salmon');
		expect(items[1]?.getAttribute('data-dish-name')).toBe('Asparagus');
	});

	it('passes renderDish to DishListItem as renderName', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Salmon' }],
		};
		const renderDish = vi.fn(() => <span>Custom rendered salmon</span>);

		render(<MealCard meal={meal} renderDish={renderDish} />);

		expect(renderDish).toHaveBeenCalledWith(meal.dishes[0]);
		expect(screen.getByText('Custom rendered salmon')).toBeDefined();
	});

	it('defaults to rendering dish names as plain Text when renderDish is omitted', () => {
		const meal = {
			...baseMeal,
			dishes: [{ name: 'Salmon' }],
		};

		render(<MealCard meal={meal} />);

		expect(screen.getByText('Salmon')).toBeDefined();
	});

	it('does not render the dish list when there are no dishes', () => {
		render(<MealCard meal={baseMeal} />);

		expect(screen.queryByTestId('dish-list-item')).toBeNull();
	});

	it('renders renderActions when provided', () => {
		render(
			<MealCard
				meal={baseMeal}
				renderActions={<button type="button">Edit</button>}
			/>,
		);

		expect(screen.getByText('Edit')).toBeDefined();
	});

	it('does not render renderActions when omitted', () => {
		render(<MealCard meal={baseMeal} />);

		expect(screen.queryByText('Edit')).toBeNull();
	});

	it('contains no drag-handle markup', () => {
		render(<MealCard meal={baseMeal} />);

		expect(screen.queryByTestId('drag-handle-dot')).toBeNull();
	});
});
