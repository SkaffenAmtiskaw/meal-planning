import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	getUserInvites,
	type UserInvite,
} from '@/_actions/planner/getUserInvites';
import { getUser } from '@/_actions/user/getUser';

import { InvitesSettings } from './InvitesSettings';

// Mock dependencies
vi.mock('@/_actions/planner/getUserInvites', () => ({
	getUserInvites: vi.fn(),
}));

vi.mock('@/_actions/user/getUser', () => ({
	getUser: vi.fn(),
}));

vi.mock('@/_actions/planner/acceptInvite', () => ({
	acceptInvite: vi.fn(),
}));

vi.mock('@/_actions/planner/declineInvite', () => ({
	declineInvite: vi.fn(),
}));

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return {
		...actual,
		Stack: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="stack">{children}</div>
		),
	};
});

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

	it('should fetch invites on render', async () => {
		mockGetUserInvites.mockResolvedValue({ invites: [mockInvite] });

		const result = await InvitesSettings();
		render(result);

		expect(mockGetUserInvites).toHaveBeenCalledTimes(1);
	});

	it('should render InvitesSection with invites', async () => {
		mockGetUserInvites.mockResolvedValue({ invites: [mockInvite] });

		const result = await InvitesSettings();
		const { getByTestId } = render(result);

		expect(getByTestId('invites-section')).toBeDefined();
	});

	it('should handle empty invites', async () => {
		mockGetUserInvites.mockResolvedValue({ invites: [] });

		const result = await InvitesSettings();
		const { getByTestId } = render(result);

		expect(getByTestId('invites-section')).toBeDefined();
	});

	it('should handle error from getUserInvites', async () => {
		mockGetUserInvites.mockResolvedValue({
			invites: [],
			error: 'Failed to fetch',
		});

		const result = await InvitesSettings();
		const { getByTestId } = render(result);

		expect(getByTestId('invites-section')).toBeDefined();
	});

	it('should handle null user (not authenticated)', async () => {
		mockGetUser.mockResolvedValue(null);

		const result = await InvitesSettings();
		const { getByTestId } = render(result);

		expect(getByTestId('invites-section')).toBeDefined();
		expect(mockGetUserInvites).not.toHaveBeenCalled();
	});
});
