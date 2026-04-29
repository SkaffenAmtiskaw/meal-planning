import { ActionIcon } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserMenu } from './UserMenu';

// Mock Mantine core components
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// Mock Tabler icons
vi.mock('@tabler/icons-react', () => ({
	IconSettings: ({ size, color }: { size: number; color: string }) => (
		<span data-testid="icon-settings" data-size={size} data-color={color} />
	),
	IconUser: ({ size, color }: { size: number; color: string }) => (
		<span data-testid="icon-user" data-size={size} data-color={color} />
	),
	IconLogout: ({ size, color }: { size: number; color: string }) => (
		<span data-testid="icon-logout" data-size={size} data-color={color} />
	),
}));

// Mock theme colors
vi.mock('@/_theme/colors', () => ({
	THEME_COLORS: {
		chalk: '#EFE7E9',
		navy: '#1C3144',
	},
}));

// Mock SignOutButton
vi.mock('./SignOutButton', () => ({
	SignOutButton: () => <div data-testid="sign-out-button">Log Out</div>,
}));

// Mock InviteBadge - it just renders children
vi.mock('./InviteBadge', () => ({
	InviteBadge: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('UserMenu', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders without crashing', () => {
		render(<UserMenu />);
		expect(screen.getByTestId('user-avatar')).toBeDefined();
	});

	it('renders settings link with correct href', () => {
		render(<UserMenu />);
		const settingsLink = screen.getByTestId('settings-link');
		expect(settingsLink).toBeDefined();
		expect(settingsLink.getAttribute('href')).toBe('/settings');
	});

	it('renders sign-out button', () => {
		render(<UserMenu />);
		expect(screen.getByTestId('sign-out-button')).toBeDefined();
	});

	it('renders user icon in avatar', () => {
		render(<UserMenu />);
		expect(screen.getByTestId('icon-user')).toBeDefined();
	});

	it('passes suppressHydrationWarning to ActionIcon to prevent hydration mismatch', () => {
		render(<UserMenu />);
		expect(vi.mocked(ActionIcon)).toHaveBeenCalledWith(
			expect.objectContaining({ suppressHydrationWarning: true }),
			undefined,
		);
	});
});
