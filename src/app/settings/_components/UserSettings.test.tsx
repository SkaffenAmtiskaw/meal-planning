import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { UserSettings } from './UserSettings';

const { mockCheckEmailStatus, mockGetUser } = vi.hoisted(() => ({
	mockCheckEmailStatus: vi.fn(),
	mockGetUser: vi.fn(),
}));

vi.mock('@/_actions/auth', () => ({
	checkEmailStatus: mockCheckEmailStatus,
}));

vi.mock('@/_actions/user', () => ({
	getUser: mockGetUser,
}));

vi.mock('./ChangePasswordForm', () => ({
	ChangePasswordForm: ({ email }: { email: string }) => (
		<div data-testid="change-password-form" data-email={email} />
	),
}));

vi.mock('./ChangeEmailForm', () => ({
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

vi.mock('./ChangeNameForm', () => ({
	ChangeNameForm: ({ currentName }: { currentName: string }) => (
		<div data-testid="change-name-form" data-name={currentName} />
	),
}));

vi.mock('./DeleteAccountForm', () => ({
	DeleteAccountForm: () => <div data-testid="delete-account-form" />,
}));

vi.mock('./InvitesSettings', () => ({
	InvitesSettings: () => <div data-testid="invites-settings" />,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

describe('UserSettings', () => {
	test('renders change name form with user name', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce({
			name: 'Ariel',
			pendingEmailChange: null,
		});

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-name-form');
		expect(form.getAttribute('data-name')).toBe('Ariel');
	});

	test('renders change name form with "New User" when user is null', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-name-form');
		expect(form.getAttribute('data-name')).toBe('New User');
	});

	test('renders change email form with current email', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce({ pendingEmailChange: null });

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-email')).toBe('user@example.com');
	});

	test('passes pending email change to ChangeEmailForm', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce({
			pendingEmailChange: {
				email: 'new@example.com',
				token: 'token123',
				expiresAt: futureDate,
			},
		});

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-pending')).toBe('new@example.com');
	});

	test('passes undefined pendingEmailChange when user is null', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-email-form');
		expect(form.getAttribute('data-pending')).toBe('');
	});

	test('renders change password form for user with password', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		const form = screen.getByTestId('change-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-email')).toBe('user@example.com');
	});

	test('renders social-only message for Google-only user', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('social-only');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(screen.getByTestId('social-only-message')).toBeDefined();
	});

	test('renders delete account form in Danger Zone section', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(screen.getByTestId('delete-account-form')).toBeDefined();
	});

	test('renders InvitesSettings component', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(screen.getByTestId('invites-settings')).toBeDefined();
	});

	test('renders Pending Invites title', async () => {
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockGetUser.mockResolvedValueOnce(null);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(screen.getByText('Pending Invites')).toBeDefined();
	});
});
