import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InviteRegistrationFlow } from './InviteRegistrationFlow';

// Mock Mantine components
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// Mock AuthLayout components
vi.mock('../../_components/AuthLayout', () => ({
	AuthLayoutAlert: vi.fn(({ children }) => <div role="alert">{children}</div>),
	AuthLayoutEmailDisplay: vi.fn(({ email }) => <div>{email}</div>),
	AuthLayoutFormSection: vi.fn(({ children }) => <div>{children}</div>),
	AuthLayoutSubmitButton: vi.fn(({ children, loading }) => (
		<button type="submit" data-loading={loading}>
			{children}
		</button>
	)),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

// Mock signUpWithInvite action
const mockSignUpWithInvite = vi.fn();
vi.mock('@/_actions/planner/signUpWithInvite', () => ({
	signUpWithInvite: (...args: Parameters<typeof mockSignUpWithInvite>) =>
		mockSignUpWithInvite(...args),
}));

// Mock useAsyncButton hook with a factory that maintains state across renders
let mockLoadingValue = false;
let mockErrorValue: string | null = null;

vi.mock('@/_hooks', () => ({
	useAsyncButton: () => {
		const [loading, setLoading] = React.useState(mockLoadingValue);
		const [error, setError] = React.useState<string | null>(mockErrorValue);

		// Update refs when state changes for test assertions
		mockLoadingValue = loading;
		mockErrorValue = error;

		return {
			loading,
			error,
			run: (_fn: () => Promise<void>) => {
				setLoading(true);
				setError(null);
				return _fn()
					.then(() => {
						setLoading(false);
					})
					.catch((err: Error) => {
						const errorMessage =
							err instanceof Error
								? err.message
								: 'An unexpected error occurred';
						setError(errorMessage);
						setLoading(false);
						// Don't re-throw to avoid unhandled rejection
					});
			},
		};
	},
}));

// Track if we want to test the fallback error message case
let useFallbackError = false;

// Mock zSafeString
vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: () => ({
		safeParse: (val: string) => {
			const SAFE_STRING_REGEX = /^[a-zA-Z0-9 '.,-]+$/;
			if (!val || val.trim() === '') {
				return { success: true };
			}
			if (val.length > 50) {
				return {
					success: false,
					error: { issues: [{ message: 'Must be 50 characters or fewer' }] },
				};
			}
			if (!SAFE_STRING_REGEX.test(val)) {
				// Return error with undefined issues to test fallback message
				if (useFallbackError) {
					return { success: false, error: { issues: undefined } };
				}
				return {
					success: false,
					error: { issues: [{ message: 'contains invalid characters' }] },
				};
			}
			return { success: true };
		},
	}),
}));

// Need React for the mock
import React from 'react';

describe('InviteRegistrationFlow', () => {
	const defaultProps = {
		email: 'test@example.com',
		token: 'abc123token',
	};

	beforeEach(() => {
		vi.resetAllMocks();
		mockLoadingValue = false;
		mockErrorValue = null;
		useFallbackError = false;
	});

	describe('rendering', () => {
		it('displays the email address', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			expect(screen.getByText('test@example.com')).toBeDefined();
		});

		it('does not show change email button', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			expect(screen.queryByTestId('change-email-btn')).toBeNull();
		});

		it('renders name input', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			expect(screen.getByTestId('input-Name')).toBeDefined();
		});

		it('renders password input with create label', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			expect(passwordInput).toBeDefined();
			expect(passwordInput.getAttribute('type')).toBe('password');
		});

		it('renders create account button', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			expect(screen.getByText('Create Account')).toBeDefined();
		});
	});

	describe('form submission', () => {
		it('calls signUpWithInvite with token, password, and name', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				redirectUrl: '/dashboard',
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(nameInput, { target: { value: 'Test User' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUpWithInvite).toHaveBeenCalledWith({
					token: 'abc123token',
					password: 'password123',
					name: 'Test User',
				});
			});
		});

		it('redirects to URL on success', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				redirectUrl: '/my-planner?success=true',
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith('/my-planner?success=true');
			});
		});

		it('displays error on failure', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: false,
				error: 'Invalid invite token',
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeDefined();
				expect(screen.getByText('Invalid invite token')).toBeDefined();
			});
		});

		it('shows loading state during submission', async () => {
			// Create a promise that won't resolve immediately to test loading state
			let resolveSignUp!: (value: {
				success: boolean;
				redirectUrl?: string;
			}) => void;
			const signUpPromise = new Promise<{
				success: boolean;
				redirectUrl?: string;
			}>((resolve) => {
				resolveSignUp = resolve;
			});
			mockSignUpWithInvite.mockReturnValueOnce(signUpPromise);

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			// Check that loading state is active
			await waitFor(() => {
				const button = screen.getByText('Create Account');
				expect(button.getAttribute('data-loading')).toBe('true');
			});

			// Resolve the promise
			resolveSignUp?.({ success: true, redirectUrl: '/' });
		});
	});

	describe('validation', () => {
		it('validates name with zSafeString when provided', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				redirectUrl: '/dashboard',
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			// Name with invalid characters
			fireEvent.change(nameInput, { target: { value: 'Test@User!' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeDefined();
				expect(
					screen.getByText('Name contains invalid characters'),
				).toBeDefined();
			});
		});

		it('shows fallback error message when name validation fails without message', async () => {
			useFallbackError = true;

			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			// Name with invalid characters - mock will return error without issues
			fireEvent.change(nameInput, { target: { value: 'Test@User!' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeDefined();
				expect(screen.getByText('Name is invalid')).toBeDefined();
			});
		});

		it('shows error when password < 8 characters', async () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'short' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeDefined();
				expect(
					screen.getByText('Password must be at least 8 characters'),
				).toBeDefined();
			});
		});

		it('allows empty name (defaults to New User)', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				redirectUrl: '/dashboard',
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUpWithInvite).toHaveBeenCalledWith({
					token: 'abc123token',
					password: 'password123',
					name: 'New User',
				});
			});
		});
	});

	describe('props', () => {
		it('passes token to signUpWithInvite', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				redirectUrl: '/dashboard',
			});

			render(
				<InviteRegistrationFlow {...defaultProps} token="unique-token-xyz" />,
			);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUpWithInvite).toHaveBeenCalledWith(
					expect.objectContaining({ token: 'unique-token-xyz' }),
				);
			});
		});

		it('handles missing redirectUrl gracefully', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: true,
				// no redirectUrl
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				// Should not redirect if no redirectUrl
				expect(mockPush).not.toHaveBeenCalled();
			});
		});

		it('displays default error message when signUpWithInvite fails without error', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: false,
				// no error message
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeDefined();
				expect(screen.getByText('Registration failed')).toBeDefined();
			});
		});
	});
});
