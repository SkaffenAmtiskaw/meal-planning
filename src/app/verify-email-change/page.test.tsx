import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkEmailStatus } from '@/_actions/auth';
import { verifyEmailChange } from '@/_actions/user';
import { User } from '@/_models/user';

import VerifyEmailChangePage from './page';

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('./_components/SignInWithNewEmailButton', async () => ({
	SignInWithNewEmailButton: vi.fn(() => (
		<button data-testid="sign-in-link" type="button" />
	)),
}));

vi.mock('./_components/SetPasswordForm', async () => ({
	SetPasswordForm: vi.fn(({ token }: { token: string }) => (
		<div data-testid="set-password-form" data-token={token} />
	)),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
const pastDate = new Date(Date.now() - 1000 * 60 * 60);

const makeSearchParams = (params: Record<string, string> = {}) =>
	Promise.resolve(params);

const makeMockUser = (overrides = {}) => ({
	email: 'user@example.com',
	pendingEmailChange: {
		email: 'new@example.com',
		token: 'valid-token',
		expiresAt: futureDate,
	},
	...overrides,
});

const givenUserFindOneReturns = (user: unknown) => {
	vi.mocked(User.findOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(user),
	} as never);
};

describe('VerifyEmailChangePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows invalid link when no token in search params', async () => {
		render(await VerifyEmailChangePage({ searchParams: makeSearchParams() }));

		expect(screen.getByTestId('invalid-title')).toBeDefined();
	});

	it('shows expired link when token not found in database', async () => {
		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'unknown-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	it('shows expired link when pending change is missing', async () => {
		givenUserFindOneReturns(makeMockUser({ pendingEmailChange: null }));

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	it('shows expired link when token is past expiry', async () => {
		givenUserFindOneReturns(
			makeMockUser({
				pendingEmailChange: {
					email: 'new@example.com',
					token: 'expired-token',
					expiresAt: pastDate,
				},
			}),
		);

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'expired-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	it('shows set-password form for SSO-only users with token', async () => {
		givenUserFindOneReturns(makeMockUser());
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('social-only');

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(vi.mocked(checkEmailStatus)).toHaveBeenCalledWith(
			'user@example.com',
		);
		const form = screen.getByTestId('set-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-token')).toBe('valid-token');
	});

	it('shows expired link when verifyEmailChange action fails', async () => {
		givenUserFindOneReturns(makeMockUser());
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');
		vi.mocked(verifyEmailChange).mockResolvedValueOnce({
			ok: false,
			error: 'This link is invalid or has expired.',
		});

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(vi.mocked(checkEmailStatus)).toHaveBeenCalledWith(
			'user@example.com',
		);
		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	it('shows success message with new email on successful change', async () => {
		givenUserFindOneReturns(makeMockUser());
		vi.mocked(checkEmailStatus).mockResolvedValueOnce('has-password');

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(vi.mocked(checkEmailStatus)).toHaveBeenCalledWith(
			'user@example.com',
		);
		expect(vi.mocked(verifyEmailChange)).toHaveBeenCalledWith('valid-token');
		expect(screen.getByTestId('success-title')).toBeDefined();
		expect(screen.getByTestId('success-message').textContent).toContain(
			'new@example.com',
		);
		expect(screen.getByTestId('sign-in-link')).toBeDefined();
	});
});
