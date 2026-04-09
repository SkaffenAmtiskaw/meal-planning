import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { UserMenu } from './UserMenu';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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
