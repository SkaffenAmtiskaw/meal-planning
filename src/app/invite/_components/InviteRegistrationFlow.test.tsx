import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { signUpWithInvite } from '@/_actions/sharing';
import { zSafeString } from '@/_utils/zSafeString';

import { InviteRegistrationFlow } from './InviteRegistrationFlow';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(() => ({
		safeParse: vi.fn(() => ({ success: true })),
	})),
}));

const mockPush = vi.fn();
const mockSignUpWithInvite = vi.mocked(signUpWithInvite);

describe('InviteRegistrationFlow', () => {
	const defaultProps = {
		email: 'test@example.com',
		token: 'abc123token',
	};

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

			await waitFor(() => {
				const button = screen.getByText('Create Account');
				expect(button.getAttribute('data-loading')).toBe('true');
			});
		});
	});

	describe('validation', () => {
		it('validates name with zSafeString when provided', () => {
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
			});

			render(<InviteRegistrationFlow {...defaultProps} />);

			const passwordInput = screen.getByTestId('input-Create a password');
			const submitButton = screen.getByText('Create Account');

			fireEvent.change(passwordInput, { target: { value: 'password123' } });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUpWithInvite).toHaveBeenCalled();
			});

			expect(mockPush).not.toHaveBeenCalled();
		});

		it('displays default error message when signUpWithInvite fails without error', async () => {
			mockSignUpWithInvite.mockResolvedValueOnce({
				success: false,
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
