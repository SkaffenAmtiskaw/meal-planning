import { render, screen } from '@testing-library/react';
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

	test('is not visible when meal is null', () => {
		render(
			<MealDetailModal meal={null} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('is visible when meal is provided', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	test('shows the meal title', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows the description when present', () => {
		const meal = { ...baseMeal, description: 'Morning meal' };
		render(
			<MealDetailModal meal={meal} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.getByText('Morning meal')).toBeDefined();
	});

	test('does not show description when absent', () => {
		render(
			<MealDetailModal
				meal={baseMeal}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.queryByText('Morning meal')).toBeNull();
	});
});
