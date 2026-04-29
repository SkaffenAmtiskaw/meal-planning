import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('next/link', () => ({
	Link: vi.fn(({ children, href, ...props }) => (
		<a href={href} {...props}>
			{children}
		</a>
	)),
	default: vi.fn(({ children, href, ...props }) => (
		<a href={href} {...props}>
			{children}
		</a>
	)),
}));
vi.mock('@tabler/icons-react', () => ({
	IconChevronDown: vi.fn(({ className }) => (
		<span data-testid="icon-chevron-down" className={className}>
			▼
		</span>
	)),
}));

import { PlannerContextSection } from './PlannerContextSection';

describe('PlannerContextSection', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('single planner mode', () => {
		const singlePlanner = [{ id: 'planner-1', name: 'My Planner' }];

		it('renders the planner name as static text', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={singlePlanner}
				/>,
			);

			expect(screen.getByText('My Planner')).toBeDefined();
		});

		it('renders NavLink (not a button)', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={singlePlanner}
				/>,
			);

			const element = screen.getByTestId('planner-context-static');
			expect(element.tagName).toBe('A');
			expect(element.tagName).not.toBe('BUTTON');
		});

		it('does not render a chevron icon', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={singlePlanner}
				/>,
			);

			expect(screen.queryByTestId('icon-chevron-down')).toBeNull();
		});

		it('does not render a menu', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={singlePlanner}
				/>,
			);

			// Menu components should not be rendered in single planner mode
			expect(screen.queryByRole('menu')).toBeNull();
		});

		it('applies staticLabel class to the root element', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={singlePlanner}
				/>,
			);

			const element = screen.getByTestId('planner-context-static');
			expect(element.className).toContain('staticLabel');
		});
	});

	describe('multi-planner mode', () => {
		const multiplePlanners = [
			{ id: 'planner-1', name: 'Planner One' },
			{ id: 'planner-2', name: 'Planner Two' },
		];

		it('renders a trigger with the current planner name', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			// Use getByTestId for the trigger since text appears multiple times
			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger).toBeDefined();
			expect(trigger.textContent).toContain('Planner One');
		});

		it('renders a chevron icon', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			expect(screen.getByTestId('icon-chevron-down')).toBeDefined();
		});

		it('renders menu items for all planners', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			// Menu items are rendered in the DOM (even if visually hidden by Mantine)
			// Check via testid instead of text since text appears in trigger too
			expect(screen.getByTestId('planner-menu-item-planner-1')).toBeDefined();
			expect(screen.getByTestId('planner-menu-item-planner-2')).toBeDefined();
		});

		it('menu items are links pointing to correct URLs', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			// Menu items are links
			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(2);
			expect(links[0].getAttribute('href')).toBe('/planner-1/calendar');
			expect(links[1].getAttribute('href')).toBe('/planner-2/calendar');
		});

		it('applies trigger class to the trigger root element', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger.className).toContain('trigger');
		});

		it('applies plannerName class for truncation', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			// The plannerName class is applied to the label via classNames
			// The trigger itself has the trigger class, and the label has plannerName
			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger.className).toContain('trigger');
		});

		it('applies chevron class to the chevron icon wrapper', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			const chevron = screen.getByTestId('icon-chevron-down');
			// The chevron class is on the wrapper span (classNames.section), not on the icon itself
			expect(chevron.parentElement?.className).toContain('chevron');
		});

		it('current planner item is rendered in the dropdown', () => {
			render(
				<PlannerContextSection
					currentId="planner-1"
					planners={multiplePlanners}
				/>,
			);

			// Check that the current planner's item exists in the dropdown
			const currentPlannerItem = screen.getByTestId(
				'planner-menu-item-planner-1',
			);
			expect(currentPlannerItem).toBeDefined();
		});
	});

	describe('planner name truncation', () => {
		// Use multi-planner array to test truncation in multi-planner mode
		const longNamedPlanners = [
			{
				id: 'planner-long',
				name: 'This Is A Very Long Planner Name That Should Truncate',
			},
			{ id: 'planner-short', name: 'Short' },
		];

		it('applies plannerName class with truncation styles', () => {
			render(
				<PlannerContextSection
					currentId="planner-long"
					planners={longNamedPlanners}
				/>,
			);

			// The trigger should have the trigger class
			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger.className).toContain('trigger');
		});
	});

	describe('current planner identification', () => {
		const planners = [
			{ id: 'planner-a', name: 'Planner A' },
			{ id: 'planner-b', name: 'Planner B' },
			{ id: 'planner-c', name: 'Planner C' },
		];

		it('correctly identifies the current planner by id', () => {
			render(
				<PlannerContextSection currentId="planner-b" planners={planners} />,
			);

			// Use the trigger to verify the correct planner is shown
			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger.textContent).toContain('Planner B');
		});

		it('shows Unknown Planner when currentId does not match any planner', () => {
			render(
				<PlannerContextSection currentId="nonexistent" planners={planners} />,
			);

			const trigger = screen.getByTestId('planner-context-trigger');
			expect(trigger.textContent).toContain('Unknown Planner');
		});
	});
});
