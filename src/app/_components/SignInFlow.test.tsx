import { useSearchParams } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { client } from '@/_utils/auth';
import { zSafeString } from '@/_utils/zSafeString';

import {
	isNewStep,
	SignInFlow,
	type Step,
	validateNewStep,
} from './SignInFlow';

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

vi.mock('@/_hooks', async () => {
	const React = await import('react');
	return {
		useAsyncButton: () => {
			const [loading, setLoading] = React.useState(false);
			const [error, setError] = React.useState<string | null>(null);

			const run = async (fn: () => Promise<void>) => {
				setLoading(true);
				setError(null);
				try {
					await fn();
				} catch (err) {
					const errorMessage =
						err instanceof Error ? err.message : 'An unexpected error occurred';
					setError(errorMessage);
				} finally {
					setLoading(false);
				}
			};

			return { loading, error, run };
		},
	};
});

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

vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(),
}));

describe('SignInFlow', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(zSafeString).mockImplementation(
			() =>
				({
					safeParse: (val: string) => {
						const SAFE_STRING_REGEX = /^[a-zA-Z0-9 '.,-]+$/;
						if (!SAFE_STRING_REGEX.test(val)) {
							return {
								success: false,
								error: { issues: [{ message: 'Contains invalid characters' }] },
							};
						}
						return { success: true, data: val };
					},
				}) as unknown as ReturnType<typeof zSafeString>,
		);
	});

	describe('isNewStep type guard', () => {
		it('returns true for new step', () => {
			const step: Step = { type: 'new', email: 'test@example.com' };
			expect(isNewStep(step)).toBe(true);
		});

		it('returns false for idle step', () => {
			const step: Step = { type: 'idle' };
			expect(isNewStep(step)).toBe(false);
		});

		it('returns false for has-password step', () => {
			const step: Step = { type: 'has-password', email: 'test@example.com' };
			expect(isNewStep(step)).toBe(false);
		});

		it('returns false for social-only step', () => {
			const step: Step = { type: 'social-only', email: 'test@example.com' };
			expect(isNewStep(step)).toBe(false);
		});

		it('returns false for email-sent step', () => {
			const step: Step = { type: 'email-sent', email: 'test@example.com' };
			expect(isNewStep(step)).toBe(false);
		});

		it('returns false for forgot-password-sent step', () => {
			const step: Step = {
				type: 'forgot-password-sent',
				email: 'test@example.com',
			};
			expect(isNewStep(step)).toBe(false);
		});
	});

	describe('validateNewStep', () => {
		it('returns new step when given a new step', () => {
			const step: Step = { type: 'new', email: 'test@example.com' };
			const result = validateNewStep(step);
			expect(result).toEqual({ type: 'new', email: 'test@example.com' });
		});

		it('throws error when given idle step', () => {
			const step: Step = { type: 'idle' };
			expect(() => validateNewStep(step)).toThrow(
				'Invalid step type for signup',
			);
		});

		it('throws error when given has-password step', () => {
			const step: Step = { type: 'has-password', email: 'test@example.com' };
			expect(() => validateNewStep(step)).toThrow(
				'Invalid step type for signup',
			);
		});

		it('throws error when given social-only step', () => {
			const step: Step = { type: 'social-only', email: 'test@example.com' };
			expect(() => validateNewStep(step)).toThrow(
				'Invalid step type for signup',
			);
		});

		it('throws error when given email-sent step', () => {
			const step: Step = { type: 'email-sent', email: 'test@example.com' };
			expect(() => validateNewStep(step)).toThrow(
				'Invalid step type for signup',
			);
		});

		it('throws error when given forgot-password-sent step', () => {
			const step: Step = {
				type: 'forgot-password-sent',
				email: 'test@example.com',
			};
			expect(() => validateNewStep(step)).toThrow(
				'Invalid step type for signup',
			);
		});
	});

	describe('idle step', () => {
		it('renders Google sign-in button', () => {
			render(<SignInFlow />);

			expect(screen.getByTestId('google-sign-in-button')).toBeDefined();
		});

		it('renders email input and continue button', () => {
			render(<SignInFlow />);

			expect(screen.getByTestId('email-input')).toBeDefined();
			expect(screen.getByTestId('continue-button')).toBeDefined();
		});

		it('calls checkEmailStatus on continue', async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(checkEmailStatus).toHaveBeenCalledWith('user@example.com');
			});
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

		it('renders email display with change email button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('email-display')).toBeDefined();
				expect(screen.getByTestId('change-email-btn')).toBeDefined();
			});
		});

		it('renders password input and sign in button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('password-input')).toBeDefined();
				expect(screen.getByTestId('sign-in-button')).toBeDefined();
			});
		});

		it('calls client.signIn.email on sign in', async () => {
			vi.mocked(client.signIn.email).mockResolvedValueOnce({
				data: null,
				error: null,
			});

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

			await waitFor(() => {
				expect(client.signIn.email).toHaveBeenCalledWith({
					email: 'user@example.com',
					password: 'mypassword',
					callbackURL: '/',
				});
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

		it('renders forgot password button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('forgot-password-button')).toBeDefined();
			});
		});

		it('calls client.requestPasswordReset on forgot password', async () => {
			vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
				data: null,
				error: null,
			});

			render(<SignInFlow />);

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

		it('renders email display with change email button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('email-display')).toBeDefined();
				expect(screen.getByTestId('change-email-btn')).toBeDefined();
			});
		});

		it('renders name input', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('name-input')).toBeDefined();
			});
		});

		it('renders password input with create label', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('create-password-input')).toBeDefined();
			});
		});

		it('renders create account button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('create-account-button')).toBeDefined();
			});
		});

		it('calls client.signUp.email on submit', async () => {
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: null,
			});

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

			await waitFor(() => {
				expect(client.signUp.email).toHaveBeenCalledWith({
					email: 'new@example.com',
					password: 'password123',
					name: 'Test User',
					callbackURL: '/verify-email',
				});
			});
		});

		it('validates name with zSafeString', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'new@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('name-input'));

			fireEvent.change(screen.getByTestId('name-input'), {
				target: { value: '$evil' },
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
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: null,
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
				expect(client.signUp.email).toHaveBeenCalledWith(
					expect.objectContaining({ name: 'New User' }),
				);
			});
		});

		it('transitions to email-sent step on successful sign up', async () => {
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: null,
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

		it('renders change email button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('change-email-button')).toBeDefined();
			});
		});

		it('renders social-only warning alert', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('social-only-alert')).toBeDefined();
			});
		});

		it('renders forgot password button', async () => {
			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'google@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => {
				expect(screen.getByTestId('forgot-password-button')).toBeDefined();
			});
		});

		it('returns to idle when change email clicked', async () => {
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

	describe('email-sent step', () => {
		it('renders success alert with email', async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
			vi.mocked(client.signUp.email).mockResolvedValueOnce({
				data: null,
				error: null,
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
				const alert = screen.getByTestId('email-sent-alert');
				expect(alert).toBeDefined();
				expect(alert.textContent).toContain('new@example.com');
			});
		});
	});

	describe('forgot-password-sent step', () => {
		it('renders success alert with email', async () => {
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
			vi.mocked(client.requestPasswordReset).mockResolvedValueOnce({
				data: null,
				error: null,
			});

			render(<SignInFlow />);

			fireEvent.change(screen.getByTestId('email-input'), {
				target: { value: 'user@example.com' },
			});
			fireEvent.click(screen.getByTestId('continue-button'));

			await waitFor(() => screen.getByTestId('forgot-password-button'));

			fireEvent.click(screen.getByTestId('forgot-password-button'));

			await waitFor(() => {
				const alert = screen.getByTestId('forgot-password-sent-alert');
				expect(alert).toBeDefined();
				expect(alert.textContent).toContain('user@example.com');
			});
		});
	});

	describe('initialEmail prop', () => {
		it('auto-triggers email check when provided', async () => {
			// Set up deferred promise to control async flow
			let resolveCheckEmail!: (
				value: 'new' | 'has-password' | 'social-only',
			) => void;
			const checkEmailPromise = new Promise<
				'new' | 'has-password' | 'social-only'
			>((resolve) => {
				resolveCheckEmail = resolve;
			});
			vi.mocked(checkEmailStatus).mockReturnValueOnce(
				checkEmailPromise as Promise<import('@/_actions/auth').EmailStatus>,
			);

			render(<SignInFlow initialEmail="test@example.com" />);

			// Wait for the async effect to run and checkEmailStatus to be called
			await waitFor(() => {
				expect(checkEmailStatus).toHaveBeenCalledWith('test@example.com');
			});

			// Resolve the promise to continue
			resolveCheckEmail?.('has-password');

			// Now wait for the UI to update to has-password step
			await waitFor(() => {
				expect(screen.getByTestId('password-input')).toBeDefined();
			});
		});
	});

	describe('useSearchParams integration', () => {
		it('reads email from query params when no initialEmail prop', async () => {
			vi.mocked(useSearchParams).mockReturnValue(
				new URLSearchParams(
					'email=query@example.com',
				) as unknown as import('next/navigation').ReadonlyURLSearchParams,
			);
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

			render(<SignInFlow />);

			await waitFor(() => {
				expect(checkEmailStatus).toHaveBeenCalledWith('query@example.com');
			});
		});

		it('prefers initialEmail prop over query params', async () => {
			vi.mocked(useSearchParams).mockReturnValue(
				new URLSearchParams(
					'email=query@example.com',
				) as unknown as import('next/navigation').ReadonlyURLSearchParams,
			);
			vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

			render(<SignInFlow initialEmail="prop@example.com" />);

			await waitFor(() => {
				expect(checkEmailStatus).toHaveBeenCalledWith('prop@example.com');
				expect(checkEmailStatus).not.toHaveBeenCalledWith('query@example.com');
			});
		});
	});
});
