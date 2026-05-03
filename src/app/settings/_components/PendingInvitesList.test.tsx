import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/planner/invite.types';
import type { AccessLevel } from '@/_models/user';
import { isPastDate, isWithinHours } from '@/_utils/date';

import { PendingInvitesList } from './PendingInvitesList';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconX: () => <span data-testid="icon-x">X</span>,
	IconClock: () => <span data-testid="icon-clock">Clock</span>,
}));

vi.mock('../_utils/getAccessLevelColor', () => ({
	getAccessLevelColor: vi.fn((level: AccessLevel) => {
		const colors: Record<AccessLevel, string> = {
			owner: 'red',
			admin: 'orange',
			write: 'blue',
			read: 'gray',
		};
		return colors[level];
	}),
}));

vi.mock('@/_utils/date', () => ({
	isPastDate: vi.fn(),
	isWithinHours: vi.fn(),
	getRelativeTime: vi.fn((date: string) => `Relative: ${date}`),
	toLocaleDateString: vi.fn((date: string) => `Formatted: ${date}`),
}));

describe('PendingInvitesList', () => {
	// Use a future date for expiresAt so it's not expired
	const mockInvite: PendingInvite = {
		id: 'invite-1',
		email: 'test@example.com',
		accessLevel: 'write',
		invitedAt: '2024-01-01T00:00:00.000Z',
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
	};

	const mockOnCancel = vi.fn();
	const mockIsPastDate = vi.mocked(isPastDate);
	const mockIsWithinHours = vi.mocked(isWithinHours);

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsPastDate.mockReturnValue(false);
		mockIsWithinHours.mockReturnValue(false);
	});

	it('shows loading state', () => {
		render(
			<PendingInvitesList
				invites={[]}
				loading={true}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		expect(screen.getByText('Loading pending invites...')).toBeDefined();
	});

	it('shows empty message when no invites', () => {
		render(
			<PendingInvitesList
				invites={[]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		expect(screen.getByText('No pending invites')).toBeDefined();
	});

	it('calls onCancel when cancel button clicked', () => {
		render(
			<PendingInvitesList
				invites={[mockInvite]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		const cancelButton = screen.getByTestId('cancel-button-invite-1');
		fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalledWith('invite-1');
	});

	it('disables cancel button when cancelStatus is loading', () => {
		render(
			<PendingInvitesList
				invites={[mockInvite]}
				loading={false}
				cancelStatus="loading"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		const cancelButton = screen.getByTestId('cancel-button-invite-1');
		expect(cancelButton.getAttribute('disabled')).not.toBeNull();
	});

	it('shows expiration warning for invites expiring soon', () => {
		mockIsWithinHours.mockReturnValue(true);
		mockIsPastDate.mockReturnValue(false);

		// Create an invite that expires in 12 hours
		const soonToExpireInvite: PendingInvite = {
			...mockInvite,
			id: 'invite-2',
			expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
		};

		render(
			<PendingInvitesList
				invites={[soonToExpireInvite]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		// Should show clock icon
		expect(screen.getByTestId('icon-clock')).toBeDefined();
	});

	it('shows expired message for expired invites', () => {
		mockIsPastDate.mockReturnValue(true);

		// Create an invite that expired yesterday
		const expiredInvite: PendingInvite = {
			...mockInvite,
			id: 'invite-3',
			expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		};

		render(
			<PendingInvitesList
				invites={[expiredInvite]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		// Should show clock icon and expired message
		expect(screen.getByTestId('icon-clock')).toBeDefined();
		expect(screen.getByText(/Expired/)).toBeDefined();
	});

	it('displays cancel error when present', () => {
		render(
			<PendingInvitesList
				invites={[mockInvite]}
				loading={false}
				cancelStatus="error"
				cancelError="Failed to cancel invite"
				onCancel={mockOnCancel}
			/>,
		);

		expect(screen.getByText('Failed to cancel invite')).toBeDefined();
	});
});
