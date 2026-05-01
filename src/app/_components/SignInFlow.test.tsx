import { useSearchParams } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { client } from '@/_utils/auth';
import { zSafeString } from '@/_utils/zSafeString';

import { SignInFlow } from './SignInFlow';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./AuthLayout', () => ({
	AuthLayoutSocialSection: vi.fn(({ children }) => (
		<div data-testid="auth-layout-social-section">{children}</div>
	)),
	AuthLayoutDivider: vi.fn(({ label }) => (
		<div data-testid="auth-layout-divider">{label}</div>
	)),
	AuthLayoutFormSection: vi.fn(({ children }) => (
		<div data-testid="auth-layout-form-section">{children}</div>
	)),
	AuthLayoutEmailDisplay: vi.fn(({ email, onChangeEmail, ...props }) => (
		<div data-testid="email-display" {...props}>
			<span>{email}</span>
			<button
				type="button"
				data-testid="change-email-btn"
				onClick={onChangeEmail}
			>
				Change
			</button>
		</div>
	)),
	AuthLayoutSubmitButton: vi.fn(({ children, ...props }) => (
		<button type="button" data-testid={props['data-testid']} {...props}>
			{children}
		</button>
	)),
	AuthLayoutFooter: vi.fn(({ children }) => (
		<div data-testid="auth-layout-footer">{children}</div>
	)),
	AuthLayoutAlert: vi.fn(({ children, color, ...props }) => (
		<div role="alert" data-testid={props['data-testid']} data-color={color}>
			{children}
		</div>
	)),
}));

vi.mock('next/navigation', () => ({
	useSearchParams: vi.fn(
		() =>
			new URLSearchParams() as unknown as import('next/navigation').ReadonlyURLSearchParams,
	),
}));

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('@/_actions/auth', () => ({
	checkEmailStatus: vi.fn(),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signIn: {
			social: vi.fn(),
			email: vi.fn().mockResolvedValue({ data: null, error: null }),
		},
		signUp: {
			email: vi.fn().mockResolvedValue({ data: null, error: null }),
		},
		requestPasswordReset: vi
			.fn()
			.mockResolvedValue({ data: null, error: null }),
	},
}));

vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(),
}));

