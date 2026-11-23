import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRouter } from 'next/navigation';

import type { UserInvite } from '@/_actions/sharing';
import { useViewerZoneFormat } from '@/_hooks';
import type { AccessLevel } from '@/_models/user';
import { isPastDate, isWithinHours } from '@/_utils/date';

import { InvitesSection } from './InvitesSection';

const mockRefresh = vi.fn();

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconCheck: () => <span data-testid="icon-check">Check</span>,
	IconX: () => <span data-testid="icon-x">X</span>,
	IconClock: () => <span data-testid="icon-clock">Clock</span>,
}));

vi.mock('@/_utils/date', async () => ({
	isPastDate: vi.fn(),
	isWithinHours: vi.fn(),
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

describe('InvitesSection', () => {
	const mockOnAccept = vi.fn();
	const mockOnDecline = vi.fn();

	const mockIsPastDate = vi.mocked(isPastDate);
	const mockIsWithinHours = vi.mocked(isWithinHours);

	const createMockInvite = (
		overrides: Partial<UserInvite> = {},
	): UserInvite => ({
		id: 'invite-1',
		plannerId: 'planner-1',
		plannerName: 'Test Planner',
		invitedBy: 'John Doe',
		accessLevel: 'write',
		invitedAt: '2024-01-15T12:00:00.000Z',
		expiresAt: '2024-01-22T12:00:00.000Z',
		token: 'test-token-123',
		...overrides,
	});

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useViewerZoneFormat).mockReset();
		mockIsPastDate.mockReturnValue(false);
		mockIsWithinHours.mockReturnValue(false);
	});

	it('should show empty message when no invites', () => {
		render(
			<InvitesSection
				invites={[]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('No pending invites')).toBeDefined();
	});

	it('should render list of invites', () => {
		const invites = [
			createMockInvite(),
			createMockInvite({ id: 'invite-2', plannerName: 'Second Planner' }),
		];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Test Planner')).toBeDefined();
		expect(screen.getByText('Second Planner')).toBeDefined();
	});

	it('shows the invited date in the viewer’s time zone', () => {
		render(
			<InvitesSection
				invites={[createMockInvite()]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Invited Jan 15, 2024')).toBeDefined();
	});

	it('shows the invited date as a skeleton while the time zone is unknown', () => {
		vi.mocked(useViewerZoneFormat).mockReturnValue({
			isKnown: false,
			format: () => 'Jan 15, 2024',
		});

		render(
			<InvitesSection
				invites={[createMockInvite()]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(
			screen.getByTestId('invited-date-skeleton').getAttribute('data-visible'),
		).toBe('true');
	});

	it('shows the invited date once the time zone is known', () => {
		render(
			<InvitesSection
				invites={[createMockInvite()]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(
			screen.getByTestId('invited-date-skeleton').getAttribute('data-visible'),
		).toBe('false');
	});

	it('should show expiration warning when near expiry', () => {
		mockIsWithinHours.mockReturnValue(true);

		render(
			<InvitesSection
				invites={[createMockInvite()]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByTestId('icon-clock')).toBeDefined();
	});

	it('should show expired message when expired', () => {
		mockIsPastDate.mockReturnValue(true);

		render(
			<InvitesSection
				invites={[createMockInvite()]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByTestId('icon-clock')).toBeDefined();
		expect(screen.getByText(/Expired/)).toBeDefined();
	});

	it('should call onAccept with token when accept clicked', () => {
		const invites = [
			createMockInvite({ id: 'invite-1', token: 'token-abc-123' }),
		];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const acceptButton = screen.getByTestId('accept-button-invite-1');
		fireEvent.click(acceptButton);

		expect(mockOnAccept).toHaveBeenCalledWith({ token: 'token-abc-123' });
	});

	it('should call onDecline with inviteId when decline clicked', () => {
		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const declineButton = screen.getByTestId('decline-button-invite-1');
		fireEvent.click(declineButton);

		expect(mockOnDecline).toHaveBeenCalledWith({ inviteId: 'invite-1' });
	});

	it('should disable buttons while action is in progress', async () => {
		const invites = [createMockInvite({ id: 'invite-1', token: 'token-123' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const acceptButton = screen.getByTestId('accept-button-invite-1');
		const declineButton = screen.getByTestId('decline-button-invite-1');

		// Click accept - this should put it in loading state
		fireEvent.click(acceptButton);

		// Buttons should be disabled while loading
		await waitFor(() => {
			expect(acceptButton.getAttribute('disabled')).not.toBeNull();
			expect(declineButton.getAttribute('disabled')).not.toBeNull();
		});
	});

	it('should display error when action fails', async () => {
		mockOnAccept.mockRejectedValue(new Error('Failed to accept'));

		const invites = [createMockInvite({ id: 'invite-1', token: 'token-123' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const acceptButton = screen.getByTestId('accept-button-invite-1');
		fireEvent.click(acceptButton);

		// Error should be displayed after action fails
		await waitFor(() => {
			expect(screen.getByTestId('action-error')).toBeDefined();
		});
	});

	it('should display error when decline fails', async () => {
		mockOnDecline.mockRejectedValue(new Error('Failed to decline'));

		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const declineButton = screen.getByTestId('decline-button-invite-1');
		fireEvent.click(declineButton);

		// Error should be displayed after action fails
		await waitFor(() => {
			expect(screen.getByTestId('action-error')).toBeDefined();
		});
	});

	describe('router.refresh', () => {
		it('should call router.refresh after successful accept', async () => {
			mockOnAccept.mockResolvedValue({
				ok: true,
				data: { plannerId: 'planner-1' },
			});

			const invites = [
				createMockInvite({ id: 'invite-1', token: 'token-abc-123' }),
			];

			render(
				<InvitesSection
					invites={invites}
					onAccept={mockOnAccept}
					onDecline={mockOnDecline}
				/>,
			);

			const acceptButton = screen.getByTestId('accept-button-invite-1');
			fireEvent.click(acceptButton);

			await waitFor(() => {
				expect(mockOnAccept).toHaveBeenCalledWith({ token: 'token-abc-123' });
			});

			await waitFor(() => {
				expect(mockRefresh).toHaveBeenCalledTimes(1);
			});
		});

		it('should call router.refresh after successful decline', async () => {
			mockOnDecline.mockResolvedValue({ ok: true, data: undefined });

			const invites = [createMockInvite({ id: 'invite-1' })];

			render(
				<InvitesSection
					invites={invites}
					onAccept={mockOnAccept}
					onDecline={mockOnDecline}
				/>,
			);

			const declineButton = screen.getByTestId('decline-button-invite-1');
			fireEvent.click(declineButton);

			await waitFor(() => {
				expect(mockOnDecline).toHaveBeenCalledWith({ inviteId: 'invite-1' });
			});

			await waitFor(() => {
				expect(mockRefresh).toHaveBeenCalledTimes(1);
			});
		});

		it('should not call router.refresh when accept fails', async () => {
			mockOnAccept.mockRejectedValue(new Error('Accept failed'));

			const invites = [
				createMockInvite({ id: 'invite-1', token: 'token-abc-123' }),
			];

			render(
				<InvitesSection
					invites={invites}
					onAccept={mockOnAccept}
					onDecline={mockOnDecline}
				/>,
			);

			const acceptButton = screen.getByTestId('accept-button-invite-1');
			fireEvent.click(acceptButton);

			await waitFor(() => {
				expect(mockOnAccept).toHaveBeenCalledWith({ token: 'token-abc-123' });
			});

			await waitFor(() => {
				expect(mockRefresh).not.toHaveBeenCalled();
			});
		});

		it('should not call router.refresh when decline fails', async () => {
			mockOnDecline.mockRejectedValue(new Error('Decline failed'));

			const invites = [createMockInvite({ id: 'invite-1' })];

			render(
				<InvitesSection
					invites={invites}
					onAccept={mockOnAccept}
					onDecline={mockOnDecline}
				/>,
			);

			const declineButton = screen.getByTestId('decline-button-invite-1');
			fireEvent.click(declineButton);

			await waitFor(() => {
				expect(mockOnDecline).toHaveBeenCalledWith({ inviteId: 'invite-1' });
			});

			await waitFor(() => {
				expect(mockRefresh).not.toHaveBeenCalled();
			});
		});
	});
});
