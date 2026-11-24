import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MealFields } from './MealFields';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const values = { date: '', mealName: '', description: '' };

describe('MealFields', () => {
	it.each([
		{ field: 'date', testId: 'input-Date', value: '2026-11-27' },
		{ field: 'mealName', testId: 'input-Meal name', value: 'Taco Night' },
		{ field: 'description', testId: 'textarea-Description', value: 'Fridays' },
	])('reports a change to $field', ({ field, testId, value }) => {
		const onFieldChange = vi.fn();
		render(<MealFields values={values} onFieldChange={onFieldChange} />);

		fireEvent.change(screen.getByTestId(testId), { target: { value } });

		expect(onFieldChange).toHaveBeenCalledWith(field, value);
	});
});
