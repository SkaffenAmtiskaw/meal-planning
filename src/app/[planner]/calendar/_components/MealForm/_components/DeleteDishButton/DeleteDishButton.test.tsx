import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDisclosure } from '@mantine/hooks';

import { makeDish, makeDishValues, makeMealDishes } from '#fixtures/dish';
import { ConfirmModal } from '@/_components';

import { DeleteDishButton } from './DeleteDishButton';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('@/_components', () => ({
	ConfirmModal: vi.fn(() => null),
}));
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

const disclosure = {
	open: vi.fn(),
	close: vi.fn(),
	toggle: vi.fn(),
	set: vi.fn(),
};

const confirmProps = () => vi.mocked(ConfirmModal).mock.lastCall?.[0];

const withDish = (name: string) => {
	vi.mocked(useDish).mockReturnValue(
		makeDish({ dish: makeDishValues({ key: 'soup', name }) }),
	);
	const mealDishes = makeMealDishes();
	vi.mocked(useMealDishes).mockReturnValue(mealDishes);
	return mealDishes;
};

describe('DeleteDishButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useDisclosure).mockReturnValue([true, disclosure]);
	});

	it('asks before deleting', () => {
		const mealDishes = withDish('Soup');
		render(<DeleteDishButton />);

		fireEvent.click(screen.getByRole('button', { name: 'Delete dish' }));

		expect(disclosure.open).toHaveBeenCalledTimes(1);
		expect(mealDishes.deleteDish).not.toHaveBeenCalled();
	});

	it('closes the question and deletes the dish once confirmed', () => {
		const mealDishes = withDish('Soup');
		render(<DeleteDishButton />);

		confirmProps()?.onConfirm();

		expect(disclosure.close).toHaveBeenCalledTimes(1);
		expect(mealDishes.deleteDish).toHaveBeenCalledWith('soup');
	});

	it.each([
		{
			named: 'a named dish',
			dishName: 'Soup',
			message: 'Remove "Soup" from this meal?',
		},
		{
			named: 'a dish with no name',
			dishName: '',
			message: 'Remove this dish from this meal?',
		},
	])('names $named in the question', ({ dishName, message }) => {
		withDish(dishName);
		render(<DeleteDishButton />);

		expect(confirmProps()?.message).toBe(message);
	});
});
