import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/sharing';
import { isPastDate, isWithinHours } from '@/_utils/date';

import { PendingInvitesList } from './PendingInvitesList';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../_utils/getAccessLevelColor', async () => ({
	getAccessLevelColor: vi.fn(() => 'blue'),
}));

vi.mock('@/_utils/date', async () => ({
	isPastDate: vi.fn(),
	isWithinHours: vi.fn(),
	toLocaleDateString: vi.fn(() => 'mock-date'),
}));

describe('PendingInvitesList', () => {
	const mockInvite: PendingInvite = {
		id: 'invite-1',
		email: 'test@example.com',
		accessLevel: 'write',
		invitedAt: '2024-01-01T00:00:00.000Z',
		expiresAt: '2024-12-31T00:00:00.000Z',
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

		const soonToExpireInvite: PendingInvite = {
			...mockInvite,
			id: 'invite-2',
			expiresAt: '2024-06-15T00:00:00.000Z',
		};

		const { container } = render(
			<PendingInvitesList
				invites={[soonToExpireInvite]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		expect(container.querySelector('.tabler-icon-clock')).not.toBeNull();
	});

	it('shows expired message for expired invites', () => {
		mockIsPastDate.mockReturnValue(true);

		const expiredInvite: PendingInvite = {
			...mockInvite,
			id: 'invite-3',
			expiresAt: '2023-12-31T00:00:00.000Z',
		};

		const { container } = render(
			<PendingInvitesList
				invites={[expiredInvite]}
				loading={false}
				cancelStatus="idle"
				cancelError={null}
				onCancel={mockOnCancel}
			/>,
		);

		expect(container.querySelector('.tabler-icon-clock')).not.toBeNull();
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
