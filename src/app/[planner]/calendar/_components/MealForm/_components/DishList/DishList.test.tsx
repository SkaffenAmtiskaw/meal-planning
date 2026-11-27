import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Group } from '@mantine/core';

import { makeDishValues, makeMealDishes } from '#fixtures/dish';
import { useIsMobile } from '@/_hooks';

import { DishList } from './DishList';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { DishProvider } from '../../_hooks/useDish';
import { formatDishCount } from '../../_utils/formatDishCount';
import { DishRow } from '../DishRow/DishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);
vi.mock('../../_utils/formatDishCount', () => ({
	formatDishCount: vi.fn(() => '1 dish'),
}));
vi.mock('../DishRow/DishRow', () => ({
	DishRow: vi.fn(() => null),
}));

const soup = makeDishValues({ key: 'a', name: 'Soup' });
const bread = makeDishValues({ key: 'b', name: 'Bread' });

const onAddDish = vi.fn();

const withDishes = (dishes = [soup], dishCount = dishes.length) =>
	vi
		.mocked(useMealDishes)
		.mockReturnValue(makeMealDishes({ dishes, dishCount }));

const rowProps = (index: number) => vi.mocked(DishRow).mock.calls[index][0];

describe('DishList', () => {
	it('adds a dish from Add dish', () => {
		withDishes();
		render(<DishList onAddDish={onAddDish} />);

		fireEvent.click(screen.getByRole('button', { name: 'Add dish' }));

		expect(onAddDish).toHaveBeenCalledTimes(1);
	});

	it('gives each row its own dish and its place in the list', () => {
		vi.mocked(DishProvider).mockClear();
		withDishes([soup, bread]);
		render(<DishList onAddDish={onAddDish} />);

		expect(
			vi
				.mocked(DishProvider)
				.mock.calls.map(([{ dish, index }]) => ({ dish, index })),
		).toEqual([
			{ dish: soup, index: 0 },
			{ dish: bread, index: 1 },
		]);
	});

	it('lets a dish be deleted only while there is more than one', () => {
		vi.mocked(DishRow).mockClear();
		withDishes([soup]);
		render(<DishList onAddDish={onAddDish} />);
		expect(rowProps(0).canDelete).toBe(false);

		vi.mocked(DishRow).mockClear();
		withDishes([soup, bread]);
		render(<DishList onAddDish={onAddDish} />);
		expect(rowProps(0).canDelete).toBe(true);
	});

	it.each([
		{ device: 'a phone', isMobile: true, justify: 'space-between' },
		{ device: 'desktop', isMobile: false, justify: 'flex-start' },
	])('places the count for $device', ({ isMobile, justify }) => {
		vi.mocked(useIsMobile).mockReturnValueOnce(isMobile);
		withDishes();
		render(<DishList onAddDish={onAddDish} />);

		expect(vi.mocked(Group)).toHaveBeenLastCalledWith(
			expect.objectContaining({ justify }),
			undefined,
		);
	});

	it('shows the count of dishes that will be saved', () => {
		withDishes([soup, bread], 1);
		render(<DishList onAddDish={onAddDish} />);

		expect(vi.mocked(formatDishCount)).toHaveBeenLastCalledWith(1);
	});
});
