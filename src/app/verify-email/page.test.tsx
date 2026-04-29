import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import VerifyEmailPage from './page';

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}));

vi.mock('./_components/ResendVerificationForm', () => ({
	ResendVerificationForm: () => <div data-testid="resend-form" />,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('VerifyEmailPage', () => {
	test('redirects to home when no error param', async () => {
		const { redirect } = await import('next/navigation');

		render(
			await VerifyEmailPage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(redirect).toHaveBeenCalledWith('/');
	});

	test('shows error UI and resend form when error param is present', async () => {
		render(
			await VerifyEmailPage({
				searchParams: Promise.resolve({ error: 'TOKEN_EXPIRED' }),
			}),
		);

		expect(screen.getByText('Verification link expired')).toBeDefined();
		expect(screen.getByTestId('resend-form')).toBeDefined();
	});
});