describe('SignInFlow', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Set default mock behavior for zSafeString - success by default
		vi.mocked(zSafeString).mockReturnValue({
			safeParse: vi.fn().mockReturnValue({ success: true }),
		} as unknown as ReturnType<typeof zSafeString>);
	});

	describe('idle step', () => {
		it('displays only email input and Google sign-in initially', () => {
			render(<SignInFlow />);

			// Present in idle step
			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.getByTestId('google-sign-in-button')).toBeDefined();
			expect(screen.getByTestId('continue-button')).toBeDefined();

			// NOT present in idle step (appears in has-password step)
			expect(screen.queryByTestId('password-input')).toBeNull();
			expect(screen.queryByTestId('email-display')).toBeNull();
		});

		it('calls checkEmailStatus on continue', () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			expect(checkEmailStatus).toHaveBeenCalledWith('user@example.com');
		});

		it('displays error when checkEmailStatus fails', async () => {
			vi.mocked(checkEmailStatus).mockRejectedValueOnce(
				new Error('DB failure'),
			);

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(
					screen.getByTestId('continue-error-alert').textContent,
				).toContain('DB failure');
			});
		});

		it('calls client.signIn.social when Google button clicked', () => {
			render(<SignInFlow />);

			fireEvent.click(screen.getByTestId('google-sign-in-button'));

			expect(client.signIn.social).toHaveBeenCalledWith({ provider: 'google' });
		});
	});

	describe('has-password step', () => {
		beforeEach(async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		});

		it('displays password input and hides email/SSO after checkEmailStatus returns has-password', async () => {
			render(<SignInFlow />);

			// Initial state
			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.queryByTestId('password-input')).toBeNull();

			// Trigger transition
			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			// Wait for transition
			await waitFor(() => screen.getByTestId('password-input'));

			// Has-password step elements
			expect(screen.getByTestId('password-input')).toBeDefined();
			expect(screen.getByTestId('email-display')).toBeDefined();
			expect(screen.getByTestId('sign-in-button')).toBeDefined();
			expect(screen.getByTestId('forgot-password-button')).toBeDefined();

			// Idle step elements should be gone
			expect(screen.queryByTestId('email-input')).toBeNull();
			expect(screen.queryByTestId('google-sign-in-button')).toBeNull();
			expect(screen.queryByTestId('continue-button')).toBeNull();
		});

		it('calls client.signIn.email on sign in', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('password-input'));

			fireEvent.change(screen.getByTestId('password-input'), {
				target: { value: 'mypassword' },
			});
			fireEvent.click(screen.getByTestId('sign-in-button'));

			expect(client.signIn.email).toHaveBeenCalledWith({
				email: 'user@example.com',
				password: 'mypassword',
				callbackURL: '/',
			});
		});

		it('displays error on sign in failure', async () => {
			vi.mocked(client.signIn.email).mockResolvedValueOnce({
				data: null,
				error: { message: 'Invalid password' },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('password-input'));

			fireEvent.click(screen.getByTestId('sign-in-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signin-error-alert')).toBeDefined();
			});
		});

		it('displays default error message when sign in error has no message', async () => {
			vi.mocked(client.signIn.email).mockResolvedValueOnce({
				data: null,
				error: { message: undefined },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('password-input'));

			fireEvent.click(screen.getByTestId('sign-in-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signin-error-alert').textContent).toContain(
					'Invalid password. Please try again.',
				);
			});
		});

		it('calls client.requestPasswordReset on forgot password', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: 'user@example.com',
				redirectTo: '/reset-password',
			});
		});

		it('displays error when forgot password fails in has-password step', async () => {
			vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
				data: null,
				error: { message: 'Invalid email address' },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			await waitFor(() => {
				expect(
					screen.getByTestId('forgot-password-error-alert').textContent,
				).toContain('Invalid email address');
			});
		});

		it('transitions to forgot-password-sent step on successful password reset request', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			await waitFor(() => {
				expect(screen.getByTestId('forgot-password-sent-alert')).toBeDefined();
				expect(
					screen.getByTestId('forgot-password-sent-alert').textContent,
				).toContain('user@example.com');
			});
		});

		it('returns to idle when change email clicked', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('change-email-btn'));

			fireEvent.click(screen.getByTestId('change-email-btn'));

			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.getByTestId('continue-button')).toBeDefined();
		});
	});

	describe('new step', () => {
		beforeEach(async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		});

		it('displays name and password inputs and hides email/SSO after checkEmailStatus returns new', async () => {
			render(<SignInFlow />);

			// Initial state
			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.queryByTestId('create-password-input')).toBeNull();

			// Trigger transition
			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			// Wait for transition
			await waitFor(() => screen.getByTestId('name-input'));

			// New step elements
			expect(screen.getByTestId('name-input')).toBeDefined();
			expect(screen.getByTestId('create-password-input')).toBeDefined();
			expect(screen.getByTestId('create-account-button')).toBeDefined();
			expect(screen.getByTestId('email-display')).toBeDefined();

			// Idle step elements should be gone
			expect(screen.queryByTestId('email-input')).toBeNull();
			expect(screen.queryByTestId('google-sign-in-button')).toBeNull();
			expect(screen.queryByTestId('continue-button')).toBeNull();
		});

		it('calls client.signUp.email on submit', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('name-input'));

			fireEvent.change(screen.getByTestId('name-input'), {
				target: { value: 'Test User' },
			});
			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			expect(client.signUp.email).toHaveBeenCalledWith({
				email: 'new@example.com',
				password: 'password123',
				name: 'Test User',
				callbackURL: '/verify-email',
			});
		});

		it('displays validation error when name is invalid', async () => {
			// Override for this specific test: validation fails
			vi.mocked(zSafeString).mockReturnValue({
				safeParse: vi.fn().mockReturnValue({
					success: false,
					error: { issues: [{ message: 'Contains invalid characters' }] },
				}),
			} as unknown as ReturnType<typeof zSafeString>);

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('name-input'));

			// Enter any name - the mock will return error regardless of value
			fireEvent.change(screen.getByTestId('name-input'), {
				target: { value: 'Test User' },
			});
			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signup-error-alert').textContent).toContain(
					'Contains invalid characters',
				);
			});
			expect(client.signUp.email).not.toHaveBeenCalled();
		});

		it('displays error when password < 8 chars', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('name-input'));

			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'short' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signup-error-alert').textContent).toContain(
					'Password must be at least 8 characters',
				);
			});
			expect(client.signUp.email).not.toHaveBeenCalled();
		});

		it('defaults name to "New User" when empty', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('create-password-input'));

			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(client.signUp.email).toHaveBeenCalledWith(
					expect.objectContaining({ name: 'New User' }),
				);
			});
		});

		it('transitions to email-sent step on successful sign up', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('create-password-input'));

			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(screen.getByTestId('email-sent-alert')).toBeDefined();
			});
		});

		it('displays error when sign up fails with custom message', async () => {
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: { message: 'Email already in use' },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('create-password-input'));

			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signup-error-alert').textContent).toContain(
					'Email already in use',
				);
			});
		});

		it('displays default error message when sign up error has no message', async () => {
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: { message: undefined },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('create-password-input'));

			fireEvent.change(screen.getByTestId('create-password-input'), {
				target: { value: 'password123' },
			});
			fireEvent.click(screen.getByTestId('create-account-button'));

			await waitFor(() => {
				expect(screen.getByTestId('signup-error-alert').textContent).toContain(
					'Could not create account. Please try again.',
				);
			});
		});
	});

	describe('social-only step', () => {
		beforeEach(async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');
		});

		it('displays social-only warning and hides email/SSO after checkEmailStatus returns social-only', async () => {
			render(<SignInFlow />);

			// Initial state
			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.queryByTestId('social-only-alert')).toBeNull();

			// Trigger transition
			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			// Wait for transition
			await waitFor(() => screen.getByTestId('change-email-button'));

			// Social-only step elements
			expect(screen.getByTestId('social-only-alert')).toBeDefined();
			expect(screen.getByTestId('change-email-button')).toBeDefined();
			expect(screen.getByTestId('forgot-password-button')).toBeDefined();

			// Idle step elements should be gone
			expect(screen.queryByTestId('email-input')).toBeNull();
			expect(screen.queryByTestId('google-sign-in-button')).toBeNull();
			expect(screen.queryByTestId('continue-button')).toBeNull();
		});

		it('calls resetToIdle when change email button is clicked', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('change-email-button'));

			fireEvent.click(screen.getByTestId('change-email-button'));

			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.getByTestId('continue-button')).toBeDefined();
		});

		it('calls client.requestPasswordReset when forgot password button is clicked', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: 'google@example.com',
				redirectTo: '/reset-password',
			});
		});

		it('displays error when forgot password fails with custom message', async () => {
			vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
				data: null,
				error: { message: 'Rate limit exceeded' },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			await waitFor(() => {
				expect(
					screen.getByTestId('forgot-password-error-alert').textContent,
				).toContain('Rate limit exceeded');
			});
		});

		it('displays default error message when forgot password error has no message', async () => {
			vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
				data: null,
				error: { message: undefined },
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
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
	});

	describe('email from query params', () => {
		it('reads email from query params and triggers check', async () => {
			vi.mocked(useSearchParams).mockReturnValue(
				new URLSearchParams(
					'email=query@example.com',
				) as unknown as import('next/navigation').ReadonlyURLSearchParams,
			);

			render(<SignInFlow />);

			await waitFor(() => {
				expect(checkEmailStatus).toHaveBeenCalledWith('query@example.com');
			});
		});
	});
});
