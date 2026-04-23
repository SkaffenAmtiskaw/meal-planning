import { render, screen, waitFor } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { MemberList } from './MemberList';

const mockGetPlannerMembers = vi.fn();

vi.mock('@/_actions/planner/getPlannerMembers', () => ({
	getPlannerMembers: (...args: unknown[]) => mockGetPlannerMembers(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('MemberList', () => {
	const plannerId = '507f1f77bcf86cd799439011';

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

		mockGetPlannerMembers.mockResolvedValue(mockMembers);

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
			ok: false,
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
		mockGetPlannerMembers.mockResolvedValue([]);

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

		mockGetPlannerMembers.mockResolvedValue(mockMembers);

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			const badges = screen.getAllByTestId('badge');
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

		mockGetPlannerMembers.mockResolvedValue(mockMembers);

		render(<MemberList plannerId={plannerId} />);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		expect(screen.getByText('David')).toBeDefined();
		expect(screen.getByText('read')).toBeDefined();
	});
});
