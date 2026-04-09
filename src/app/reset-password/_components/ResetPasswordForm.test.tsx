import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { ResetPasswordForm } from './ResetPasswordForm';

const { mockRouterPush } = vi.hoisted(() => ({
	mockRouterPush: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		resetPassword: vi.fn(),
	},
}));

describe('ResetPasswordForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders new password and confirm password inputs', () => {
		render(<ResetPasswordForm token="abc123" />);

		expect(screen.getByTestId('new-password-input')).toBeDefined();
		expect(screen.getByTestId('confirm-password-input')).toBeDefined();
		expect(screen.getByTestId('reset-password-button')).toBeDefined();
	});

	test('shows error when passwords do not match', async () => {
		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'password1' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password2' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Passwords do not match.',
			);
		});

		expect(client.resetPassword).not.toHaveBeenCalled();
	});

	test('calls resetPassword with token and new password when passwords match', async () => {
		vi.mocked(client.resetPassword).mockResolvedValueOnce({
			data: {},
			error: null,
		});

		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(client.resetPassword).toHaveBeenCalledWith({
				token: 'abc123',
				newPassword: 'newpassword',
			});
		});
	});

	test('redirects to home on successful password reset', async () => {
		vi.mocked(client.resetPassword).mockResolvedValueOnce({
			data: {},
			error: null,
		});

		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(mockRouterPush).toHaveBeenCalledWith('/');
		});
	});

	test('shows error alert with message when reset fails', async () => {
		vi.mocked(client.resetPassword).mockResolvedValueOnce({
			data: null,
			error: { message: 'Token expired' },
		});

		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Token expired',
			);
		});
	});

	test('shows fallback error message when reset fails without message', async () => {
		vi.mocked(client.resetPassword).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Could not reset password. The link may have expired.',
			);
		});
	});

	test('error alert includes a link back to sign in', async () => {
		vi.mocked(client.resetPassword).mockResolvedValueOnce({
			data: null,
			error: { message: 'Token expired' },
		});

		render(<ResetPasswordForm token="abc123" />);

		fireEvent.change(screen.getByTestId('new-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('reset-password-button'));

		await waitFor(() => {
			expect(screen.getByTestId('back-to-sign-in-link')).toBeDefined();
		});
	});
});
