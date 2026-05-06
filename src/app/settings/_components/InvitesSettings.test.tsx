import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserInvites, type UserInvite } from '@/_actions/sharing';
import { getUser } from '@/_actions/user';

import { InvitesSettings } from './InvitesSettings';

vi.mock('@/_actions/sharing', () => ({
	getUserInvites: vi.fn(),
	acceptInvite: vi.fn(),
	declineInvite: vi.fn(),
}));

vi.mock('@/_actions/user', () => ({
	getUser: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./InvitesSection', () => ({
	InvitesSection: (_props: { invites: UserInvite[] }) => (
		<div data-testid="invites-section">InvitesSection</div>
	),
}));

const mockGetUserInvites = vi.mocked(getUserInvites);
const mockGetUser = vi.mocked(getUser);

describe('InvitesSettings', () => {
	const mockInvite: UserInvite = {
		id: 'invite-1',
		plannerId: 'planner-1',
		plannerName: 'Test Planner',
		invitedBy: 'John Doe',
		accessLevel: 'write',
		invitedAt: '2024-01-01T00:00:00.000Z',
		expiresAt: '2024-12-31T23:59:59.000Z',
		token: 'token-123',
	};

	const mockUser = {
		email: 'test@example.com',
		name: 'Test User',
		planners: [],
	} as unknown as Awaited<ReturnType<typeof getUser>>;

	beforeEach(() => {
		vi.resetAllMocks();
		mockGetUser.mockResolvedValue(mockUser);
	});

	it('calls getUserInvites when user is authenticated', async () => {
		mockGetUserInvites.mockResolvedValue({ invites: [mockInvite] });

		const result = await InvitesSettings();
		render(result);

		expect(mockGetUserInvites).toHaveBeenCalledTimes(1);
		expect(mockGetUserInvites).toHaveBeenCalledWith('test@example.com');
	});

	it('does not call getUserInvites when user is not authenticated', async () => {
		mockGetUser.mockResolvedValue(null);

		const result = await InvitesSettings();
		render(result);

		expect(mockGetUserInvites).not.toHaveBeenCalled();
	});
});
