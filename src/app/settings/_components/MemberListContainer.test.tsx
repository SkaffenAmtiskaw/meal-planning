import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

import { MemberListContainer } from './MemberListContainer';

const mockUsePlannerMembers = vi.fn();
const mockUseCurrentUserMembership = vi.fn();
const mockCanModifyMember = vi.fn();

vi.mock('../_hooks/usePlannerMembers', () => ({
	usePlannerMembers: (...args: unknown[]) => mockUsePlannerMembers(...args),
}));

vi.mock('../_hooks/useCurrentUserMembership', () => ({
	useCurrentUserMembership: (...args: unknown[]) =>
		mockUseCurrentUserMembership(...args),
}));

vi.mock('../_utils/canModifyMember', () => ({
	canModifyMember: (...args: unknown[]) => mockCanModifyMember(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockUseDisclosure = vi.fn(() => [
	false,
	{ open: vi.fn(), close: vi.fn() },
]);

vi.mock('@mantine/hooks', () => ({
	useDisclosure: mockUseDisclosure,
}));

vi.mock('@tabler/icons-react', () => ({
	IconPencil: () => <svg data-testid="icon-pencil" />,
	IconTrash: () => <svg data-testid="icon-trash" />,
	IconCheck: () => <svg data-testid="icon-check" />,
	IconX: () => <svg data-testid="icon-x" />,
}));

const mockUpdateMemberAccess = vi.fn();
const mockRemoveMember = vi.fn();

vi.mock('@/_actions/planner/updateMemberAccess', () => ({
	updateMemberAccess: (...args: unknown[]) => mockUpdateMemberAccess(...args),
}));

vi.mock('@/_actions/planner/removeMember', () => ({
	removeMember: (...args: unknown[]) => mockRemoveMember(...args),
}));

// Mock RemoveMemberButton with modal behavior
vi.mock('./RemoveMemberButton', () => ({
	RemoveMemberButton: ({
		plannerId: _plannerId,
		memberEmail: _memberEmail,
		memberName,
		onRemove,
		onError: _onError,
	}: {
		plannerId: string;
		memberEmail: string;
		memberName: string;
		onRemove: () => void;
		onError: (error: string) => void;
	}) => {
		const [opened, setOpened] = React.useState(false);
		return (
			<>
				<button
					type="button"
					data-testid="remove-member-button"
					onClick={() => setOpened(true)}
				>
					<svg data-testid="icon-trash" />
				</button>
				{opened && (
					<div data-testid="remove-member-modal">
						<div>Remove {memberName}?</div>
						<button
							type="button"
							data-testid="confirm-remove-button"
							onClick={() => {
								onRemove();
								setOpened(false);
							}}
						>
							Confirm
						</button>
						<button
							type="button"
							data-testid="cancel-remove-button"
							onClick={() => setOpened(false)}
						>
							Cancel
						</button>
					</div>
				)}
			</>
		);
	},
}));

describe('MemberListContainer', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const mockRefresh = vi.fn();

	const createMockMembers = (): PlannerMember[] => [
		{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
	];

	beforeEach(() => {
		vi.resetAllMocks();
		mockUseDisclosure.mockReturnValue([
			false,
			{ open: vi.fn(), close: vi.fn() },
		]);
	});

	it('renders loading state when members are loading', () => {
		mockUsePlannerMembers.mockReturnValue({
			members: [],
			loading: true,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Loading members...')).toBeDefined();
	});

	it('renders loading state when user is loading', () => {
		mockUsePlannerMembers.mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: null,
			isOwner: false,
			loading: true,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Loading members...')).toBeDefined();
	});

	it('renders error state from members hook', () => {
		mockUsePlannerMembers.mockReturnValue({
			members: [],
			loading: false,
			error: 'Unauthorized',
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Unauthorized')).toBeDefined();
		expect(screen.getByTestId('member-list-error')).toBeDefined();
	});

	it('renders error state from user hook', () => {
		mockUsePlannerMembers.mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: 'Failed to load user data',
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Failed to load user data')).toBeDefined();
		expect(screen.getByTestId('member-list-error')).toBeDefined();
	});

	it('renders member list when data is loaded', () => {
		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		// Owner can be modified = false, write user can be modified = true
		mockCanModifyMember
			.mockReturnValueOnce(false) // Alice (owner)
			.mockReturnValueOnce(true); // Bob (write)

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.getByText('Alice')).toBeDefined();
		expect(screen.getByText('alice@example.com')).toBeDefined();
		expect(screen.getByText('Bob')).toBeDefined();
		expect(screen.getByText('bob@example.com')).toBeDefined();
	});

	it('renders empty list when no members', () => {
		mockUsePlannerMembers.mockReturnValue({
			members: [],
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: null,
			isOwner: false,
			loading: false,
			error: null,
		});

		render(<MemberListContainer plannerId={plannerId} />);

		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.queryByText('Loading members...')).toBeNull();
	});

	it('passes correct data to MemberList presentation component', () => {
		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		mockCanModifyMember.mockReturnValue(true);

		render(<MemberListContainer plannerId={plannerId} />);

		// Verify hooks were called with correct plannerId
		expect(mockUsePlannerMembers).toHaveBeenCalledWith(plannerId);
		expect(mockUseCurrentUserMembership).toHaveBeenCalledWith(plannerId);
	});

	it('calls refresh after successful member update', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		// Owner can be modified = false, write user can be modified = true
		mockCanModifyMember
			.mockReturnValueOnce(false) // Alice (owner)
			.mockReturnValueOnce(true); // Bob (write)

		render(<MemberListContainer plannerId={plannerId} />);

		// Click edit button for Bob (second member)
		const editButtons = screen.getAllByTestId('edit-access-level');
		fireEvent.click(editButtons[0]);

		// Change the value and save
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for refresh to be called
		await waitFor(() => {
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	it('calls refresh after successful member removal', async () => {
		mockRemoveMember.mockResolvedValue({ ok: true });

		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		// Owner can be modified = false, write user can be modified = true
		mockCanModifyMember
			.mockReturnValueOnce(false) // Alice (owner)
			.mockReturnValueOnce(true); // Bob (write)

		render(<MemberListContainer plannerId={plannerId} />);

		// Click remove button for Bob (second member)
		const removeButtons = screen.getAllByTestId('remove-member-button');
		fireEvent.click(removeButtons[0]);

		// Wait for modal to appear
		await waitFor(() => {
			expect(screen.getByTestId('remove-member-modal')).toBeDefined();
		});

		// Confirm removal
		fireEvent.click(screen.getByTestId('confirm-remove-button'));

		// Wait for refresh to be called
		await waitFor(() => {
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	it('displays update error when member action fails', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		// Owner can be modified = false, write user can be modified = true
		mockCanModifyMember
			.mockReturnValueOnce(false) // Alice (owner)
			.mockReturnValueOnce(true); // Bob (write)

		render(<MemberListContainer plannerId={plannerId} />);

		// Click edit button for Bob (second member)
		const editButtons = screen.getAllByTestId('edit-access-level');
		fireEvent.click(editButtons[0]);

		// Change the value and save
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for error alert to appear
		await waitFor(() => {
			expect(screen.getByTestId('update-error')).toBeDefined();
		});

		expect(screen.getByText('Cannot change owner access')).toBeDefined();
	});

	it('clears update error on successful refresh', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		const mockMembers = createMockMembers();

		mockUsePlannerMembers.mockReturnValue({
			members: mockMembers,
			loading: false,
			error: null,
			refresh: mockRefresh,
		});
		mockUseCurrentUserMembership.mockReturnValue({
			email: 'alice@example.com',
			isOwner: true,
			loading: false,
			error: null,
		});

		// Setup canModifyMember to always return appropriate values for this test
		// Owner cannot be modified, others can
		mockCanModifyMember.mockImplementation(({ member }) => {
			return member.accessLevel !== 'owner';
		});

		render(<MemberListContainer plannerId={plannerId} />);

		// Click edit button for Bob (second member)
		let editButtons = screen.getAllByTestId('edit-access-level');
		fireEvent.click(editButtons[0]);

		// Change the value and save to trigger an error
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for error alert to appear
		await waitFor(() => {
			expect(screen.getByTestId('update-error')).toBeDefined();
		});

		// Now mock a successful update and try again
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		// Note: After error, onCancel is called which closes the editor
		// So we need to re-query for the edit button
		editButtons = screen.getAllByTestId('edit-access-level');
		fireEvent.click(editButtons[0]);

		// Change the value and save
		fireEvent.change(screen.getByTestId('access-level-select'), {
			target: { value: 'read' },
		});
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for error to be cleared
		await waitFor(() => {
			expect(screen.queryByTestId('update-error')).toBeNull();
		});
	});
});
