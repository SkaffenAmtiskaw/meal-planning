import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import ResetPasswordPage from './page';

vi.mock('./_components/ResetPasswordForm', () => ({
	ResetPasswordForm: ({ token }: { token: string }) => (
		<div data-testid="reset-password-form" data-token={token} />
	),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('ResetPasswordPage', () => {
	test('shows invalid link message when no token is present', async () => {
		render(
			await ResetPasswordPage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(screen.getByText('Invalid reset link')).toBeDefined();
		expect(screen.getByTestId('back-to-sign-in-link')).toBeDefined();
	});

	test('renders reset password form when token is present', async () => {
		render(
			await ResetPasswordPage({
				searchParams: Promise.resolve({ token: 'abc123' }),
			}),
		);

		expect(screen.getByText('Reset your password')).toBeDefined();
		const form = screen.getByTestId('reset-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-token')).toBe('abc123');
	});
});
