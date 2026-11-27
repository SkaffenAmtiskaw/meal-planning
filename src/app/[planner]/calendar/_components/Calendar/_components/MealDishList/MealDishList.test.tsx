import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealDishList } from './MealDishList';

import type { ResolvedDish } from '../../../../_utils/types';
import { DishLink } from '../../../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../../DishLink/DishLink', () => ({
	DishLink: vi.fn(({ dish }) => <span>{dish.name}</span>),
}));

const dish: ResolvedDish = { _id: 'dish-1', name: 'Grilled Salmon' };

function renderList(dishes: ResolvedDish[]) {
	return render(<MealDishList dishes={dishes} plannerId="planner-1" />);
}

describe('MealDishList', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('draws each dish through DishLink, in order', () => {
		renderList([dish, { _id: 'dish-2', name: 'Asparagus' }]);

		const items = screen.getAllByRole('listitem');
		expect(items.map((item) => item.textContent)).toEqual([
			'Grilled Salmon',
			'Asparagus',
		]);
		expect(DishLink).toHaveBeenCalledWith(
			expect.objectContaining({ dish, plannerId: 'planner-1', size: 'sm' }),
			undefined,
		);
	});

	it('marks a url dish with an icon that screen readers skip', () => {
		const { container } = renderList([
			{ ...dish, source: { url: 'https://example.com' } },
		]);

		expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
			'true',
		);
	});

	it('draws no icon for a dish without a url', () => {
		const { container } = renderList([{ ...dish, source: { _id: 'r-1' } }]);

		expect(container.querySelector('svg')).toBeNull();
	});

	it("shows a book dish's reference", () => {
		renderList([{ ...dish, source: { ref: 'Cookbook p.12' } }]);

		expect(screen.getByText('Cookbook p.12')).toBeDefined();
	});

	it('shows a dish note in full, keeping its line breaks', () => {
		const note = `Start at 6:15\nKeep it mild ${'x'.repeat(1200)}`;

		renderList([{ ...dish, note }]);

		expect(screen.getByRole('listitem').textContent).toBe(
			`Grilled Salmon${note}`,
		);
	});

	it('shows only the name for a dish with no source or note', () => {
		renderList([dish]);

		expect(screen.getByRole('listitem').textContent).toBe('Grilled Salmon');
	});
});
