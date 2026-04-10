import { useSelectedLayoutSegment } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { Navbar } from './Navbar';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/NavLink', () => ({
	NavLink: ({
		label,
		href,
		active,
		leftSection,
	}: {
		label: string;
		href: string;
		active?: boolean;
		leftSection?: React.ReactNode;
	}) => (
		<a href={href} data-active={active ? 'true' : undefined}>
			{leftSection}
			{label}
		</a>
	),
}));

vi.mock('next/navigation', () => ({
	useSelectedLayoutSegment: vi.fn(),
}));

vi.mock('./PlannerSwitcher', () => ({
	PlannerSwitcher: ({
		currentId,
		planners,
	}: {
		currentId: string;
		planners: { id: string; name: string }[];
	}) => (
		<div
			data-testid="planner-switcher"
			data-current-id={currentId}
			data-planner-count={planners.length}
		/>
	),
}));

describe('Navbar', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders calendar and recipes links', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);

		render(<Navbar id="gaston-planner-1" />);

		expect(screen.getByText('Calendar')).toBeDefined();
		expect(screen.getByText('Recipes')).toBeDefined();
	});

	test('links point to correct paths using the given planner id', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);

		render(<Navbar id="gaston-planner-1" />);

		expect(
			screen.getByRole('link', { name: /calendar/i }).getAttribute('href'),
		).toBe('/gaston-planner-1/calendar');
		expect(
			screen.getByRole('link', { name: /recipes/i }).getAttribute('href'),
		).toBe('/gaston-planner-1/recipes');
	});

	test('calendar link is active when on the calendar segment', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue('calendar');

		render(<Navbar id="gaston-planner-1" />);

		expect(
			screen
				.getByRole('link', { name: /calendar/i })
				.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByRole('link', { name: /recipes/i })
				.getAttribute('data-active'),
		).toBeFalsy();
	});

	test('recipes link is active when on the recipes segment', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue('recipes');

		render(<Navbar id="gaston-planner-1" />);

		expect(
			screen
				.getByRole('link', { name: /recipes/i })
				.getAttribute('data-active'),
		).toBeTruthy();
		expect(
			screen
				.getByRole('link', { name: /calendar/i })
				.getAttribute('data-active'),
		).toBeFalsy();
	});

	test('does not render PlannerSwitcher when no planners given', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);

		render(<Navbar id="gaston-planner-1" />);

		expect(screen.queryByTestId('planner-switcher')).toBeNull();
	});

	test('renders PlannerSwitcher when planners are given', () => {
		vi.mocked(useSelectedLayoutSegment).mockReturnValue(null);
		const planners = [{ id: 'p1', name: 'Planner 1' }];

		render(<Navbar id="p1" planners={planners} />);

		const switcher = screen.getByTestId('planner-switcher');
		expect(switcher.getAttribute('data-current-id')).toBe('p1');
		expect(switcher.getAttribute('data-planner-count')).toBe('1');
	});
});
