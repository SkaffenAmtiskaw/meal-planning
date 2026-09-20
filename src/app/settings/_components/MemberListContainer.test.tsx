import { act, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemberList } from './MemberList';
import { MemberListContainer } from './MemberListContainer';

import { useCurrentUserMembership } from '../_hooks/useCurrentUserMembership';
import { usePlannerMembers } from '../_hooks/usePlannerMembers';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../_hooks/usePlannerMembers', () => ({
	usePlannerMembers: vi.fn(),
}));

vi.mock('../_hooks/useCurrentUserMembership', () => ({
	useCurrentUserMembership: vi.fn(),
}));

vi.mock('./MemberList', () => ({
	MemberList: vi.fn(() => <div data-testid="member-list" />),
}));

describe('MemberListContainer', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const mockRefresh = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders loading state when members are loading', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: true,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Loading members...')).toBeDefined();
	});

	it('renders loading state when user membership is loading', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: true,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Loading members...')).toBeDefined();
	});

	it('renders error state from members hook', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: 'Unauthorized',
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Unauthorized')).toBeDefined();
		expect(screen.getByTestId('member-list-error')).toBeDefined();
	});

	it('renders error state from user membership hook', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: 'Failed to load user data',
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Failed to load user data')).toBeDefined();
		expect(screen.getByTestId('member-list-error')).toBeDefined();
	});

	it('calls hooks with correct plannerId', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(usePlannerMembers).toHaveBeenCalledWith(plannerId);
		expect(useCurrentUserMembership).toHaveBeenCalledWith(plannerId);
	});

	it('passes correct props to MemberList', () => {
		const members = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as const,
			},
		];

		vi.mocked(usePlannerMembers).mockReturnValue({
			members,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(vi.mocked(MemberList)).toHaveBeenCalledWith(
			expect.objectContaining({
				members,
				currentUserEmail: 'alice@example.com',
				currentUserIsOwner: true,
				plannerId,
				updateError: null,
			}),
			undefined,
		);
	});

	it('clears updateError and calls refresh when onUpdate is called', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		// First set an error so clearing it triggers a re-render
		const { onError } = vi.mocked(MemberList).mock.calls[0][0];
		act(() => onError('Previous error'));

		expect(vi.mocked(MemberList).mock.calls[1][0].updateError).toBe(
			'Previous error',
		);

		const { onUpdate } = vi.mocked(MemberList).mock.calls[1][0];
		act(() => onUpdate());

		expect(mockRefresh).toHaveBeenCalled();
		expect(vi.mocked(MemberList).mock.calls[2][0].updateError).toBeNull();
	});

	it('sets updateError when onError is called', () => {
		vi.mocked(usePlannerMembers).mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		vi.mocked(useCurrentUserMembership).mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		const { onError } = vi.mocked(MemberList).mock.calls[0][0];

		act(() => onError('Something went wrong'));

		expect(vi.mocked(MemberList).mock.calls[1][0].updateError).toBe(
			'Something went wrong',
		);
	});
});
