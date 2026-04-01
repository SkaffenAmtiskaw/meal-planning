import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerWrapper } from './PlannerWrapper';

vi.mock('next/navigation', () => ({
	useParams: () => ({ planner: 'maleficent-planner-id' }),
}));

vi.mock('@mantine/core', () => {
	const AppShell = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	AppShell.Header = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	AppShell.Navbar = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	AppShell.Main = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);

	return {
		AppShell,
		Burger: () => null,
		Group: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	};
});

vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => [false, { toggle: vi.fn() }],
}));

const mockNavbar = vi.fn<(props: { id: string }) => null>(() => null);
vi.mock('@/_components', () => ({
	Navbar: (props: { id: string }) => mockNavbar(props),
	UserMenu: () => (
		<>
			<div data-testid="user-avatar" />
			<div data-testid="sign-out-button" />
		</>
	),
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

	test('renders user avatar', () => {
		render(<PlannerWrapper>{'content'}</PlannerWrapper>);

		expect(screen.getByTestId('user-avatar')).toBeDefined();
	});

	test('renders sign-out button', () => {
		render(<PlannerWrapper>{'content'}</PlannerWrapper>);

		expect(screen.getByTestId('sign-out-button')).toBeDefined();
	});
});
