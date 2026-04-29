import { useSearchParams } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { client } from '@/_utils/auth';
import { zSafeString } from '@/_utils/zSafeString';

import { SignIn } from './SignIn';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useSearchParams: vi.fn(
		() =>
			new URLSearchParams() as unknown as import('next/navigation').ReadonlyURLSearchParams,
	),
}));

// Mock useAsyncButton to also track errors for the RegistrationForm mock
vi.mock('@/_hooks', async () => {
	const actual = await vi.importActual('@/_hooks');
	const React = await import('react');
	return {
		...actual,
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
					// Also set the global handleSignUpError so the RegistrationForm mock can detect it
					handleSignUpError = errorMessage;
				} finally {
					setLoading(false);
				}
			};

			return { loading, error, run };
		},
	};
});

// Shared state to track form submission errors
let submissionErrorState: string | null = null;

// Track errors from SignIn's handleSignUp validation
let handleSignUpError: string | null = null;

vi.mock('./RegistrationForm', async () => {
	const React = await import('react');
	return {
		setLastSubmissionError: (error: string | null) => {
			submissionErrorState = error;
		},
		getLastSubmissionError: () => submissionErrorState,
		// Allow tests to set handleSignUp validation errors
		setHandleSignUpError: (error: string | null) => {
			handleSignUpError = error;
		},
		getHandleSignUpError: () => handleSignUpError,
		RegistrationForm: vi.fn(
			({
				email,
				onSubmit,
				submitLabel,
				passwordLabel,
				showChangeEmail,
				onChangeEmail,
			}: {
				email: string;
				onSubmit: (data: { name: string; password: string }) => Promise<void>;
				submitLabel: string;
				passwordLabel: string;
				showChangeEmail?: boolean;
				onChangeEmail?: () => void;
			}) => {
				const [name, setName] = React.useState('');
				const [password, setPassword] = React.useState('');
				const [error, setError] = React.useState<string | null>(null);

				const handleSubmit = async () => {
					try {
						setError(null);
						submissionErrorState = null;
						handleSignUpError = null;

						// Don't validate name here - let handleSignUp validate
						// Validate password length
						if (password.length < 8) {
							throw new Error('Password must be at least 8 characters');
						}

						await onSubmit({ name, password });

						// After onSubmit completes, check if handleSignUp set a validation error
						// This is needed because useAsyncButton catches errors and doesn't re-throw
						if (handleSignUpError) {
							throw new Error(handleSignUpError);
						}

						// Check if there was an error during submission
						if (submissionErrorState) {
							throw new Error(submissionErrorState);
						}
					} catch (e) {
						const errorMessage =
							e instanceof Error ? e.message : 'An error occurred';
						setError(errorMessage);
					}
				};

				return React.createElement(
					'div',
					{ 'data-testid': 'registration-form' },
					React.createElement(
						'span',
						{ 'data-testid': 'registration-email' },
						email,
					),
					React.createElement(
						'span',
						{ 'data-testid': 'registration-submit-label' },
						submitLabel,
					),
					React.createElement(
						'span',
						{ 'data-testid': 'registration-password-label' },
						passwordLabel,
					),
					React.createElement(
						'span',
						{ 'data-testid': 'registration-show-change-email' },
						String(showChangeEmail),
					),
					React.createElement('input', {
						'data-testid': 'name-input',
						placeholder: 'New User',
						value: name,
						onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value),
					}),
					React.createElement('input', {
						'data-testid': 'password-input',
						type: 'password',
						placeholder: 'At least 8 characters',
						value: password,
						onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value),
					}),
					error &&
						React.createElement(
							'div',
							{ role: 'alert', 'data-testid': 'error-alert' },
							error,
						),
					React.createElement(
						'button',
						{
							type: 'button',
							'data-testid': 'sign-up-button',
							onClick: handleSubmit,
						},
						submitLabel,
					),
					showChangeEmail &&
						React.createElement(
							'button',
							{
								type: 'button',
								'data-testid': 'change-email-button',
								onClick: onChangeEmail,
							},
							'Change email',
						),
				);
			},
		),
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

describe('sign in', () => {
	beforeEach(() => {
		// Setup default mock for zSafeString to return a working validator
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

	afterEach(() => {
		vi.resetAllMocks();
		submissionErrorState = null;
	});

	test('renders google sign in button and email input in idle state', () => {
		render(<SignIn />);

		expect(screen.getByTestId('google-sign-in-button')).toBeDefined();
		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('continue-button')).toBeDefined();
	});

	test('clicking google button initiates google sign in', () => {
		render(<SignIn />);

		fireEvent.click(screen.getByTestId('google-sign-in-button'));

		expect(client.signIn.social).toHaveBeenCalledWith({ provider: 'google' });
	});

	test('continue shows error alert when checkEmailStatus throws', async () => {
		vi.mocked(checkEmailStatus).mockRejectedValueOnce(new Error('DB failure'));

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('name-input'));

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: '$evil' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
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

		render(<SignIn />);

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

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('password-input'));

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('sign-up-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Could not create account. Please try again.',
			);
		});
	});

	test('continue shows social-only alert for social-only user', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

		render(<SignIn />);

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

describe('SignIn with RegistrationForm', () => {
	beforeEach(() => {
		// Setup default mock for zSafeString to return a working validator
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

	afterEach(() => {
		vi.resetAllMocks();
		submissionErrorState = null;
	});

	test('uses RegistrationForm for new user step', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(screen.getByTestId('registration-form')).toBeDefined();
			expect(screen.getByTestId('registration-email').textContent).toBe(
				'new@example.com',
			);
		});
	});

	test('passes showChangeEmail=true to RegistrationForm', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => {
			expect(
				screen.getByTestId('registration-show-change-email').textContent,
			).toBe('true');
			expect(screen.getByTestId('change-email-button')).toBeDefined();
		});
	});

	test('calls resetToIdle when change email clicked', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('change-email-button'));

		fireEvent.click(screen.getByTestId('change-email-button'));

		// Should return to idle state
		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('continue-button')).toBeDefined();
	});

	test('pre-fills email from query param on mount', async () => {
		const mockSearchParams = new URLSearchParams();
		mockSearchParams.set('email', 'prefilled@example.com');
		vi.mocked(useSearchParams).mockReturnValue(
			mockSearchParams as unknown as import('next/navigation').ReadonlyURLSearchParams,
		);

		render(<SignIn />);

		// Should pre-fill the email input
		await waitFor(() => {
			const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
			expect(emailInput.value).toBe('prefilled@example.com');
		});
	});

	test('skips to appropriate step when email provided in query', async () => {
		const mockSearchParams = new URLSearchParams();
		mockSearchParams.set('email', 'existing@example.com');
		vi.mocked(useSearchParams).mockReturnValue(
			mockSearchParams as unknown as import('next/navigation').ReadonlyURLSearchParams,
		);

		// Set up the mock BEFORE rendering
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

		render(<SignIn />);

		// Wait for the async effect to run and checkEmailStatus to be called
		await waitFor(() => {
			expect(checkEmailStatus).toHaveBeenCalledWith('existing@example.com');
		});

		// Resolve the promise to continue
		resolveCheckEmail?.('has-password');

		// Now wait for the UI to update to has-password step
		await waitFor(() => {
			expect(screen.getByTestId('sign-in-button')).toBeDefined();
			expect(screen.getByTestId('email-display').textContent).toBe(
				'existing@example.com',
			);
		});
	});

	test('calls handleSignUp with name and password from RegistrationForm', async () => {
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('new');
		vi.mocked(client.signUp.email).mockResolvedValueOnce({
			data: null,
			error: null,
		});

		render(<SignIn />);

		fireEvent.change(screen.getByTestId('email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('continue-button'));

		await waitFor(() => screen.getByTestId('registration-form'));

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
});
