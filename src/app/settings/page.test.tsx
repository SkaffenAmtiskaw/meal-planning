import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import SettingsPage from './page';

const { mockGetSession, mockCheckEmailStatus, mockGetUser } = vi.hoisted(
	() => ({
		mockGetSession: vi.fn(),
		mockCheckEmailStatus: vi.fn(),
		mockGetUser: vi.fn(),
	}),
);

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

vi.mock('@/_actions/user', () => ({
	getUser: mockGetUser,
}));

vi.mock('./_components/ChangePasswordForm', () => ({
	ChangePasswordForm: ({ email }: { email: string }) => (
		<div data-testid="change-password-form" data-email={email} />
	),
}));

vi.mock('./_components/ChangeEmailForm', () => ({
	ChangeEmailForm: ({
		currentEmail,
		pendingEmailChange,
	}: {
		currentEmail: string;
		pendingEmailChange?: { email: string; expiresAt: Date };
	}) => (
		<div
			data-testid="change-email-form"
			data-email={currentEmail}
			data-pending={pendingEmailChange?.email ?? ''}
		/>
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
	SimpleGrid: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const session = { user: { email: 'user@example.com' } };
const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

describe('SettingsPage', () => {
	test('redirects to home when no session', async () => {
		mockGetSession.mockResolvedValueOnce(null);

		await SettingsPage();

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('renders change email form with current email', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce({ pendingEmailChange: null });

		render(await SettingsPage());

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-email')).toBe('user@example.com');
	});

	test('passes pending email change to ChangeEmailForm', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce({
			pendingEmailChange: {
				email: 'new@example.com',
				token: 'token123',
				expiresAt: futureDate,
			},
		});

		render(await SettingsPage());

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-pending')).toBe('new@example.com');
	});

	test('passes undefined pendingEmailChange when user is null', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await SettingsPage());

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-pending')).toBe('');
	});

	test('renders change password form for user with password', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await SettingsPage());

		const form = screen.getByTestId('change-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-email')).toBe('user@example.com');
	});

	test('renders social-only message for Google-only user', async () => {
		mockGetSession.mockResolvedValueOnce(session);
		mockCheckEmailStatus.mockResolvedValueOnce('social-only');
		mockGetUser.mockResolvedValueOnce(null);

		render(await SettingsPage());

		expect(screen.getByTestId('social-only-message')).toBeDefined();
	});
});
