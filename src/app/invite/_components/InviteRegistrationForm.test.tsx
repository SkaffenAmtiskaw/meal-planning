import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InviteRegistrationForm } from './InviteRegistrationForm';

// Mock Mantine components
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// Store the onSubmit handler so tests can call it directly
let capturedOnSubmit:
	| ((data: { name: string; password: string }) => Promise<void>)
	| null = null;

// Mock the RegistrationForm component
vi.mock('@/_components/RegistrationForm', () => ({
	RegistrationForm: vi.fn(
		({
			email,
			onSubmit,
			submitLabel,
			passwordLabel,
			showChangeEmail,
			message,
		}) => {
			const React = require('react');

			// Capture the onSubmit for tests to use
			capturedOnSubmit = onSubmit;

			return React.createElement(
				'div',
				{ 'data-testid': 'registration-form' },
				[
					React.createElement(
						'div',
						{ key: 'email', 'data-testid': 'rf-email' },
						email,
					),
					React.createElement(
						'div',
						{ key: 'submitLabel', 'data-testid': 'rf-submitLabel' },
						submitLabel,
					),
					React.createElement(
						'div',
						{ key: 'passwordLabel', 'data-testid': 'rf-passwordLabel' },
						passwordLabel,
					),
					React.createElement(
						'div',
						{ key: 'showChangeEmail', 'data-testid': 'rf-showChangeEmail' },
						String(showChangeEmail),
					),
					React.createElement(
						'div',
						{ key: 'message', 'data-testid': 'rf-message' },
						message || '',
					),
				],
			);
		},
	),
}));

// Mock signUpWithInvite action
const mockSignUpWithInvite = vi.fn();
vi.mock('@/_actions/planner/signUpWithInvite', () => ({
	signUpWithInvite: (...args: Parameters<typeof mockSignUpWithInvite>) =>
		mockSignUpWithInvite(...args),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

describe('InviteRegistrationForm', () => {
	const defaultProps = {
		email: 'test@example.com',
		plannerName: 'Family Meal Planner',
		token: 'abc123token',
	};

	beforeEach(() => {
		vi.resetAllMocks();
		capturedOnSubmit = null;
	});

	it('passes message prop with planner name to RegistrationForm', () => {
		render(<InviteRegistrationForm {...defaultProps} />);

		const messageElement = screen.getByTestId('rf-message');
		expect(messageElement).toBeDefined();
		expect(messageElement.textContent).toBe(
			'In order to join Family Meal Planner you must create an account.',
		);
	});

	it('renders RegistrationForm with correct props', () => {
		render(<InviteRegistrationForm {...defaultProps} />);

		expect(screen.getByTestId('registration-form')).toBeDefined();
		expect(screen.getByTestId('rf-email').textContent).toBe('test@example.com');
		expect(screen.getByTestId('rf-submitLabel').textContent).toBe(
			'Create Account',
		);
		expect(screen.getByTestId('rf-passwordLabel').textContent).toBe(
			'Create a password',
		);
	});

	it('passes showChangeEmail=false to RegistrationForm', () => {
		render(<InviteRegistrationForm {...defaultProps} />);

		expect(screen.getByTestId('rf-showChangeEmail').textContent).toBe('false');
	});

	it('calls signUpWithInvite on form submission', async () => {
		mockSignUpWithInvite.mockResolvedValueOnce({
			success: true,
			redirectUrl: '/dashboard',
		});

		render(<InviteRegistrationForm {...defaultProps} />);

		// Call the captured onSubmit handler directly
		expect(capturedOnSubmit).toBeDefined();
		await capturedOnSubmit?.({ name: 'Test User', password: 'password123' });

		expect(mockSignUpWithInvite).toHaveBeenCalledWith({
			token: 'abc123token',
			password: 'password123',
			name: 'Test User',
		});
	});

	it('passes token to signUpWithInvite', async () => {
		mockSignUpWithInvite.mockResolvedValueOnce({
			success: true,
			redirectUrl: '/dashboard',
		});

		render(
			<InviteRegistrationForm {...defaultProps} token="unique-token-xyz" />,
		);

		expect(capturedOnSubmit).toBeDefined();
		await capturedOnSubmit?.({ name: 'Test', password: 'pass123' });

		expect(mockSignUpWithInvite).toHaveBeenCalledWith(
			expect.objectContaining({ token: 'unique-token-xyz' }),
		);
	});

	it('redirects to URL from signUpWithInvite on success', async () => {
		mockSignUpWithInvite.mockResolvedValueOnce({
			success: true,
			redirectUrl: '/my-planner?success=true',
		});

		render(<InviteRegistrationForm {...defaultProps} />);

		expect(capturedOnSubmit).toBeDefined();
		await capturedOnSubmit?.({ name: 'Test', password: 'pass123' });

		expect(mockPush).toHaveBeenCalledWith('/my-planner?success=true');
	});

	it('throws error from signUpWithInvite to RegistrationForm', async () => {
		mockSignUpWithInvite.mockResolvedValueOnce({
			success: false,
			error: 'Invalid invite token',
		});

		render(<InviteRegistrationForm {...defaultProps} />);

		expect(capturedOnSubmit).toBeDefined();

		// The submit handler should throw when signUpWithInvite returns an error
		await expect(
			capturedOnSubmit?.({ name: 'Test', password: 'pass123' }),
		).rejects.toThrow('Invalid invite token');
	});

	it('handles missing redirectUrl gracefully', async () => {
		mockSignUpWithInvite.mockResolvedValueOnce({
			success: true,
			// no redirectUrl
		});

		render(<InviteRegistrationForm {...defaultProps} />);

		expect(capturedOnSubmit).toBeDefined();
		await capturedOnSubmit?.({ name: 'Test', password: 'pass123' });

		// Should not redirect if no redirectUrl
		expect(mockPush).not.toHaveBeenCalled();
	});
});
