import { MantineProvider } from '@mantine/core';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { ChangePasswordForm } from './ChangePasswordForm';

vi.mock('@/_utils/auth', () => ({
	client: {
		changePassword: vi.fn(),
		requestPasswordReset: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('ChangePasswordForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders current password, new password, and confirm inputs', () => {
		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		expect(screen.getByTestId('current-password-input')).toBeDefined();
		expect(screen.getByTestId('new-password-input')).toBeDefined();
		expect(screen.getByTestId('confirm-password-input')).toBeDefined();
		expect(screen.getByTestId('change-password-button')).toBeDefined();
		expect(screen.getByTestId('forgot-password-button')).toBeDefined();
	});

	test('shows error when new passwords do not match', async () => {
		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'password1' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password2' },
		});
		fireEvent.click(screen.getByTestId('change-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Passwords do not match.',
			);
		});

		expect(client.changePassword).not.toHaveBeenCalled();
	});

	test('calls changePassword with current and new password when passwords match', async () => {
		vi.mocked(client.changePassword).mockResolvedValueOnce({
			data: {},
			error: null,
		});

		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.change(screen.getByTestId('current-password-input'), {
			target: { value: 'oldpassword' },
		});
		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('change-password-button'));

		await waitFor(() => {
			expect(client.changePassword).toHaveBeenCalledWith({
				currentPassword: 'oldpassword',
				newPassword: 'newpassword',
				revokeOtherSessions: false,
			});
		});
	});

	test('shows success alert after successful password change', async () => {
		vi.mocked(client.changePassword).mockResolvedValueOnce({
			data: {},
			error: null,
		});

		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('change-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('success-alert')).toBeDefined();
		});
	});

	test('shows error alert with message when change fails', async () => {
		vi.mocked(client.changePassword).mockResolvedValueOnce({
			data: null,
			error: { message: 'Incorrect password' },
		});

		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('change-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Incorrect password',
			);
		});
	});

	test('shows fallback error message when change fails without message', async () => {
		vi.mocked(client.changePassword).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('change-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Could not update password. Please try again.',
			);
		});
	});

	test('clicking forgot password sends reset email and shows confirmation', async () => {
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<ChangePasswordForm email="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: 'user@example.com',
				redirectTo: '/reset-password',
			});
			expect(screen.getByTestId('forgot-sent-alert')).toBeDefined();
		});
	});
});
