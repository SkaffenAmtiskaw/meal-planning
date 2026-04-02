import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerWrapper } from './PlannerWrapper';

vi.mock('next/navigation', () => ({
	useParams: () => ({ planner: 'maleficent-planner-id' }),
}));

vi.mock('@mantine/core', () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	AppShellNavbar: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	AppShellMain: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	Burger: () => <div data-testid="burger" />,
}));

vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => [false, { toggle: vi.fn() }],
}));

const mockNavbar = vi.fn<(props: { id: string }) => null>(() => null);
vi.mock('@/_components', () => ({
	Navbar: (props: { id: string }) => mockNavbar(props),
}));

const mockHeader = vi.fn<(props: { leftSection?: React.ReactNode }) => null>(
	() => null,
);
vi.mock('@/app/_components/Header', () => ({
	Header: (props: { leftSection?: React.ReactNode }) => mockHeader(props),
}));

describe('PlannerWrapper', () => {
	test('passes planner id from params to Navbar', () => {
		render(<PlannerWrapper>{'Maleficent Meals'}</PlannerWrapper>);

		expect(mockNavbar).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'maleficent-planner-id' }),
		);
	});

	test('renders children', () => {
		render(<PlannerWrapper>{"Ursula's Menu"}</PlannerWrapper>);

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
	});

	test('passes Burger as leftSection to Header', () => {
		render(<PlannerWrapper>{'content'}</PlannerWrapper>);

		expect(mockHeader).toHaveBeenCalledWith(
			expect.objectContaining({ leftSection: expect.anything() }),
		);
	});
});
