import { MantineProvider } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { MealDetailModal } from './MealDetailModal';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const baseEvent = {
	id: 'meal-1',
	start: {} as Temporal.PlainDate,
	end: {} as Temporal.PlainDate,
	title: 'Breakfast',
	dishes: [],
};

describe('MealDetailModal', () => {
	test('is not visible when event is null', () => {
		render(
			<MealDetailModal event={null} plannerId="planner-1" onClose={() => {}} />,
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
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
			{ wrapper },
		);
		expect(screen.queryByText('Note')).toBeNull();
	});

	test('dish name is an external link when source has a url', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Carbonara', source: { url: 'https://example.com' } }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
			{ wrapper },
		);
		const link = screen.getByRole('link', { name: 'Carbonara' });
		expect(link.getAttribute('href')).toBe('https://example.com');
	});

	test('dish name is an internal recipe link when source has an _id', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Pasta', source: { _id: 'recipe-123' } }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
			{ wrapper },
		);
		const link = screen.getByRole('link', { name: 'Pasta' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-123');
	});

	test('dish name is plain text and ref is shown below when source has a ref', () => {
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
			{ wrapper },
		);
		expect(screen.getByText('Roast Chicken')).toBeDefined();
		expect(screen.getByText('The Flavor Bible')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish name is plain text when source is an unresolved string', () => {
		const event = {
			...baseEvent,
			dishes: [{ name: 'Soup', source: 'some-object-id-string' }],
		};
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
			{ wrapper },
		);
		expect(screen.getByText('Soup')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish name is plain text when there is no source', () => {
		const event = { ...baseEvent, dishes: [{ name: 'Salad' }] };
		render(
			<MealDetailModal
				event={event}
				plannerId="planner-1"
				onClose={() => {}}
			/>,
			{ wrapper },
		);
		expect(screen.getByText('Salad')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});
});
