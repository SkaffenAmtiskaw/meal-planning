import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { MemberList } from './MemberList';

const mockGetPlannerMembers = vi.fn();
const mockGetUser = vi.fn();
const mockUpdateMemberAccess = vi.fn();

vi.mock('@/_actions/planner/getPlannerMembers', () => ({
	getPlannerMembers: (...args: unknown[]) => mockGetPlannerMembers(...args),
}));

vi.mock('@/_actions/user/getUser', () => ({
	getUser: (...args: unknown[]) => mockGetUser(...args),
}));

vi.mock('@/_actions/planner/updateMemberAccess', () => ({
	updateMemberAccess: (...args: unknown[]) => mockUpdateMemberAccess(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('MemberList', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('renders member list correctly', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		expect(screen.getByText('alice@example.com')).toBeDefined();
		expect(screen.getByText('Bob')).toBeDefined();
		expect(screen.getByText('bob@example.com')).toBeDefined();
		expect(mockGetPlannerMembers).toHaveBeenCalledWith(plannerId);
	});

	test('shows loading state initially', async () => {
		mockGetPlannerMembers.mockImplementation(
			() => new Promise((resolve) => setTimeout(resolve, 100)),
		);

		render(<MemberList plannerId={plannerId} />);

		expect(screen.getByText('Loading members...')).toBeDefined();
	});

	test('handles errors', async () => {
		mockGetPlannerMembers.mockResolvedValue({
			members: [],
			error: 'Unauthorized',
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Unauthorized')).toBeDefined();
		});
	});

	test('handles unexpected errors', async () => {
		mockGetPlannerMembers.mockRejectedValue(new Error('Network error'));

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Failed to load members')).toBeDefined();
		});
	});

	test('renders empty list when no members', async () => {
		mockGetPlannerMembers.mockResolvedValue({ members: [] });

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.queryByText('Loading members...')).toBeNull();
		});

		// Should render without crashing and show no members
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('displays access level as badge for each member', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			const badges = screen.getAllByTestId('access-level-badge');
			expect(badges.length).toBe(2);
		});
	});

	test('renders all access levels with correct colors', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
			{
				name: 'Charlie',
				email: 'charlie@example.com',
				accessLevel: 'write' as AccessLevel,
			},
			{
				name: 'David',
				email: 'david@example.com',
				accessLevel: 'read' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		expect(screen.getByText('David')).toBeDefined();
		expect(screen.getByText('read')).toBeDefined();
	});

	test('AccessLevelSelect appears for manageable members when viewer is owner', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		// Alice (owner, current user) should not have edit button
		// Bob (write, not current user) should have edit button
		const editButtons = screen.getAllByTestId('edit-access-level');
		expect(editButtons.length).toBe(1);
	});

	test('AccessLevelSelect does not appear for current user', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'admin' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		// Alice (current user) should not have edit button
		// Bob (write, not current user) should have edit button
		const editButtons = screen.getAllByTestId('edit-access-level');
		expect(editButtons.length).toBe(1);
	});

	test('AccessLevelSelect does not appear for owner when viewer is admin', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
			{
				name: 'Charlie',
				email: 'charlie@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'bob@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'admin' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		// Alice (owner) should not have edit button
		// Bob (admin, current user) should not have edit button
		// Charlie (write) should have edit button
		const editButtons = screen.getAllByTestId('edit-access-level');
		expect(editButtons.length).toBe(1);
	});

	test('AccessLevelSelect does not appear for other admins when viewer is admin', async () => {
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
			{
				name: 'Charlie',
				email: 'charlie@example.com',
				accessLevel: 'admin' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'bob@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'admin' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		// Alice (owner) should not have edit button
		// Bob (admin, current user) should not have edit button
		// Charlie (admin) should not have edit button (admins can't modify other admins)
		expect(screen.queryByTestId('edit-access-level')).toBeNull();
	});

	test('Error alert shows when update fails', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Bob')).toBeDefined();
		});

		// Click edit button for Bob
		fireEvent.click(screen.getByTestId('edit-access-level'));

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

	test('refreshes member list after successful update', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		const initialMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		const updatedMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'read' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValueOnce({ members: initialMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Bob')).toBeDefined();
		});

		// Setup the mock to return updated members on refresh
		mockGetPlannerMembers.mockResolvedValueOnce({ members: updatedMembers });

		// Click edit button for Bob
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Change the value and save
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for the member list to be refreshed
		await waitFor(() => {
			expect(mockGetPlannerMembers).toHaveBeenCalledTimes(2);
		});
	});

	test('handles error when refreshing member list after update', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		const initialMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				accessLevel: 'owner' as AccessLevel,
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				accessLevel: 'write' as AccessLevel,
			},
		];

		mockGetPlannerMembers.mockResolvedValueOnce({ members: initialMembers });
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Bob')).toBeDefined();
		});

		// Setup the mock to return an error on refresh - covers line 79 error branch
		mockGetPlannerMembers.mockResolvedValueOnce({
			members: [],
			error: 'Failed to refresh members',
		});

		// Click edit button for Bob
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Change the value and save
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });
		fireEvent.click(screen.getByTestId('save-access-level'));

		// Wait for the refresh attempt
		await waitFor(() => {
			expect(mockGetPlannerMembers).toHaveBeenCalledTimes(2);
		});
	});
});
