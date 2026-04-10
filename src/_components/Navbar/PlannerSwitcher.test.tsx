import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerSwitcher } from './PlannerSwitcher';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/NavLink', () => ({
	NavLink: ({
		label,
		href,
		active,
		...props
	}: {
		label: string;
		href: string;
		active?: boolean;
	}) => (
		<a
			href={href}
			data-active={active ? 'true' : undefined}
			data-testid={`navlink-${label.replace(/[^a-zA-Z0-9]/g, '-')}`}
			{...props}
		>
			{label}
		</a>
	),
}));

const planners = [
	{ id: '507f1f77bcf86cd799439011', name: "Ariel's Planner" },
	{ id: '507f1f77bcf86cd799439022', name: "Eric's Planner" },
];

describe('PlannerSwitcher', () => {
	test('renders a nav item for each planner', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(screen.getByText("Ariel's Planner")).toBeDefined();
		expect(screen.getByText("Eric's Planner")).toBeDefined();
	});

	test('marks current planner as active', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(
			screen
				.getByText("Ariel's Planner")
				.closest('a')
				?.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByText("Eric's Planner")
				.closest('a')
				?.getAttribute('data-active'),
		).toBeFalsy();
	});

	test('each item links to the planner calendar', () => {
		render(<PlannerSwitcher currentId={planners[0].id} planners={planners} />);

		expect(
			screen.getByText("Ariel's Planner").closest('a')?.getAttribute('href'),
		).toBe(`/${planners[0].id}/calendar`);
	});
});
