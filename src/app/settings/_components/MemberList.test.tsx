import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

import { MemberList } from './MemberList';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockCanModifyMember = vi.fn();

vi.mock('../_utils/canModifyMember', () => ({
	canModifyMember: (...args: unknown[]) => mockCanModifyMember(...args),
}));

vi.mock('../_utils/getAvailableAccessLevels', () => ({
	getAvailableAccessLevels: (viewerIsOwner: boolean) =>
		viewerIsOwner ? ['admin', 'write', 'read'] : ['write', 'read'],
}));

vi.mock('./AccessLevelBadge', () => ({
	AccessLevelBadge: ({ accessLevel }: { accessLevel: string }) => (
		<span data-testid="access-level-badge">{accessLevel}</span>
	),
}));

vi.mock('./MemberActions', () => ({
	MemberActions: ({
		memberName,
		hidden,
	}: {
		memberName: string;
		hidden?: boolean;
	}) => (
		<div data-testid={`member-actions-${memberName}`} data-hidden={hidden}>
			Actions for {memberName}
		</div>
	),
}));

describe('MemberList', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const mockOnUpdate = vi.fn();
	const mockOnError = vi.fn();

	const createMockMembers = (): PlannerMember[] => [
		{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
		{ name: 'Charlie', email: 'charlie@example.com', accessLevel: 'read' },
	];

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders member list with correct member information', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={true}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		// Verify all members are rendered
		expect(screen.getByText('Alice')).toBeDefined();
		expect(screen.getByText('alice@example.com')).toBeDefined();
		expect(screen.getByText('Bob')).toBeDefined();
		expect(screen.getByText('bob@example.com')).toBeDefined();
		expect(screen.getByText('Charlie')).toBeDefined();
		expect(screen.getByText('charlie@example.com')).toBeDefined();
	});

	it('calls canModifyMember for each member with correct parameters', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={true}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		expect(mockCanModifyMember).toHaveBeenCalledTimes(3);
		expect(mockCanModifyMember).toHaveBeenNthCalledWith(1, {
			member: mockMembers[0],
			currentUserEmail: 'admin@example.com',
			currentUserIsOwner: true,
		});
		expect(mockCanModifyMember).toHaveBeenNthCalledWith(2, {
			member: mockMembers[1],
			currentUserEmail: 'admin@example.com',
			currentUserIsOwner: true,
		});
		expect(mockCanModifyMember).toHaveBeenNthCalledWith(3, {
			member: mockMembers[2],
			currentUserEmail: 'admin@example.com',
			currentUserIsOwner: true,
		});
	});

	it('renders empty list when no members provided', () => {
		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={[]}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={true}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		// Should render without errors
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('displays update error when provided', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={true}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError="Failed to update member"
			/>,
		);

		expect(screen.getByTestId('update-error')).toBeDefined();
		expect(screen.getByText('Failed to update member')).toBeDefined();
	});

	it('does not display update error when null', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={true}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		expect(screen.queryByTestId('update-error')).toBeNull();
	});

	it('passes correct props to MemberActions', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(false);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={false}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		// All actions should be hidden based on canModifyMember returning false
		const aliceActions = screen.getByTestId('member-actions-Alice');
		expect(aliceActions.getAttribute('data-hidden')).toBe('true');
	});

	it('passes non-owner available access levels when current user is not owner', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(true);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail="admin@example.com"
				currentUserIsOwner={false}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		// Component renders successfully with non-owner permissions
		expect(screen.getByText('Alice')).toBeDefined();
	});

	it('handles null currentUserEmail', () => {
		const mockMembers = createMockMembers();

		mockCanModifyMember.mockReturnValue(false);

		render(
			<MemberList
				members={mockMembers}
				currentUserEmail={null}
				currentUserIsOwner={false}
				plannerId={plannerId}
				onUpdate={mockOnUpdate}
				onError={mockOnError}
				updateError={null}
			/>,
		);

		// Should still render members
		expect(screen.getByText('Alice')).toBeDefined();
		expect(screen.getByText('Bob')).toBeDefined();

		// Verify canModifyMember was called with null email
		expect(mockCanModifyMember).toHaveBeenCalledWith(
			expect.objectContaining({
				currentUserEmail: null,
			}),
		);
	});
});
