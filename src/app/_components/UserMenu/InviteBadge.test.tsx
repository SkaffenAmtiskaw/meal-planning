import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
	'@/_actions/sharing/getUserInvites',
	async () => await import('#mocks/@/_actions/sharing/getUserInvites'),
);
vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));
vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);
vi.mock('./InviteCountBadge', () => ({
	InviteCountBadge: ({
		count,
		children,
	}: {
		count: number;
		children: React.ReactNode;
	}) => (
		<div data-testid="invite-badge" data-count={count}>
			{children}
		</div>
	),
}));

import { getUserInvites } from '@/_actions/sharing/getUserInvites';
import type { UserInvite } from '@/_actions/sharing/types';
import { getUser } from '@/_actions/user';
import { reportError } from '@/_reporting/reportError';

import { InviteBadge, InviteBadgeWithData } from './InviteBadge';

const mockGetUserInvites = vi.mocked(getUserInvites);
const mockGetUser = vi.mocked(getUser);

const mockUser = {
	email: 'test@example.com',
	name: 'Test User',
	planners: [],
} as unknown as Awaited<ReturnType<typeof getUser>>;

// The badge only counts the invites, so their contents don't matter.
const twoInvites = [{}, {}] as UserInvite[];

const renderWithData = async () =>
	render(
		await InviteBadgeWithData({
			children: <div data-testid="child">Child</div>,
		}),
	);

describe('InviteBadge', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('InviteBadgeWithData', () => {
		it('passes the invite count to the badge when the user has invites', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({ invites: twoInvites });

			await renderWithData();

			expect(mockGetUserInvites).toHaveBeenCalledWith('test@example.com');
			expect(
				screen.getByTestId('invite-badge').getAttribute('data-count'),
			).toBe('2');
			expect(screen.getByTestId('child')).toBeTruthy();
		});

		it('renders children without the badge when no user is found', async () => {
			mockGetUser.mockResolvedValue(null);

			await renderWithData();

			expect(mockGetUserInvites).not.toHaveBeenCalled();
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children without the badge when getUserInvites returns an error', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({
				invites: [],
				error: 'Failed to fetch invites',
			});

			await renderWithData();

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children without the badge when the user has no invites', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({ invites: [] });

			await renderWithData();

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children and reports when getUserInvites throws', async () => {
			const error = new Error('Network error');

			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockRejectedValue(error);

			await renderWithData();

			expect(reportError).toHaveBeenCalledWith(error);
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children without reporting when there is no valid session', async () => {
			mockGetUser.mockRejectedValue(new Error('No Valid Session'));

			await renderWithData();

			expect(reportError).not.toHaveBeenCalled();
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});
	});

	describe('InviteBadge', () => {
		it('renders children as Suspense fallback while loading', async () => {
			// Rendering an async server component in a client test env makes React
			// log its "async Client Component" warning; it is expected here.
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			mockGetUser.mockImplementation(() => new Promise(() => {}));

			await act(async () => {
				render(
					<InviteBadge>
						<div data-testid="child">Child Element</div>
					</InviteBadge>,
				);
			});

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();

			consoleSpy.mockRestore();
		});
	});
});
