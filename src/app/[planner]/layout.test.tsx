import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import Layout from './layout';

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
	return { AppShell, Burger: () => null };
});

vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => [false, { toggle: vi.fn() }],
}));

const mockNavbar = vi.fn<(props: { id: string }) => null>(() => null);
vi.mock('@/_components', () => ({
	Navbar: (props: { id: string }) => mockNavbar(props),
}));

const params = Promise.resolve({ planner: 'maleficent-planner-id' });

describe('planner layout', () => {
	test('passes planner id from params to Navbar', () => {
		render(<Layout params={params}>{'Maleficent Meals'}</Layout>);

		expect(mockNavbar).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'maleficent-planner-id' }),
		);
	});

	test('renders children', () => {
		render(<Layout params={params}>{"Ursula's Menu"}</Layout>);

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
	});
});
