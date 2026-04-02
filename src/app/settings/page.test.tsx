import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import SettingsPage from './page';

const { mockGetSession, mockCheckEmailStatus } = vi.hoisted(() => ({
	mockGetSession: vi.fn(),
	mockCheckEmailStatus: vi.fn(),
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/_actions/auth', () => ({
	checkEmailStatus: mockCheckEmailStatus,
}));

vi.mock('./_components/ChangePasswordForm', () => ({
	ChangePasswordForm: ({ email }: { email: string }) => (
		<div data-testid="change-password-form" data-email={email} />
	),
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock('@mantine/core', () => ({
	Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
	Text: ({
		children,
		...props
	}: {
		children: React.ReactNode;
		[key: string]: unknown;
	}) => <p {...props}>{children}</p>,
}));

const session = { user: { email: 'user@example.com' } };

describe('SettingsPage', () => {
	test('redirects to home when no session', async () => {
		mockGetSession.mockResolvedValueOnce(null);

		await SettingsPage();

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('renders change password form for user with password', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');

		render(await SettingsPage());

		const form = screen.getByTestId('change-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-email')).toBe('user@example.com');
	});

	test('renders social-only message for Google-only user', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('social-only');

		render(await SettingsPage());

		expect(screen.getByTestId('social-only-message')).toBeDefined();
	});
});
