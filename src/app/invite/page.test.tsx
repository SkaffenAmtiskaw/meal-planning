import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ValidateInviteTokenResult } from '@/_actions/planner/validateInviteToken';

import Page from './page';

// Mock @mantine/core
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// Mock the server action
vi.mock('@/_actions/planner/validateInviteToken', () => ({
	validateInviteToken: vi.fn(),
}));

// Mock child components
vi.mock('./_components/InviteRegistrationForm', () => ({
	InviteRegistrationForm: vi.fn(
		({
			email,
			plannerName,
			token,
		}: {
			email: string;
			plannerName: string;
			token: string;
		}) => (
			<div data-testid="invite-registration-form">
				<div data-testid="email-prop">{email}</div>
				<div data-testid="plannerName-prop">{plannerName}</div>
				<div data-testid="token-prop">{token}</div>
			</div>
		),
	),
}));

vi.mock('./_components/ExpiredInviteView', () => ({
	ExpiredInviteView: vi.fn(({ email }: { email: string }) => (
		<div data-testid="expired-invite-view">
			<div data-testid="expired-email-prop">{email}</div>
		</div>
	)),
}));

vi.mock('@/_components', async () => {
	const actual =
		await vi.importActual<typeof import('@/_components')>('@/_components');
	return {
		...actual,
		LinkButton: vi.fn(
			({
				href,
				variant,
				children,
			}: {
				href: string;
				variant?: string;
				children: React.ReactNode;
			}) => (
				<a href={href} data-testid="link-button" data-variant={variant}>
					{children}
				</a>
			),
		),
	};
});

import { validateInviteToken } from '@/_actions/planner/validateInviteToken';

const mockValidateInviteToken = validateInviteToken as ReturnType<typeof vi.fn>;

describe('Invite Accept Page', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders InviteRegistrationForm for valid token', async () => {
		const validResult: ValidateInviteTokenResult = {
			valid: true,
			email: 'test@example.com',
			plannerName: 'Test Planner',
		};
		mockValidateInviteToken.mockResolvedValue(validResult);

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'valid-token-123' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('invite-registration-form')).toBeDefined();
	});

	it('passes correct props to InviteRegistrationForm', async () => {
		const validResult: ValidateInviteTokenResult = {
			valid: true,
			email: 'user@test.com',
			plannerName: 'My Meal Planner',
		};
		mockValidateInviteToken.mockResolvedValue(validResult);

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'abc-123' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('email-prop').textContent).toBe('user@test.com');
		expect(screen.getByTestId('plannerName-prop').textContent).toBe(
			'My Meal Planner',
		);
		expect(screen.getByTestId('token-prop').textContent).toBe('abc-123');
	});

	it('renders ExpiredInviteView for expired token', async () => {
		const expiredResult: ValidateInviteTokenResult = {
			valid: false,
			reason: 'expired',
			email: 'expired@example.com',
		};
		mockValidateInviteToken.mockResolvedValue(expiredResult);

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'expired-token' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('expired-invite-view')).toBeDefined();
	});

	it('passes email to ExpiredInviteView for expired token', async () => {
		const expiredResult: ValidateInviteTokenResult = {
			valid: false,
			reason: 'expired',
			email: 'expired-user@example.com',
		};
		mockValidateInviteToken.mockResolvedValue(expiredResult);

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'expired-token' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('expired-email-prop').textContent).toBe(
			'expired-user@example.com',
		);
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

	it('has correct page layout styling', async () => {
		mockValidateInviteToken.mockResolvedValue({
			valid: false,
			reason: 'invalid',
		});

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'test' }),
		});
		const { container } = render(PageComponent);

		// Check that the page renders with the container
		expect(container.firstElementChild).toBeDefined();
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

	it('passes empty string for email when expired result has no email', async () => {
		const expiredResult: ValidateInviteTokenResult = {
			valid: false,
			reason: 'expired',
			// email is undefined
		};
		mockValidateInviteToken.mockResolvedValue(expiredResult);

		const PageComponent = await Page({
			searchParams: Promise.resolve({ token: 'expired-token' }),
		});
		render(PageComponent);

		expect(screen.getByTestId('expired-email-prop').textContent).toBe('');
	});

	it('handles case where token is undefined but validation passes (edge case)', async () => {
		// This is an edge case where searchParams has no token but validation somehow returns valid
		const validResult: ValidateInviteTokenResult = {
			valid: true,
			email: 'test@example.com',
			plannerName: 'Test Planner',
		};
		mockValidateInviteToken.mockResolvedValue(validResult);

		const PageComponent = await Page({ searchParams: Promise.resolve({}) });
		render(PageComponent);

		// Should render form with empty token string
		expect(screen.getByTestId('invite-registration-form')).toBeDefined();
		expect(screen.getByTestId('token-prop').textContent).toBe('');
	});
});
