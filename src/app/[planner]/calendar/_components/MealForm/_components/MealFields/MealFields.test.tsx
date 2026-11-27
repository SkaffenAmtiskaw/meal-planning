import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MealFields } from './MealFields';

import { useMealFormContext } from '../../../_hooks/useMealForm';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);
vi.mock('../MealDateField/MealDateField', () => ({
	MealDateField: vi.fn(({ onChange }: { onChange: (date: string) => void }) => (
		<button type="button" onClick={() => onChange('2026-11-27')}>
			Date
		</button>
	)),
}));

const withForm = () => {
	const form = useMealFormContext();
	vi.mocked(useMealFormContext).mockReturnValue(form);
	return form;
};

describe('MealFields', () => {
	it('sets the picked date in the form', () => {
		const form = withForm();
		render(<MealFields />);

		fireEvent.click(screen.getByRole('button', { name: 'Date' }));

		expect(form.setFieldValue).toHaveBeenCalledWith('date', '2026-11-27');
	});

	it.each([
		{ field: 'mealName', testId: 'input-Meal name', value: 'Taco Night' },
		{ field: 'description', testId: 'textarea-Description', value: 'Fridays' },
	] as const)('binds $field to the form', ({ field, testId, value }) => {
		const form = withForm();
		render(<MealFields />);

		fireEvent.change(screen.getByTestId(testId), { target: { value } });

		expect(form.values[field]).toBe(value);
	});
});
