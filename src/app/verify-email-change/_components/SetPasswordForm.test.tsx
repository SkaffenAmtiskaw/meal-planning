import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { verifyEmailChangeAndSetPassword } from '@/_actions/user';

import { SetPasswordForm } from './SetPasswordForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('./SignInWithNewEmailButton', () => ({
	SignInWithNewEmailButton: vi.fn(() => (
		<button data-testid="sign-in-link" type="button" />
	)),
}));

describe('SetPasswordForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows error when passwords do not match', async () => {
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

		expect(verifyEmailChangeAndSetPassword).not.toHaveBeenCalled();
	});

	it('calls action with token and password when passwords match', () => {
		render(<SetPasswordForm token="valid-token" />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByTestId('confirm-password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		expect(verifyEmailChangeAndSetPassword).toHaveBeenCalledWith(
			'valid-token',
			'password123',
		);
	});

	it('shows success state with sign-in link after successful submit', async () => {
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

	it('shows error alert when action returns error', async () => {
		vi.mocked(verifyEmailChangeAndSetPassword).mockResolvedValueOnce({
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
