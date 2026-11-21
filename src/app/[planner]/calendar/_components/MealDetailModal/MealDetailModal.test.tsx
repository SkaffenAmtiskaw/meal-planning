import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MealDetailModal } from './MealDetailModal';

import type { CalendarMeal } from '../Calendar';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('./MealDetails', () => ({
	MealDetails: vi.fn(() => <div data-testid="meal-details" />),
}));

const baseMeal: CalendarMeal = {
	id: 'meal-1',
	date: '2024-01-01',
	name: 'Breakfast',
	borderColor: '#000',
	dishes: [],
};

describe('MealDetailModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('is not visible while it has no data', () => {
		render(<MealDetailModal data={null} close={vi.fn()} plannerId="p-1" />);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('is visible when opened with a meal', () => {
		render(
			<MealDetailModal
				data={{ meal: baseMeal }}
				close={vi.fn()}
				plannerId="p-1"
			/>,
		);
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	test('closes through the close it is given', () => {
		const close = vi.fn();
		render(
			<MealDetailModal
				data={{ meal: baseMeal }}
				close={close}
				plannerId="p-1"
			/>,
		);

		fireEvent.click(screen.getByLabelText('close'));

		expect(close).toHaveBeenCalledTimes(1);
	});

	test('shows the meal title', () => {
		render(
			<MealDetailModal
				data={{ meal: baseMeal }}
				close={vi.fn()}
				plannerId="p-1"
			/>,
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows the description when present', () => {
		const meal = { ...baseMeal, description: 'Morning meal' };
		render(<MealDetailModal data={{ meal }} close={vi.fn()} plannerId="p-1" />);
		expect(screen.getByText('Morning meal')).toBeDefined();
	});

	test('does not show description when absent', () => {
		render(
			<MealDetailModal
				data={{ meal: baseMeal }}
				close={vi.fn()}
				plannerId="p-1"
			/>,
		);
		expect(screen.queryByText('Morning meal')).toBeNull();
	});
});
