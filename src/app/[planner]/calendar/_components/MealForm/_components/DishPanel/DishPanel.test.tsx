import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDish } from '#fixtures/dish';

import { DishPanel } from './DishPanel';

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
vi.mock('../DishRecipeSection/DishRecipeSection', () => ({
	DishRecipeSection: vi.fn(() => null),
}));

describe('DishPanel', () => {
	it("binds the note field to its dish's note", () => {
		const form = useMealFormContext();
		vi.mocked(useMealFormContext).mockReturnValue(form);
		vi.mocked(useDish).mockReturnValue(makeDish({ index: 1 }));
		render(<DishPanel noteRef={{ current: null }} />);

		expect(form.getInputProps).toHaveBeenCalledWith('dishes.1.note');
	});
});
