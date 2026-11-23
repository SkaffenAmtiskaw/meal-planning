import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/sharing';
import { useViewerZoneFormat } from '@/_hooks';
import { isPastDate, isWithinHours } from '@/_utils/date';

import { PendingInvitesList } from './PendingInvitesList';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../_utils/getAccessLevelColor', async () => ({
	getAccessLevelColor: vi.fn(() => 'blue'),
}));

vi.mock('@/_utils/date', async () => ({
	isPastDate: vi.fn(),
	isWithinHours: vi.fn(),
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
		vi.mocked(useViewerZoneFormat).mockReset();
		mockIsPastDate.mockReturnValue(false);
		mockIsWithinHours.mockReturnValue(false);
	});

	describe('invite dates', () => {
		const invite: PendingInvite = {
			...mockInvite,
			invitedAt: '2024-01-15T12:00:00.000Z',
			expiresAt: '2024-01-22T12:00:00.000Z',
		};

		const renderList = () =>
			render(
				<PendingInvitesList
					invites={[invite]}
					loading={false}
					cancelStatus="idle"
					cancelError={null}
					onCancel={mockOnCancel}
				/>,
			);

		const unknownZone = {
			isKnown: false,
			format: () => 'Jan 15, 2024',
		};

		it('shows the invited and expiry dates in the viewer’s time zone', () => {
			renderList();

			expect(screen.getByText('Invited Jan 15, 2024')).toBeDefined();
			expect(screen.getByText('Expires Jan 22, 2024')).toBeDefined();
		});

		it('shows both dates as skeletons while the time zone is unknown', () => {
			vi.mocked(useViewerZoneFormat).mockReturnValue(unknownZone);

			renderList();

			expect(
				screen
					.getByTestId('invited-date-skeleton')
					.getAttribute('data-visible'),
			).toBe('true');
			expect(
				screen
					.getByTestId('expires-date-skeleton')
					.getAttribute('data-visible'),
			).toBe('true');
		});

		it('shows both dates once the time zone is known', () => {
			renderList();

			expect(
				screen
					.getByTestId('invited-date-skeleton')
					.getAttribute('data-visible'),
			).toBe('false');
			expect(
				screen
					.getByTestId('expires-date-skeleton')
					.getAttribute('data-visible'),
			).toBe('false');
		});

		it('shows an expired invite’s label right away, with no date to hold back', () => {
			vi.mocked(useViewerZoneFormat).mockReturnValue(unknownZone);
			mockIsPastDate.mockReturnValue(true);

			renderList();

			expect(screen.queryByTestId('expires-date-skeleton')).toBeNull();
			expect(screen.getByText('Expired')).toBeDefined();
		});
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
