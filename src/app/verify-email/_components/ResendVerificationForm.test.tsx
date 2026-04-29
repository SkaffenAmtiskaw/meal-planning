import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { ResendVerificationForm } from './ResendVerificationForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_utils/auth', () => ({
	client: {
		sendVerificationEmail: vi.fn(),
	},
}));

describe('ResendVerificationForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders email input and resend button', () => {
		render(<ResendVerificationForm />);

		expect(screen.getByTestId('resend-email-input')).toBeDefined();
		expect(screen.getByTestId('resend-button')).toBeDefined();
	});

	test('clicking resend calls sendVerificationEmail with entered email', async () => {
		vi.mocked(client.sendVerificationEmail).mockResolvedValueOnce({
			data: { status: true },
			error: null,
		});

		render(<ResendVerificationForm />);

		fireEvent.change(screen.getByTestId('resend-email-input'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByTestId('resend-button'));

		await waitFor(() => {
			expect(client.sendVerificationEmail).toHaveBeenCalledWith({
				email: 'user@example.com',
				callbackURL: '/verify-email',
			});
		});
	});

	test('shows success alert after successful resend', async () => {
		vi.mocked(client.sendVerificationEmail).mockResolvedValueOnce({
			data: { status: true },
			error: null,
		});

		render(<ResendVerificationForm />);

		fireEvent.click(screen.getByTestId('resend-button'));

		await waitFor(() => {
			expect(screen.getByTestId('resend-success-alert')).toBeDefined();
		});
	});

	test('shows error alert when resend fails with message', async () => {
		vi.mocked(client.sendVerificationEmail).mockResolvedValueOnce({
			data: null,
			error: { message: 'User not found' },
		});

		render(<ResendVerificationForm />);

		fireEvent.click(screen.getByTestId('resend-button'));

		await waitFor(() => {
			expect(screen.getByTestId('resend-error-alert')).toBeDefined();
		});
	});

	test('shows fallback error message when error has no message', async () => {
		vi.mocked(client.sendVerificationEmail).mockResolvedValueOnce({
			data: null,
			error: { message: undefined },
		});

		render(<ResendVerificationForm />);

		fireEvent.click(screen.getByTestId('resend-button'));

		await waitFor(() => {
			expect(screen.getByTestId('resend-error-alert').textContent).toContain(
				'Could not resend verification email. Please try again.',
			);
		});
	});
});
