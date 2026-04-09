import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerSwitcher } from './PlannerSwitcher';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const planners = [
	{ id: '507f1f77bcf86cd799439011', name: "Ariel's Planner" },
	{ id: '507f1f77bcf86cd799439022', name: "Eric's Planner" },
];

describe('PlannerSwitcher', () => {
	test('renders a nav item for each planner', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(
			screen.getByTestId(`planner-switcher-item-${planners[0].id}`),
		).toBeDefined();
		expect(
			screen.getByTestId(`planner-switcher-item-${planners[1].id}`),
		).toBeDefined();
	});

	test('marks current planner as active', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(
			screen
				.getByTestId(`planner-switcher-item-${planners[0].id}`)
				.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByTestId(`planner-switcher-item-${planners[1].id}`)
				.getAttribute('data-active'),
		).toBeFalsy();
	});

	test('each item links to the planner calendar', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(
			screen
				.getByTestId(`planner-switcher-item-${planners[0].id}`)
				.getAttribute('href'),
		).toBe(`/${planners[0].id}/calendar`);
	});
});
