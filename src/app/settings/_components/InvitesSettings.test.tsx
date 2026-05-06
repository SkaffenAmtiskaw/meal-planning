import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	acceptInvite,
	declineInvite,
	getUserInvites,
	type UserInvite,
} from '@/_actions/sharing';
import { getUser } from '@/_actions/user';

import { InvitesSection } from './InvitesSection';
import { InvitesSettings } from './InvitesSettings';

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);
vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./InvitesSection', () => ({
	InvitesSection: vi.fn(() => <div data-testid="invites-section" />),
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

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches and passes invites when user is authenticated', async () => {
		mockGetUserInvites.mockResolvedValueOnce({ invites: [mockInvite] });

		const result = await InvitesSettings();
		render(result);

		expect(mockGetUserInvites).toHaveBeenCalledTimes(1);
		expect(mockGetUserInvites).toHaveBeenCalledWith('user@example.com');
		expect(screen.getByTestId('invites-section')).toBeDefined();

		const invitesSectionProps = vi.mocked(InvitesSection).mock.calls[0][0];
		expect(invitesSectionProps.invites).toEqual([mockInvite]);
		expect(invitesSectionProps.onAccept).toBe(acceptInvite);
		expect(invitesSectionProps.onDecline).toBe(declineInvite);
	});

	it('passes empty invites when user is not authenticated', async () => {
		mockGetUser.mockResolvedValueOnce(null);

		const result = await InvitesSettings();
		render(result);

		expect(mockGetUserInvites).not.toHaveBeenCalled();
		expect(screen.getByTestId('invites-section')).toBeDefined();

		const invitesSectionProps = vi.mocked(InvitesSection).mock.calls[0][0];
		expect(invitesSectionProps.invites).toEqual([]);
		expect(invitesSectionProps.onAccept).toBe(acceptInvite);
		expect(invitesSectionProps.onDecline).toBe(declineInvite);
	});
});
