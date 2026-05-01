import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { zSafeString } from '@/_utils/zSafeString';

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

// Mock signUpWithInvite action with default implementation
const mockSignUpWithInvite = vi.fn();
vi.mock('@/_actions/planner/signUpWithInvite', () => ({
	signUpWithInvite: (...args: Parameters<typeof mockSignUpWithInvite>) =>
		mockSignUpWithInvite(...args),
}));

// Mock @/_hooks with centralized mock
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

// Mock zSafeString with simplified factory
vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(() => ({
		safeParse: vi.fn(),
	})),
}));

describe('InviteRegistrationFlow', () => {
	const defaultProps = {
		email: 'test@example.com',
		token: 'abc123token',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Set default mock behavior for zSafeString - success by default
		vi.mocked(zSafeString).mockReturnValue({
			safeParse: vi.fn().mockReturnValue({ success: true }),
		} as unknown as ReturnType<typeof zSafeString>);
		// Set a default resolved value that survives clears
		mockSignUpWithInvite.mockResolvedValue({ success: true, redirectUrl: '/' });
	});

	describe('form submission', () => {
		it('calls signUpWithInvite with token, password, and name', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(nameInput, { target: { value: 'Test User' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			expect(mockSignUpWithInvite).toHaveBeenCalledWith({
				token: 'abc123token',
				password: 'password123',
				name: 'Test User',
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
			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			// Loading state should be active immediately
			await waitFor(() => {
				const button = screen.getByText('Create Account');
				expect(button.getAttribute('data-loading')).toBe('true');
			});
		});
	});

	describe('validation', () => {
		it('validates name with zSafeString when provided', () => {
			// Control the mock to return an error
			vi.mocked(zSafeString).mockReturnValue({
				safeParse: vi.fn().mockReturnValue({
					success: false,
					error: { issues: [{ message: 'contains invalid characters' }] },
				}),
			} as unknown as ReturnType<typeof zSafeString>);

			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(nameInput, { target: { value: 'any-value' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			expect(screen.getByRole('alert')).toBeDefined();
			expect(
				screen.getByText('Name contains invalid characters'),
			).toBeDefined();
			expect(mockSignUpWithInvite).not.toHaveBeenCalled();
		});

		it('shows fallback error message when name validation fails without message', () => {
			// Control the mock to return error without issues
			vi.mocked(zSafeString).mockReturnValue({
				safeParse: vi.fn().mockReturnValue({
					success: false,
					error: { issues: undefined },
				}),
			} as unknown as ReturnType<typeof zSafeString>);

			render(<InviteRegistrationFlow {...defaultProps} />);

			const nameInput = screen.getByTestId('input-Name');
			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(nameInput, { target: { value: 'any-value' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			expect(screen.getByRole('alert')).toBeDefined();
			expect(screen.getByText('Name is invalid')).toBeDefined();
		});

		it('shows error when password < 8 characters', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'short' } });
			fireEvent.click(submitButton);

			expect(screen.getByRole('alert')).toBeDefined();
			expect(
				screen.getByText('Password must be at least 8 characters'),
			).toBeDefined();
		});

		it('allows empty name (defaults to New User)', () => {
			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			expect(mockSignUpWithInvite).toHaveBeenCalledWith({
				token: 'abc123token',
				password: 'password123',
				name: 'New User',
			});
		});
	});

	describe('edge cases', () => {
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

			// Wait for async completion
			await waitFor(() => {
				expect(mockSignUpWithInvite).toHaveBeenCalled();
			});

			// Should not redirect if no redirectUrl
			expect(mockPush).not.toHaveBeenCalled();
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
