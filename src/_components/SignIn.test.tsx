import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { client } from '@/_utils/auth';

import { SignIn } from './SignIn';

vi.mock('@/_actions/auth', () => ({
	checkEmailStatus: vi.fn(),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signIn: {
			social: vi.fn(),
			email: vi.fn(),
		},
		signUp: {
			email: vi.fn(),
		},
		requestPasswordReset: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('sign in', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders google sign in button and email input in idle state', () => {
		render(<SignIn />, { wrapper });

		expect(screen.getByTestId('google-sign-in-button')).toBeDefined();
		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('continue-button')).toBeDefined();
	});

	test('clicking google button initiates google sign in', () => {
		render(<SignIn />, { wrapper });

		fireEvent.click(screen.getByTestId('google-sign-in-button'));

		expect(client.signIn.social).toHaveBeenCalledWith({ provider: 'google' });
	});

	test('continue shows error alert when checkEmailStatus throws', async () => {
		vi.mocked(checkEmailStatus).mockRejectedValueOnce(new Error('DB failure'));

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('continue-error-alert').textContent).toContain(
				'DB failure',
			);
		});
	});

	test('continue shows password field for existing user with password', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('sign-in-button')).toBeDefined();
			expect(screen.getByTestId('password-input')).toBeDefined();
			expect(screen.getByTestId('email-display')).toBeDefined();
		});
	});

	test('signing in calls client.signIn.email with email and password', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.signIn.email).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'mypassword' },
		});
		fireEvent.click(screen.getByTestId('sign-in-button'));

		await waitFor(() => {
			expect(client.signIn.email).toHaveBeenCalledWith({
				email: 'user@example.com',
				password: 'mypassword',
				callbackURL: '/',
			});
		});
	});

	test('sign in error shows error alert', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.signIn.email).mockResolvedValueOnce({
			data: null,
			error: { message: 'Invalid password' },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.click(screen.getByTestId('sign-in-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});
	});

	test('sign in error falls back to default message when error has no message', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.signIn.email).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.click(screen.getByTestId('sign-in-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Invalid password. Please try again.',
			);
		});
	});

	test('continue shows create password and name fields for new user', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('sign-up-button')).toBeDefined();
			expect(screen.getByTestId('name-input')).toBeDefined();
			expect(screen.getByTestId('password-input')).toBeDefined();
		});
	});

	test('sign up with a name passes the entered name', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('name-input'));

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: 'Ariel' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(client.signUp.email).toHaveBeenCalledWith({
				email: 'new@example.com',
				password: 'newpassword',
				name: 'Ariel',
				callbackURL: '/verify-email',
			});
			expect(screen.getByTestId('email-sent-alert')).toBeDefined();
		});
	});

	test('sign up without a name defaults to "New User"', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(client.signUp.email).toHaveBeenCalledWith({
				email: 'new@example.com',
				password: 'newpassword',
				name: 'New User',
				callbackURL: '/verify-email',
			});
		});
	});

	test('sign up with whitespace-only name defaults to "New User"', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('name-input'));

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: '   ' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'newpassword' },
		});
		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(client.signUp.email).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'New User' }),
			);
		});
	});

	test('sign up with invalid name shows error and does not call signUp', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('name-input'));

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: '$evil' },
		});
		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Contains invalid characters',
			);
		});
		expect(client.signUp.email).not.toHaveBeenCalled();
	});

	test('sign up error shows error alert', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: { message: 'Email already in use' },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});
	});

	test('sign up error falls back to default message when error has no message', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Could not create account. Please try again.',
			);
		});
	});

	test('continue shows social-only alert for social-only user', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'google@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('social-only-alert')).toBeDefined();
		});
	});

	test('change email button on social-only returns to idle state', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'google@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('change-email-button'));

		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('continue-button')).toBeDefined();
	});

	test('change email button returns to idle state', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('change-email-button'));

		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('continue-button')).toBeDefined();
	});

	test('forgot password button shown in has-password step', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('forgot-password-button')).toBeDefined();
		});
	});

	test('clicking forgot password in has-password step sends reset email and shows confirmation', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('forgot-password-button'));

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: 'user@example.com',
				redirectTo: '/reset-password',
			});
			expect(screen.getByTestId('forgot-password-sent-alert')).toBeDefined();
		});
	});

	test('forgot password error shows alert in has-password step', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: { message: 'Reset failed' },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('forgot-password-button'));

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(
				screen.getByTestId('forgot-password-error-alert').textContent,
			).toContain('Reset failed');
		});
	});

	test('forgot password error falls back to default message when error has no message', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('forgot-password-button'));

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(
				screen.getByTestId('forgot-password-error-alert').textContent,
			).toContain('Could not send reset email. Please try again.');
		});
	});

	test('forgot password button shown in social-only step', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'google@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('forgot-password-button')).toBeDefined();
		});
	});

	test('forgot password error shows alert in social-only step', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: { message: 'Reset failed' },
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'google@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('forgot-password-button'));

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(
				screen.getByTestId('forgot-password-error-alert').textContent,
			).toContain('Reset failed');
		});
	});

	test('clicking forgot password in social-only step sends reset email and shows confirmation', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');
		vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />, { wrapper });

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'google@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('forgot-password-button'));

		fireEvent.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: 'google@example.com',
				redirectTo: '/reset-password',
			});
			expect(screen.getByTestId('forgot-password-sent-alert')).toBeDefined();
		});
	});
});
