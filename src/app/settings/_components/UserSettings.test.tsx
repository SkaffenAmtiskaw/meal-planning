import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { getUser } from '@/_actions/user';

import { ChangeEmailForm } from './ChangeEmailForm';
import { ChangeNameForm } from './ChangeNameForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { UserSettings } from './UserSettings';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./ChangeEmailForm', () => ({
	ChangeEmailForm: vi.fn(() => null),
}));

vi.mock('./ChangeNameForm', () => ({
	ChangeNameForm: vi.fn(() => null),
}));

vi.mock('./ChangePasswordForm', () => ({
	ChangePasswordForm: vi.fn(() => null),
}));

vi.mock('./DeleteAccountForm', () => ({
	DeleteAccountForm: vi.fn(() => null),
}));

vi.mock('./InvitesSettings', () => ({
	InvitesSettings: vi.fn(() => null),
}));

describe('UserSettings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should pass user name to ChangeNameForm', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce({ name: 'Ariel' } as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangeNameForm)).toHaveBeenCalledWith(
			expect.objectContaining({ currentName: 'Ariel' }),
			undefined,
		);
	});

	it('should pass "New User" to ChangeNameForm when user is null', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangeNameForm)).toHaveBeenCalledWith(
			expect.objectContaining({ currentName: 'New User' }),
			undefined,
		);
	});

	it('should pass current email to ChangeEmailForm', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce({ name: 'Test User' } as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangeEmailForm)).toHaveBeenCalledWith(
			expect.objectContaining({ currentEmail: 'user@example.com' }),
			undefined,
		);
	});

	it('should transform and pass pending email change to ChangeEmailForm', async () => {
		const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce({
			name: 'Test User',
			pendingEmailChange: {
				email: 'new@example.com',
				token: 'token123',
				expiresAt: futureDate,
			},
		} as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangeEmailForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				currentEmail: 'user@example.com',
				pendingEmailChange: expect.objectContaining({
					email: 'new@example.com',
					expiresAt: futureDate,
				}),
			}),
			undefined,
		);
	});

	it('should pass undefined pendingEmailChange when user is null', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangeEmailForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				currentEmail: 'user@example.com',
				pendingEmailChange: undefined,
			}),
			undefined,
		);
	});

	it('should render ChangePasswordForm when user has a password', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(vi.mocked(ChangePasswordForm)).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'user@example.com' }),
			undefined,
		);
	});

	it('should render social-only message when user does not have a password', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		render(await UserSettings({ email: 'user@example.com' }));

		expect(screen.getByTestId('social-only-message')).toBeDefined();
		expect(vi.mocked(ChangePasswordForm)).not.toHaveBeenCalled();
	});
});
