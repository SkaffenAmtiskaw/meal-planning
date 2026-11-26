import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Group } from '@mantine/core';

import { makeDishDraft } from '#fixtures/dish';
import { useIsMobile } from '@/_hooks';

import { DishList } from './DishList';

import { DishProvider } from '../../_hooks/useDish';
import { formatDishCount } from '../../_utils/formatDishCount';
import { DishRow } from '../DishRow/DishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
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

const soup = makeDishDraft({ key: 'a', name: 'Soup' });
const bread = makeDishDraft({ key: 'b', name: 'Bread' });

const onAddDish = vi.fn();

const rowProps = (index: number) => vi.mocked(DishRow).mock.calls[index][0];

describe('DishList', () => {
	it('adds a dish from Add dish', () => {
		render(<DishList dishes={[soup]} dishCount={1} onAddDish={onAddDish} />);

		fireEvent.click(screen.getByRole('button', { name: 'Add dish' }));

		expect(onAddDish).toHaveBeenCalledTimes(1);
	});

	it('gives each row its own dish', () => {
		vi.mocked(DishProvider).mockClear();
		render(
			<DishList dishes={[soup, bread]} dishCount={2} onAddDish={onAddDish} />,
		);

		expect(
			vi.mocked(DishProvider).mock.calls.map(([props]) => props.dish),
		).toEqual([soup, bread]);
	});

	it('lets a dish be deleted only while there is more than one', () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup]} dishCount={1} onAddDish={onAddDish} />);
		expect(rowProps(0).canDelete).toBe(false);

		vi.mocked(DishRow).mockClear();
		render(
			<DishList dishes={[soup, bread]} dishCount={2} onAddDish={onAddDish} />,
		);
		expect(rowProps(0).canDelete).toBe(true);
	});

	it.each([
		{ device: 'a phone', isMobile: true, justify: 'space-between' },
		{ device: 'desktop', isMobile: false, justify: 'flex-start' },
	])('places the count for $device', ({ isMobile, justify }) => {
		vi.mocked(useIsMobile).mockReturnValueOnce(isMobile);
		render(<DishList dishes={[soup]} dishCount={1} onAddDish={onAddDish} />);

		expect(vi.mocked(Group)).toHaveBeenLastCalledWith(
			expect.objectContaining({ justify }),
			undefined,
		);
	});

	it('shows the count it was given', () => {
		render(
			<DishList dishes={[soup, bread]} dishCount={1} onAddDish={onAddDish} />,
		);

		expect(vi.mocked(formatDishCount)).toHaveBeenLastCalledWith(1);
	});
});
