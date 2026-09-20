import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlannerMember } from '@/_actions/sharing';

import { MemberActions } from './MemberActions';
import { MemberList } from './MemberList';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockCanModifyMember = vi.fn();
const mockGetAvailableAccessLevels = vi.fn();

vi.mock('../_utils/canModifyMember', () => ({
	canModifyMember: (params: unknown) => mockCanModifyMember(params),
}));

vi.mock('../_utils/getAvailableAccessLevels', () => ({
	getAvailableAccessLevels: (viewerIsOwner: boolean) =>
		mockGetAvailableAccessLevels(viewerIsOwner),
}));

vi.mock('./AccessLevelBadge', () => ({
	AccessLevelBadge: vi.fn(() => <span data-testid="access-level-badge" />),
}));

vi.mock('./MemberActions', () => ({
	MemberActions: vi.fn(() => <div data-testid="member-actions" />),
}));

describe('MemberList', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const mockOnUpdate = vi.fn();
	const mockOnError = vi.fn();

	const mockMembers: PlannerMember[] = [
		{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
		{ name: 'Charlie', email: 'charlie@example.com', accessLevel: 'read' },
	];

	beforeEach(() => {
		vi.clearAllMocks();
		mockCanModifyMember.mockReturnValue(true);
		mockGetAvailableAccessLevels.mockReturnValue(['admin', 'write', 'read']);
	});

	it('displays update error when provided', () => {
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

	it('hides member actions when user cannot modify member', () => {
		mockCanModifyMember.mockReturnValue(false);

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

		const calls = vi.mocked(MemberActions).mock.calls;
		expect(calls).toHaveLength(3);
		for (const [props] of calls) {
			expect(props.hidden).toBe(true);
		}
	});

	it('shows member actions when user can modify member', () => {
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

		const calls = vi.mocked(MemberActions).mock.calls;
		expect(calls).toHaveLength(3);
		for (const [props] of calls) {
			expect(props.hidden).toBe(false);
		}
	});

	it('passes available access levels based on user ownership to MemberActions', () => {
		const nonOwnerLevels = ['write', 'read'];
		mockGetAvailableAccessLevels.mockReturnValue(nonOwnerLevels);

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

		expect(mockGetAvailableAccessLevels).toHaveBeenCalledWith(false);

		const calls = vi.mocked(MemberActions).mock.calls;
		expect(calls[0][0].availableLevels).toEqual(nonOwnerLevels);
	});
});
