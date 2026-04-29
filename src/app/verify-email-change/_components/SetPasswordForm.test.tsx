import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { SetPasswordForm } from './SetPasswordForm';

const mockVerifyEmailChangeAndSetPassword = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_actions/user', () => ({
	verifyEmailChangeAndSetPassword: (token: string, password: string) =>
		mockVerifyEmailChangeAndSetPassword(token, password),
}));

vi.mock('./SignInWithNewEmailButton', () => ({
	SignInWithNewEmailButton: () => (
		<button data-testid="sign-in-link" type="button" />
	),
}));

describe('SetPasswordForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders password inputs and submit button', () => {
		render(<SetPasswordForm token="valid-token" />);

		expect(screen.getByTestId('password-input')).toBeDefined();
		expect(screen.getByTestId('confirm-password-input')).toBeDefined();
		expect(screen.getByTestId('submit-button')).toBeDefined();
	});

	test('shows error when passwords do not match', async () => {
		render(<SetPasswordForm token="valid-token" />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'different123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Passwords do not match.',
			);
		});

		expect(mockVerifyEmailChangeAndSetPassword).not.toHaveBeenCalled();
	});

	test('calls action with token and password when passwords match', async () => {
		mockVerifyEmailChangeAndSetPassword.mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<SetPasswordForm token="valid-token" />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(mockVerifyEmailChangeAndSetPassword).toHaveBeenCalledWith(
				'valid-token',
				'password123',
			);
		});
	});

	test('shows success state with sign-in link after successful submit', async () => {
		mockVerifyEmailChangeAndSetPassword.mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<SetPasswordForm token="valid-token" />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('success-title')).toBeDefined();
			expect(screen.getByTestId('sign-in-link')).toBeDefined();
		});
	});

	test('shows error alert when action returns error', async () => {
		mockVerifyEmailChangeAndSetPassword.mockResolvedValueOnce({
			ok: false,
			error: 'This link is invalid or has expired.',
		});
		render(<SetPasswordForm token="valid-token" />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'This link is invalid or has expired.',
			);
		});
	});
});
