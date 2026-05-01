import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserInvite } from '@/_actions/planner/getUserInvites';
import type { AccessLevel } from '@/_models/user';

import { InvitesSection } from './InvitesSection';

const mockRefresh = vi.fn();

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		refresh: mockRefresh,
	}),
}));

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return {
		...actual,
		Loader: () => <span data-testid="loader">Loading...</span>,
	};
});

vi.mock('@tabler/icons-react', () => ({
	IconCheck: () => <span data-testid="icon-check">Check</span>,
	IconX: () => <span data-testid="icon-x">X</span>,
	IconClock: () => <span data-testid="icon-clock">Clock</span>,
}));

vi.mock('@/_utils/date', () => ({
	toLocaleDateString: vi.fn((dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}),
	isWithinHours: vi.fn((dateString: string, hoursThreshold = 24) => {
		const targetDate = new Date(dateString);
		const now = new Date();
		const diffMs = targetDate.getTime() - now.getTime();
		const diffHours = diffMs / (1000 * 60 * 60);
		return diffHours <= hoursThreshold && diffHours > 0;
	}),
	isPastDate: vi.fn((dateString: string) => {
		const targetDate = new Date(dateString);
		const now = new Date();
		return targetDate.getTime() < now.getTime();
	}),
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

	// Use a future date for expiresAt so it's not expired
	const createMockInvite = (
		overrides: Partial<UserInvite> = {},
	): UserInvite => ({
		id: 'invite-1',
		plannerId: 'planner-1',
		plannerName: 'Test Planner',
		invitedBy: 'John Doe',
		accessLevel: 'write',
		invitedAt: '2024-01-15T00:00:00.000Z',
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
		token: 'test-token-123',
		...overrides,
	});

	beforeEach(() => {
		vi.resetAllMocks();
		mockRefresh.mockClear();
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

	it('should show expiration warning when near expiry', () => {
		// Create an invite that expires in 12 hours
		const invites = [
			createMockInvite({
				id: 'invite-soon',
				expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
			}),
		];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByTestId('icon-clock')).toBeDefined();
	});

	it('should show expired message when expired', () => {
		// Create an invite that expired yesterday
		const invites = [
			createMockInvite({
				id: 'invite-expired',
				expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			}),
		];

		render(
			<InvitesSection
				invites={invites}
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
