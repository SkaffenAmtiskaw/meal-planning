import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);
vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

import { getUserInvites } from '@/_actions/sharing';
import { getUser } from '@/_actions/user';

import { InviteBadge, InviteBadgeWithData } from './InviteBadge';

const mockGetUserInvites = vi.mocked(getUserInvites);
const mockGetUser = vi.mocked(getUser);

const mockUser = {
	email: 'test@example.com',
	name: 'Test User',
	planners: [],
} as unknown as Awaited<ReturnType<typeof getUser>>;

describe('InviteBadge', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('InviteBadgeWithData', () => {
		it('renders invite indicator with count when user has invites', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({
				invites: [
					{
						id: '1',
						plannerId: 'p1',
						plannerName: 'Planner 1',
						invitedBy: 'User A',
						accessLevel: 'write',
						invitedAt: '2024-01-01T00:00:00Z',
						expiresAt: '2024-01-15T00:00:00Z',
						token: 't1',
					},
					{
						id: '2',
						plannerId: 'p2',
						plannerName: 'Planner 2',
						invitedBy: 'User B',
						accessLevel: 'read',
						invitedAt: '2024-01-02T00:00:00Z',
						expiresAt: '2024-01-16T00:00:00Z',
						token: 't2',
					},
				],
			});

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(mockGetUserInvites).toHaveBeenCalledWith('test@example.com');
			expect(
				screen.getByTestId('invite-badge').getAttribute('data-label'),
			).toBe('2');
			expect(screen.getByTestId('child')).toBeTruthy();
		});

		it('renders children without indicator when user is not authenticated', async () => {
			mockGetUser.mockResolvedValue(null);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(mockGetUser).toHaveBeenCalled();
			expect(mockGetUserInvites).not.toHaveBeenCalled();
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children without indicator when user has no email', async () => {
			mockGetUser.mockResolvedValue({
				email: undefined,
				name: 'Test User',
				planners: [],
			} as unknown as Awaited<ReturnType<typeof getUser>>);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(mockGetUser).toHaveBeenCalled();
			expect(mockGetUserInvites).not.toHaveBeenCalled();
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children when getUserInvites returns an error', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({
				invites: [],
				error: 'Failed to fetch invites',
			});

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children without indicator when user has no invites', async () => {
			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockResolvedValue({ invites: [] });

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('renders children and logs error when getUserInvites throws', async () => {
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const error = new Error('Network error');

			mockGetUser.mockResolvedValue(mockUser);
			mockGetUserInvites.mockRejectedValue(error);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(consoleSpy).toHaveBeenCalledWith('InviteBadge: Exception:', error);
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();

			consoleSpy.mockRestore();
		});
	});

	describe('InviteBadge', () => {
		it('renders children as Suspense fallback while loading', () => {
			mockGetUser.mockImplementation(() => new Promise(() => {}));
			mockGetUserInvites.mockImplementation(() => new Promise(() => {}));

			render(
				<InviteBadge>
					<div data-testid="child">Child Element</div>
				</InviteBadge>,
			);

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});
	});
});
