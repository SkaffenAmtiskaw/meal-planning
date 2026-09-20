import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { ResetPasswordForm } from './ResetPasswordForm';

const mockPush = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@/_utils/auth', () => ({
	client: {
		resetPassword: vi.fn(),
	},
}));

describe('ResetPasswordForm', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows error when passwords do not match', async () => {
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

	it('calls resetPassword with token and new password when passwords match', async () => {
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

	it('redirects to home on successful password reset', async () => {
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
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});

	it('shows error alert with message when reset fails', async () => {
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

	it('shows fallback error message when reset fails without message', async () => {
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

	it('error alert includes a link back to sign in', async () => {
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
