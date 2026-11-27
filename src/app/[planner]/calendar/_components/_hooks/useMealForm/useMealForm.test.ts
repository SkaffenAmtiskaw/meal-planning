import { describe, expect, it, vi } from 'vitest';

import { schemaResolver, useForm } from '@mantine/form';

import { makeMealValues } from '#fixtures/dish';

import { zMealValues } from './mealValues';
import { useMealForm } from './useMealForm';

vi.mock('@mantine/form', async () => await import('#mocks/@mantine/form'));
vi.mock('./mealValues', () => ({ zMealValues: {} }));

describe('useMealForm', () => {
	it('starts from the values it was given, and checks a save against the meal schema', () => {
		const values = makeMealValues({ mealName: 'Dinner' });

		useMealForm(values);

		expect(schemaResolver).toHaveBeenCalledWith(zMealValues);
		expect(useForm).toHaveBeenCalledWith(
			expect.objectContaining({
				initialValues: values,
				validate: vi.mocked(schemaResolver).mock.results[0].value,
			}),
		);
	});

	it('is controlled, so what the form shows follows each change', () => {
		useMealForm(makeMealValues());

		expect(useForm).toHaveBeenLastCalledWith(
			expect.objectContaining({ mode: 'controlled' }),
		);
	});

	it("keeps a stopped save's errors through later changes", () => {
		useMealForm(makeMealValues());

		expect(useForm).toHaveBeenLastCalledWith(
			expect.objectContaining({ clearInputErrorOnChange: false }),
		);
	});
});
