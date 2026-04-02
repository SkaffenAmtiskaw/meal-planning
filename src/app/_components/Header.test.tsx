import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { Header } from './Header';

vi.mock('@mantine/core', () => ({
	AppShellHeader: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	Group: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/_components', () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

describe('Header', () => {
	test('renders user menu', () => {
		render(<Header />);
		expect(screen.getByTestId('user-menu')).toBeDefined();
	});

	test('renders leftSection when provided', () => {
		render(<Header leftSection={<div data-testid="left-section" />} />);
		expect(screen.getByTestId('left-section')).toBeDefined();
	});

	test('renders without leftSection', () => {
		render(<Header />);
		expect(screen.queryByTestId('left-section')).toBeNull();
	});
});
