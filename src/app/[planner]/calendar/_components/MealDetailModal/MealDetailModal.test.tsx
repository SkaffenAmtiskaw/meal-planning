import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MealDetailModal } from './MealDetailModal';

import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('../DishLink/DishLink', () => ({
	DishLink: vi.fn(({ dish }) => (
		<span data-testid="dish-link">{dish.name}</span>
	)),
}));

const baseEvent = {
	id: 'meal-1',
	title: 'Breakfast',
	dishes: [],
};

describe('MealDetailModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('is not visible when event is null', () => {
		render(
			<MealDetailModal event={null} plannerId="planner-1" onClose={() => {}} />,
		);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('is visible when event is provided', () => {
		render(
			<MealDetailModal
				event={baseEvent}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	test('shows the meal title', () => {
		render(
			<MealDetailModal
				event={baseEvent}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows the description when present', () => {
		const event = { ...baseEvent, description: 'Morning meal' };
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('Morning meal')).toBeDefined();
	});

	test('does not show description when absent', () => {
		render(
			<MealDetailModal
				event={baseEvent}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.queryByText('Morning meal')).toBeNull();
	});

	test('shows dish names', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Eggs' }, { name: 'Toast' }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('Eggs')).toBeDefined();
		expect(screen.getByText('Toast')).toBeDefined();
	});

	test('shows dish note when present', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Pasta', note: 'al dente' }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('al dente')).toBeDefined();
	});

	test('does not show note section when note is absent', () => {
		const event = { ...baseEvent, dishes: [{ name: 'Salad' }] };
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.queryByText('al dente')).toBeNull();
	});

	test('renders a DishLink for each dish', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Eggs' }, { name: 'Toast' }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getAllByTestId('dish-link')).toHaveLength(2);
		expect(vi.mocked(DishLink)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(DishLink).mock.calls[0][0]).toEqual(
			expect.objectContaining({
				dish: { name: 'Eggs' },
				plannerId: 'planner-1',
			}),
		);
		expect(vi.mocked(DishLink).mock.calls[1][0]).toEqual(
			expect.objectContaining({
				dish: { name: 'Toast' },
				plannerId: 'planner-1',
			}),
		);
	});

	test('shows ref text below dish name when source has a ref', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Roast Chicken', source: { ref: 'The Flavor Bible' } }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText('The Flavor Bible')).toBeDefined();
	});
});
