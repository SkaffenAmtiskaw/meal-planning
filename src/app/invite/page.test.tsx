import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import Page from './page';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

vi.mock('./_components/InviteRegistrationFlow', () => ({
	InviteRegistrationFlow: vi.fn(() => (
		<div data-testid="invite-registration-flow" />
	)),
}));

vi.mock('./_components/ExpiredInviteView', () => ({
	ExpiredInviteView: vi.fn(() => <div data-testid="expired-invite-view" />),
}));

vi.mock('../_components/AuthLayout', () => ({
	AuthLayoutRoot: vi.fn(({ children }: { children: React.ReactNode }) => (
		<div data-testid="auth-layout-root">{children}</div>
	)),
	AuthLayoutHeader: vi.fn(({ children }: { children: React.ReactNode }) => (
		<div data-testid="auth-layout-header">{children}</div>
	)),
}));

vi.mock('@/_components', () => ({
	LinkButton: vi.fn(
		({ href, children }: { href: string; children: React.ReactNode }) => (
			<a href={href} data-testid="link-button">
				{children}
			</a>
		),
	),
}));

import { validateInviteToken } from '@/_actions/sharing';

const mockValidateInviteToken = vi.mocked(validateInviteToken);

describe('Invite Accept Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders InviteRegistrationFlow for valid token', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: true,
			email: 'test@example.com',
			plannerName: 'Test Planner',
		});

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'valid-token-123' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('invite-registration-flow')).toBeDefined();
		expect(
			screen.getByText(
				'In order to join Test Planner you must create an account.',
			),
		).toBeDefined();
	});

	it('renders ExpiredInviteView for expired token', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'expired',
			email: 'expired@example.com',
		});

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'expired-token' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('expired-invite-view')).toBeDefined();
	});

	it('renders ExpiredInviteView with empty email when not provided', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'expired',
		});

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'expired-token' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('expired-invite-view')).toBeDefined();
	});

	it('renders error state for invalid token', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'invalid',
		});

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'invalid-token' }),
		});
		render(PageComponent);

		expect(screen.getByText('Invalid Invite')).toBeDefined();
		expect(
			screen.getByText('This invite link is invalid or has already been used.'),
		).toBeDefined();
		expect(screen.getByTestId('link-button')).toBeDefined();
		expect(screen.getByText('Go to Sign In')).toBeDefined();
	});

	it('renders error state when token is missing', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'invalid',
		});

		const PageComponent = await Page({ searchParams: Promise.resolve({}) });
		render(PageComponent);

		expect(screen.getByText('Invalid Invite')).toBeDefined();
		expect(
			screen.getByText('This invite link is invalid or has already been used.'),
		).toBeDefined();
	});

	it('calls validateInviteToken with token from searchParams', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'invalid',
		});

		await Page({ searchParams: Promise.resolve({ token: 'my-test-token' }) });

		expect(mockValidateInviteToken).toHaveBeenCalledTimes(1);
		expect(mockValidateInviteToken).toHaveBeenCalledWith('my-test-token');
	});

	it('passes empty token to InviteRegistrationFlow when token is missing', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: true,
			email: 'test@example.com',
			plannerName: 'Test Planner',
		});

		const PageComponent = await Page({ searchParams: Promise.resolve({}) });
		render(PageComponent);

		expect(screen.getByTestId('invite-registration-flow')).toBeDefined();
	});
});
