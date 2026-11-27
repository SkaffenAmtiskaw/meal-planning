import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MealFields } from './MealFields';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('../MealDateField/MealDateField', () => ({
	MealDateField: vi.fn(({ onChange }: { onChange: (date: string) => void }) => (
		<button type="button" onClick={() => onChange('2026-11-27')}>
			Date
		</button>
	)),
}));

const values = { date: '', mealName: '', description: '' };

describe('MealFields', () => {
	it('reports a picked date', () => {
		const onFieldChange = vi.fn();
		render(<MealFields values={values} onFieldChange={onFieldChange} />);

		fireEvent.click(screen.getByRole('button', { name: 'Date' }));

		expect(onFieldChange).toHaveBeenCalledWith('date', '2026-11-27');
	});

	it.each([
		{ field: 'mealName', testId: 'input-Meal name', value: 'Taco Night' },
		{ field: 'description', testId: 'textarea-Description', value: 'Fridays' },
	])('reports a change to $field', ({ field, testId, value }) => {
		const onFieldChange = vi.fn();
		render(<MealFields values={values} onFieldChange={onFieldChange} />);

		fireEvent.change(screen.getByTestId(testId), { target: { value } });

		expect(onFieldChange).toHaveBeenCalledWith(field, value);
	});
});
