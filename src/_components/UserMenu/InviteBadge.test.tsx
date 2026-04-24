import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetUserInvitesResult } from '@/_actions/planner/getUserInvites';
import type { AccessLevel } from '@/_models/user';
import { THEME_COLORS } from '@/_theme/colors';

// Mock dependencies
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@/_actions/planner/getUserInvites', () => ({
	getUserInvites: vi.fn(),
}));
vi.mock('@/_actions/user/getUser', () => ({
	getUser: vi.fn(),
}));

// Import mocked actions
import { getUserInvites } from '@/_actions/planner/getUserInvites';
import { getUser } from '@/_actions/user/getUser';

// Import component after mocks
import { InviteBadge, InviteBadgeWithData } from './InviteBadge';

const mockGetUserInvites = vi.mocked(getUserInvites);
const mockGetUser = vi.mocked(getUser);

// Mock user data with all required fields
const createMockUser = (email: string | undefined) =>
	({
		_id: '123',
		email: email ?? 'test@example.com',
		name: 'Test User',
		planners: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}) as never;

describe('InviteBadge', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('InviteBadgeWithData (async server component)', () => {
		it('should render indicator with count for multiple invites', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const mockResult: GetUserInvitesResult = {
				invites: [
					{
						id: '1',
						plannerId: 'p1',
						plannerName: 'Test Planner',
						invitedBy: 'Test User',
						accessLevel: 'write' as AccessLevel,
						invitedAt: '2024-01-01T00:00:00Z',
						expiresAt: '2024-01-15T00:00:00Z',
						token: 'token1',
					},
					{
						id: '2',
						plannerId: 'p2',
						plannerName: 'Test Planner 2',
						invitedBy: 'Test User 2',
						accessLevel: 'read' as AccessLevel,
						invitedAt: '2024-01-02T00:00:00Z',
						expiresAt: '2024-01-16T00:00:00Z',
						token: 'token2',
					},
				],
			};
			mockGetUserInvites.mockResolvedValue(mockResult);

			// Directly await the async server component
			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(mockGetUser).toHaveBeenCalled();
			expect(mockGetUserInvites).toHaveBeenCalledWith('test@example.com');
			const indicator = screen.getByTestId('invite-badge');
			expect(indicator.getAttribute('data-label')).toBe('2');
			expect(indicator.getAttribute('data-color')).toBe(THEME_COLORS.ember);
			expect(indicator.getAttribute('data-size')).toBe('16');
			expect(indicator.getAttribute('data-max-value')).toBe('99');
			expect(indicator.getAttribute('data-inline')).toBe('true');
			expect(indicator.getAttribute('data-show-zero')).toBe('false');
			expect(screen.getByTestId('child')).toBeTruthy();
		});

		it('should render indicator with count for single invite', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const mockResult: GetUserInvitesResult = {
				invites: [
					{
						id: '1',
						plannerId: 'p1',
						plannerName: 'Test Planner',
						invitedBy: 'Test User',
						accessLevel: 'write' as AccessLevel,
						invitedAt: '2024-01-01T00:00:00Z',
						expiresAt: '2024-01-15T00:00:00Z',
						token: 'token1',
					},
				],
			};
			mockGetUserInvites.mockResolvedValue(mockResult);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(mockGetUser).toHaveBeenCalled();
			expect(mockGetUserInvites).toHaveBeenCalledWith('test@example.com');
			const indicator = screen.getByTestId('invite-badge');
			expect(indicator.getAttribute('data-label')).toBe('1');
		});

		it('should return children without indicator when user is null', async () => {
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

		it('should return children without indicator when user has no email', async () => {
			mockGetUser.mockResolvedValue({
				_id: '123',
				email: undefined,
				name: 'Test User',
				planners: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			} as never);

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

		it('should return children when getUserInvites returns an error', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const mockResult: GetUserInvitesResult = {
				invites: [],
				error: 'Failed to fetch invites',
			};
			mockGetUserInvites.mockResolvedValue(mockResult);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('should return children without indicator when no invites exist', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const mockResult: GetUserInvitesResult = {
				invites: [],
			};
			mockGetUserInvites.mockResolvedValue(mockResult);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('should return children when an exception is thrown', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const error = new Error('Network error');
			mockGetUserInvites.mockRejectedValue(error);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			expect(console.error).toHaveBeenCalledWith(
				'InviteBadge: Exception:',
				error,
			);
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});

		it('should handle large invite counts', async () => {
			mockGetUser.mockResolvedValue(createMockUser('test@example.com'));

			const mockResult: GetUserInvitesResult = {
				invites: Array.from({ length: 100 }, (_, i) => ({
					id: String(i),
					plannerId: `p${i}`,
					plannerName: `Test Planner ${i}`,
					invitedBy: `Test User ${i}`,
					accessLevel: 'read' as AccessLevel,
					invitedAt: '2024-01-01T00:00:00Z',
					expiresAt: '2024-01-15T00:00:00Z',
					token: `token${i}`,
				})),
			};
			mockGetUserInvites.mockResolvedValue(mockResult);

			render(
				await InviteBadgeWithData({
					children: <div data-testid="child">Child</div>,
				}),
			);

			const indicator = screen.getByTestId('invite-badge');
			expect(indicator.getAttribute('data-label')).toBe('100');
			expect(indicator.getAttribute('data-max-value')).toBe('99');
		});
	});

	describe('InviteBadge (with Suspense)', () => {
		it('should render children immediately as Suspense fallback', () => {
			// Never resolve to stay in suspense
			mockGetUser.mockImplementation(() => new Promise(() => {}));
			mockGetUserInvites.mockImplementation(() => new Promise(() => {}));

			render(
				<InviteBadge>
					<div data-testid="child">Child Element</div>
				</InviteBadge>,
			);

			// Children should be visible immediately (Suspense fallback)
			expect(screen.getByTestId('child')).toBeTruthy();
			expect(screen.getByText('Child Element')).toBeTruthy();
			// Indicator should not be rendered yet (still in suspense)
			expect(screen.queryByTestId('invite-badge')).toBeNull();
		});
	});
});
