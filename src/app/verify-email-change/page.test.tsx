import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';

import VerifyEmailChangePage from './page';

const { mockCheckEmailStatus, mockVerifyEmailChange } = vi.hoisted(() => ({
	mockCheckEmailStatus: vi.fn(),
	mockVerifyEmailChange: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
	},
}));

vi.mock('@/_actions/auth', () => ({
	checkEmailStatus: (email: string) => mockCheckEmailStatus(email),
}));

vi.mock('@/_actions/user', () => ({
	verifyEmailChange: (token: string) => mockVerifyEmailChange(token),
}));

vi.mock('./_components/SignInWithNewEmailButton', () => ({
	SignInWithNewEmailButton: () => (
		<button data-testid="sign-in-link" type="button" />
	),
}));

vi.mock('./_components/SetPasswordForm', () => ({
	SetPasswordForm: ({ token }: { token: string }) => (
		<div data-testid="set-password-form" data-token={token} />
	),
}));

vi.mock('@mantine/core', () => ({
	Center: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Title: ({
		children,
		...props
	}: {
		children: React.ReactNode;
		[key: string]: unknown;
	}) => <h1 {...props}>{children}</h1>,
	Text: ({
		children,
		...props
	}: {
		children: React.ReactNode;
		[key: string]: unknown;
	}) => <p {...props}>{children}</p>,
	Anchor: ({
		children,
		...props
	}: {
		children: React.ReactNode;
		[key: string]: unknown;
	}) => <a {...props}>{children}</a>,
}));

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

describe('VerifyEmailChangePage', () => {
	test('shows invalid link when no token in search params', async () => {
		render(await VerifyEmailChangePage({ searchParams: makeSearchParams() }));

		expect(screen.getByTestId('invalid-title')).toBeDefined();
	});

	test('shows expired link when token not found in database', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'unknown-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	test('shows expired link when pending change is missing', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi
				.fn()
				.mockResolvedValue(makeMockUser({ pendingEmailChange: null })),
		} as never);

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	test('shows expired link when token is past expiry', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(
				makeMockUser({
					pendingEmailChange: {
						email: 'new@example.com',
						token: 'expired-token',
						expiresAt: pastDate,
					},
				}),
			),
		} as never);

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'expired-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	test('shows set-password form for SSO-only users with token', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockCheckEmailStatus.mockResolvedValueOnce('social-only');

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		const form = screen.getByTestId('set-password-form');
		expect(form).toBeDefined();
		expect(form.getAttribute('data-token')).toBe('valid-token');
	});

	test('calls verifyEmailChange with the token for password users', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockVerifyEmailChange.mockResolvedValueOnce({ ok: true, data: undefined });

		await VerifyEmailChangePage({
			searchParams: makeSearchParams({ token: 'valid-token' }),
		});

		expect(mockVerifyEmailChange).toHaveBeenCalledWith('valid-token');
	});

	test('shows expired link when verifyEmailChange action fails', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockVerifyEmailChange.mockResolvedValueOnce({
			ok: false,
			error: 'This link is invalid or has expired.',
		});

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(screen.getByTestId('expired-title')).toBeDefined();
	});

	test('shows success message with new email on successful change', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockCheckEmailStatus.mockResolvedValueOnce('has-password');
		mockVerifyEmailChange.mockResolvedValueOnce({ ok: true, data: undefined });

		render(
			await VerifyEmailChangePage({
				searchParams: makeSearchParams({ token: 'valid-token' }),
			}),
		);

		expect(screen.getByTestId('success-title')).toBeDefined();
		expect(screen.getByTestId('success-message').textContent).toContain(
			'new@example.com',
		);
		expect(screen.getByTestId('sign-in-link')).toBeDefined();
	});
});
