import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealFields } from './MealFields';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const makeForm = () => ({
	key: vi.fn((field: string) => field),
	getInputProps: vi.fn((field: string) => ({
		value: `value-${field}`,
		onChange: () => {},
	})),
});

describe('MealFields', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the date, meal name, and description fields wired to the form', () => {
		const form = makeForm();
		render(<MealFields form={form} />);
		expect(screen.getByTestId('meal-date')).toBeDefined();
		expect(screen.getByTestId('meal-name')).toBeDefined();
		expect(screen.getByTestId('meal-description')).toBeDefined();
	});
});
