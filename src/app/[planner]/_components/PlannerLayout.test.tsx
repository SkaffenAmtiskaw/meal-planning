import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PlannerLayout } from './PlannerLayout';
import { useToggleContext } from './ToggleContext';

vi.mock('next/navigation', () => ({
	useParams: () => ({ planner: 'maleficent-planner-id' }),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockUseDisclosure = vi.fn();
vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => mockUseDisclosure(),
}));

vi.mock('./useLastOpenedPlanner', () => ({
	useLastOpenedPlanner: vi.fn(),
}));

describe('PlannerLayout', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseDisclosure.mockReturnValue([false, { toggle: vi.fn() }]);
	});

	test('renders children', () => {
		render(<PlannerLayout>{"Ursula's Menu"}</PlannerLayout>);

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
	});

	test('renders navbar prop', () => {
		render(
			<PlannerLayout navbar={<div data-testid="test-navbar" />}>
				{'content'}
			</PlannerLayout>,
		);

		expect(screen.getByTestId('test-navbar')).toBeDefined();
	});

	test('renders header prop', () => {
		render(
			<PlannerLayout header={<div data-testid="test-header" />}>
				{'content'}
			</PlannerLayout>,
		);

		expect(screen.getByTestId('test-header')).toBeDefined();
	});

	test('provides toggle function via ToggleContext to children', () => {
		const TestComponent = () => {
			const { toggle } = useToggleContext();
			return (
				<button type="button" data-testid="toggle-btn" onClick={toggle}>
					Toggle
				</button>
			);
		};

		render(
			<PlannerLayout>
				<TestComponent />
			</PlannerLayout>,
		);

		expect(screen.getByTestId('toggle-btn')).toBeDefined();
	});

	test('provides opened state via ToggleContext to children', () => {
		mockUseDisclosure.mockReturnValue([true, { toggle: vi.fn() }]);

		const TestComponent = () => {
			const { opened } = useToggleContext();
			return <div data-testid="opened-state">{opened ? 'open' : 'closed'}</div>;
		};

		render(
			<PlannerLayout>
				<TestComponent />
			</PlannerLayout>,
		);

		expect(screen.getByTestId('opened-state').textContent).toBe('open');
	});
});
