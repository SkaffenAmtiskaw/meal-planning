import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserInvite } from '@/_actions/planner/getUserInvites';
import type { AccessLevel } from '@/_models/user';

import { InvitesSection } from './InvitesSection';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

const mockRefresh = vi.fn();

const { mockUseAsyncStatus } = vi.hoisted(() => {
	const mockUseAsyncStatus = vi.fn(() => ({
		status: 'idle' as AsyncStatus,
		error: null as string | null,
		run: vi.fn((fn: () => Promise<unknown>) => fn() as Promise<unknown>),
		reset: vi.fn(),
	}));
	return { mockUseAsyncStatus };
});

vi.mock('@/_hooks', () => ({
	useAsyncStatus: () => mockUseAsyncStatus(),
}));

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

const defaultAsyncStatus = () => ({
	status: 'idle' as AsyncStatus,
	error: null as string | null,
	run: vi.fn((fn: () => Promise<unknown>) => fn() as Promise<unknown>),
	reset: vi.fn(),
});

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
		mockUseAsyncStatus.mockImplementation(defaultAsyncStatus);
		mockRefresh.mockClear();
	});

	it('should render section title', () => {
		render(
			<InvitesSection
				invites={[]}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Pending Invites')).toBeDefined();
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

	it('should display planner name and inviter', () => {
		const invites = [
			createMockInvite({ plannerName: 'My Planner', invitedBy: 'Jane Smith' }),
		];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('My Planner')).toBeDefined();
		expect(screen.getByText(/Jane Smith/)).toBeDefined();
	});

	it('should show access level badge', () => {
		const invites = [createMockInvite({ accessLevel: 'admin' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByTestId('badge')).toBeDefined();
		expect(screen.getByText('admin')).toBeDefined();
	});

	it('should show invited date', () => {
		const invites = [
			createMockInvite({ invitedAt: '2024-01-15T00:00:00.000Z' }),
		];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText(/Jan 15, 2024/)).toBeDefined();
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

	it('should call onAccept with token when accept clicked', async () => {
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
	});

	it('should call onDecline with inviteId when decline clicked', async () => {
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
	});

	it('should disable buttons during action submitting', async () => {
		mockUseAsyncStatus.mockImplementation(() => ({
			status: 'loading' as AsyncStatus,
			error: null,
			run: vi.fn(),
			reset: vi.fn(),
		}));

		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		const acceptButton = screen.getByTestId('accept-button-invite-1');
		expect(acceptButton.getAttribute('disabled')).not.toBeNull();
	});

	it('should display action error when server action fails', async () => {
		mockUseAsyncStatus.mockImplementation(() => ({
			status: 'error' as AsyncStatus,
			error: 'Failed to accept invite',
			run: vi.fn(),
			reset: vi.fn(),
		}));

		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Failed to accept invite')).toBeDefined();
	});

	it('should display generic error message when error is provided without specific message', async () => {
		mockUseAsyncStatus.mockImplementation(() => ({
			status: 'error' as AsyncStatus,
			error: 'Failed to accept invite',
			run: vi.fn(),
			reset: vi.fn(),
		}));

		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Failed to accept invite')).toBeDefined();
	});

	it('should handle decline action success', async () => {
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
	});

	it('should handle decline action error', async () => {
		mockUseAsyncStatus.mockImplementation(() => ({
			status: 'error' as AsyncStatus,
			error: 'Failed to decline invite',
			run: vi.fn(),
			reset: vi.fn(),
		}));

		const invites = [createMockInvite({ id: 'invite-1' })];

		render(
			<InvitesSection
				invites={invites}
				onAccept={mockOnAccept}
				onDecline={mockOnDecline}
			/>,
		);

		expect(screen.getByText('Failed to decline invite')).toBeDefined();
	});

	describe('action integration', () => {
		it('should pass action function directly to run without wrapping', async () => {
			const mockRun = vi.fn(
				(fn: () => Promise<unknown>) => fn() as Promise<unknown>,
			);

			mockUseAsyncStatus.mockImplementation(() => ({
				status: 'idle' as AsyncStatus,
				error: null,
				run: mockRun,
				reset: vi.fn(),
			}));

			mockOnAccept.mockResolvedValue({
				ok: true,
				data: { plannerId: 'planner-123' },
			});

			const invites = [
				createMockInvite({ id: 'invite-1', token: 'token-123' }),
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
				expect(mockRun).toHaveBeenCalled();
			});

			// Verify the function passed to run is the action directly
			const passedFn = mockRun.mock.calls[0][0];
			expect(passedFn).toBeDefined();

			// Call the passed function and verify it returns the action result
			const result = await passedFn();
			expect(result).toEqual({ ok: true, data: { plannerId: 'planner-123' } });
			expect(mockOnAccept).toHaveBeenCalledWith({ token: 'token-123' });
		});

		it('should pass decline action function directly to run without wrapping', async () => {
			const mockRun = vi.fn(
				(fn: () => Promise<unknown>) => fn() as Promise<unknown>,
			);

			mockUseAsyncStatus.mockImplementation(() => ({
				status: 'idle' as AsyncStatus,
				error: null,
				run: mockRun,
				reset: vi.fn(),
			}));

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
				expect(mockRun).toHaveBeenCalled();
			});

			// Verify the function passed to run is the action directly
			const passedFn = mockRun.mock.calls[0][0];
			expect(passedFn).toBeDefined();

			// Call the passed function and verify it returns the action result
			const result = await passedFn();
			expect(result).toEqual({ ok: true, data: undefined });
			expect(mockOnDecline).toHaveBeenCalledWith({ inviteId: 'invite-1' });
		});

		it('should handle action returning ok: false without throwing', async () => {
			const mockRun = vi.fn(
				(fn: () => Promise<unknown>) => fn() as Promise<unknown>,
			);

			mockUseAsyncStatus.mockImplementation(() => ({
				status: 'idle' as AsyncStatus,
				error: null,
				run: mockRun,
				reset: vi.fn(),
			}));

			mockOnAccept.mockResolvedValue({ ok: false, error: 'Custom error' });

			const invites = [
				createMockInvite({ id: 'invite-1', token: 'token-123' }),
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
				expect(mockRun).toHaveBeenCalled();
			});

			// Verify the function passed to run returns the error result without throwing
			const passedFn = mockRun.mock.calls[0][0];
			expect(passedFn).toBeDefined();

			// Should resolve (not throw) and return the error result
			const result = await passedFn();
			expect(result).toEqual({ ok: false, error: 'Custom error' });
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
				mockOnAccept.mockResolvedValue({ ok: false, error: 'Accept failed' });

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

				// Wait a bit to ensure any async operations complete
				await waitFor(() => {
					expect(mockRefresh).not.toHaveBeenCalled();
				});
			});

			it('should not call router.refresh when decline fails', async () => {
				mockOnDecline.mockResolvedValue({ ok: false, error: 'Decline failed' });

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

				// Wait a bit to ensure any async operations complete
				await waitFor(() => {
					expect(mockRefresh).not.toHaveBeenCalled();
				});
			});
		});
	});
});
