import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { UserMenu } from './UserMenu';

vi.mock('@mantine/core', () => ({
	ActionIcon: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Avatar: ({ 'data-testid': testId }: { 'data-testid'?: string }) => (
		<div data-testid={testId} />
	),
	Menu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	MenuTarget: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	MenuDropdown: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	MenuItem: ({
		children,
		'data-testid': testId,
		href,
	}: {
		children: React.ReactNode;
		'data-testid'?: string;
		href?: string;
	}) => (
		<a data-testid={testId} href={href}>
			{children}
		</a>
	),
	MenuDivider: () => <hr />,
}));

vi.mock('./SignOutButton', () => ({
	SignOutButton: () => <div data-testid="sign-out-button" />,
}));

describe('UserMenu', () => {
	test('renders user avatar', () => {
		render(<UserMenu />);
		expect(screen.getByTestId('user-avatar')).toBeDefined();
	});

	test('renders sign-out button', () => {
		render(<UserMenu />);
		expect(screen.getByTestId('sign-out-button')).toBeDefined();
	});

	test('renders settings link pointing to /settings', () => {
		render(<UserMenu />);
		const link = screen.getByTestId('settings-link');
		expect(link).toBeDefined();
		expect(link.getAttribute('href')).toBe('/settings');
	});
});
