import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import VerifyEmailPage from './page';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('./_components/ResendVerificationForm', () => ({
	ResendVerificationForm: vi.fn(() => null),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('VerifyEmailPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects to home when no error param', async () => {
		render(await VerifyEmailPage({ searchParams: Promise.resolve({}) }));
		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('shows error UI when error param is present', async () => {
		render(
			await VerifyEmailPage({
				searchParams: Promise.resolve({ error: 'TOKEN_EXPIRED' }),
			}),
		);
		expect(screen.getByText('Verification link expired')).toBeDefined();
	});
});
