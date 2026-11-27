import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from '@mantine/core';

import { makeDish } from '#fixtures/dish';

import { DishNameInput } from './DishNameInput';

import { useMealFormContext } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
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

describe('DishNameInput', () => {
	it("binds the field to its dish's name, leaving the message to the row", () => {
		const form = useMealFormContext();
		vi.mocked(useMealFormContext).mockReturnValue(form);
		vi.mocked(useDish).mockReturnValue(makeDish({ index: 2 }));
		render(<DishNameInput />);

		expect(form.getInputProps).toHaveBeenCalledWith('dishes.2.name', {
			withError: false,
		});
	});

	it.each([
		{ nameError: 'Name this dish, or delete it.', error: true },
		{ nameError: null, error: false },
	])('draws the field red only while the dish has a message ($error)', ({
		nameError,
		error,
	}) => {
		vi.mocked(useDish).mockReturnValue(makeDish({ nameError }));
		render(<DishNameInput />);

		expect(vi.mocked(TextInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error }),
			undefined,
		);
	});
});
