import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { it } from '@test';
import { beforeEach, describe, expect, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/planner/invite.types';

import { InviteForm } from './InviteForm';
import { PendingInvitesList } from './PendingInvitesList';
import { PlannerItem } from './PlannerItem';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		refresh: mockRefresh,
	}),
}));

// Mock leavePlanner action
const mockLeavePlanner = vi.fn();
vi.mock('@/_actions/planner/leavePlanner', () => ({
	leavePlanner: (id: string) => mockLeavePlanner(id),
}));

// Mock ConfirmButton
const mockOnSuccessCallback = vi.fn();
vi.mock('@/_components', () => ({
	ConfirmButton: ({
		title,
		message,
		confirmButtonText,
		onConfirm,
		onSuccess,
		renderTrigger,
	}: {
		title: string;
		message: React.ReactNode;
		confirmButtonText?: string;
		onConfirm: () => Promise<{ ok: boolean; error?: string }>;
		onSuccess?: () => void;
		renderTrigger: (onOpen: () => void) => React.ReactNode;
	}) => {
		// Store onSuccess for test access
		if (onSuccess) {
			mockOnSuccessCallback.mockImplementation(onSuccess);
		}
		return (
			<>
				{renderTrigger(() => {
					// Trigger click handler
				})}
				<div data-testid="confirm-button">
					<div data-testid="confirm-title">{title}</div>
					<div data-testid="confirm-message">{message}</div>
					<div data-testid="confirm-button-text">{confirmButtonText}</div>
					<button
						data-testid="confirm-action"
						onClick={async () => {
							const result = await onConfirm();
							if (result.ok && onSuccess) {
								onSuccess();
							}
						}}
						type="button"
					>
						Confirm Action
					</button>
				</div>
			</>
		);
	},
	FormFeedbackAlert: ({
		status,
		errorMessage,
	}: {
		status: string;
		errorMessage?: string;
	}) =>
		status === 'error' && errorMessage ? (
			<div data-testid="form-feedback-alert">{errorMessage}</div>
		) : null,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_utils/date', () => ({
	toLocaleDateString: (date: string) =>
		new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}),
	isPastDate: () => false,
	isWithinHours: () => false,
}));

vi.mock('./MemberListContainer', () => ({
	MemberListContainer: ({ plannerId }: { plannerId: string }) => (
		<div data-testid="member-list" data-planner-id={plannerId} />
	),
}));

vi.mock('./InviteForm', () => ({
	InviteForm: vi.fn(() => <div data-testid="invite-form" />),
}));

vi.mock('./PendingInvitesList', () => ({
	PendingInvitesList: vi.fn(() => <div data-testid="pending-invites-list" />),
}));

const mockUseRenamePlanner = vi.fn();
vi.mock('./useRenamePlanner', () => ({
	useRenamePlanner: (...args: unknown[]) => mockUseRenamePlanner(...args),
}));

const mockInviteUser = vi.fn();
const mockCancelInvite = vi.fn();

interface UseInvitesReturn {
	invites: PendingInvite[];
	loading: boolean;
	error: string | null;
	inviteStatus: 'idle' | 'loading' | 'success' | 'error';
	inviteError: string | null;
	cancelStatus: 'idle' | 'loading' | 'success' | 'error';
	cancelError: string | null;
	inviteUser: typeof mockInviteUser;
	cancelInvite: typeof mockCancelInvite;
}

const mockUseInvites = vi.fn(
	(): UseInvitesReturn => ({
		invites: [],
		loading: false,
		error: null,
		inviteStatus: 'idle',
		inviteError: null,
		cancelStatus: 'idle',
		cancelError: null,
		inviteUser: mockInviteUser,
		cancelInvite: mockCancelInvite,
	}),
);
vi.mock('../_hooks/useInvites', () => ({
	useInvites: () => mockUseInvites(),
}));

const id = '507f1f77bcf86cd799439011';
const name = "Ariel's Planner";

const notEditingState = {
	editing: false,
	name,
	setName: vi.fn(),
	loading: false,
	error: null,
	enterEditing: vi.fn(),
	cancel: vi.fn(),
	save: vi.fn(),
};

const editingState = {
	...notEditingState,
	editing: true,
};

describe('planner item component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRefresh.mockClear();
		mockLeavePlanner.mockClear();
		mockOnSuccessCallback.mockClear();
	});

	describe('rename planner', () => {
		it.byAccessLevels(
			'only allows admins and owners to rename the planner',
			({ accessLevel, expect }) => {
				mockUseRenamePlanner.mockReturnValue(notEditingState);

				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				const input = screen.queryByTestId('planner-name-input');

				expect(input).atMinLevel('admin').toBeTruthy();
			},
		);

		it('shows disabled name input in accordion panel by default', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const input = screen.getByTestId('planner-name-input');
			expect(input).toBeDefined();
			expect(input.getAttribute('disabled')).not.toBeNull();
		});

		it('shows rename button when not editing', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('rename-button')).toBeDefined();
			expect(screen.queryByTestId('save-name-button')).toBeNull();
			expect(screen.queryByTestId('cancel-rename-button')).toBeNull();
		});

		it('shows Save and Cancel buttons when editing', () => {
			mockUseRenamePlanner.mockReturnValue(editingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.queryByTestId('rename-button')).toBeNull();
			expect(screen.getByTestId('save-name-button')).toBeDefined();
			expect(screen.getByTestId('cancel-rename-button')).toBeDefined();
		});

		it('enables input when editing', () => {
			mockUseRenamePlanner.mockReturnValue(editingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const input = screen.getByTestId('planner-name-input');
			expect(input.getAttribute('disabled')).toBeNull();
		});

		it('calls enterEditing when rename button clicked', () => {
			const enterEditing = vi.fn();
			mockUseRenamePlanner.mockReturnValue({
				...notEditingState,
				enterEditing,
			});

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			fireEvent.click(screen.getByTestId('rename-button'));
			expect(enterEditing).toHaveBeenCalled();
		});

		it('calls setName when input changes during editing', () => {
			const setName = vi.fn();
			mockUseRenamePlanner.mockReturnValue({ ...editingState, setName });

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			fireEvent.change(screen.getByTestId('planner-name-input'), {
				target: { value: 'New Name' },
			});

			expect(setName).toHaveBeenCalledWith('New Name');
		});

		it('calls save when save button clicked', () => {
			const save = vi.fn();
			mockUseRenamePlanner.mockReturnValue({ ...editingState, save });

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			fireEvent.click(screen.getByTestId('save-name-button'));
			expect(save).toHaveBeenCalled();
		});

		it('calls cancel when cancel button clicked', () => {
			const cancel = vi.fn();
			mockUseRenamePlanner.mockReturnValue({ ...editingState, cancel });

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			fireEvent.click(screen.getByTestId('cancel-rename-button'));
			expect(cancel).toHaveBeenCalled();
		});

		it('renders error alert in panel when error is set', () => {
			mockUseRenamePlanner.mockReturnValue({
				...editingState,
				error: 'Invalid name',
			});

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('rename-error')).toBeDefined();
			expect(screen.getByTestId('rename-error').textContent).toBe(
				'Invalid name',
			);
		});

		it('shows loading state on save button when loading', () => {
			mockUseRenamePlanner.mockReturnValue({ ...editingState, loading: true });

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const saveButton = screen.getByTestId('save-name-button');
			expect(saveButton.getAttribute('data-loading')).toBe('true');
			expect(saveButton.getAttribute('disabled')).not.toBeNull();
		});
	});

	describe('accordion panel content', () => {
		it.byAccessLevels(
			'only shows member list for admins and owners',
			({ accessLevel, expect }) => {
				mockUseRenamePlanner.mockReturnValue(notEditingState);

				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				const memberList = screen.queryByTestId('member-list');

				expect(memberList).atMinLevel('admin').toBeTruthy();
			},
		);

		it.byAccessLevels(
			'shows access level info text for read and write access',
			({ accessLevel, expect }) => {
				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				const accessLevelInfo = screen.queryByTestId('access-level-info');

				expect(accessLevelInfo).atMaxLevel('write').toBeTruthy();
			},
		);
	});

	describe('leave planner button', () => {
		it.byAccessLevels(
			'shows leave planner button for non-owners',
			({ accessLevel, expect }) => {
				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				const button = screen.queryByTestId('confirm-button');

				expect(button).atMaxLevel('admin').toBeTruthy();
			},
		);

		it('displays confirmation modal with correct title and message', () => {
			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			expect(screen.getByTestId('confirm-title').textContent).toBe(
				'Leave Planner',
			);
			expect(screen.getByTestId('confirm-message').textContent).toContain(
				'Are you sure you want to leave this planner?',
			);
			expect(screen.getByTestId('confirm-button-text').textContent).toBe(
				'Leave Planner',
			);
		});

		it('calls leavePlanner with planner ID when confirmed', async () => {
			mockLeavePlanner.mockResolvedValue({ ok: true });

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockLeavePlanner).toHaveBeenCalledWith(id);
			});
		});

		it('calls router.refresh when leave succeeds', async () => {
			mockLeavePlanner.mockResolvedValue({ ok: true });

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockRefresh).toHaveBeenCalled();
			});
		});

		it('does not call router.refresh when leave fails', async () => {
			mockLeavePlanner.mockResolvedValue({
				ok: false,
				error: 'Failed to leave planner',
			});

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockLeavePlanner).toHaveBeenCalledWith(id);
			});

			expect(mockRefresh).not.toHaveBeenCalled();
		});

		it('calls router.refresh for write access level after successful leave', async () => {
			mockLeavePlanner.mockResolvedValue({ ok: true });

			render(<PlannerItem id={id} name={name} accessLevel="write" />);

			expect(screen.getByTestId('confirm-button')).toBeDefined();

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockLeavePlanner).toHaveBeenCalledWith(id);
				expect(mockRefresh).toHaveBeenCalled();
			});
		});
	});

	describe('useRenamePlanner integration', () => {
		it('passes id and name to useRenamePlanner', () => {
			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(mockUseRenamePlanner).toHaveBeenCalledWith(id, name);
		});
	});

	describe('invite functionality', () => {
		it('passes invite props to InviteForm', () => {
			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(vi.mocked(InviteForm)).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'idle',
					error: null,
					onInvite: expect.any(Function),
				}),
				undefined,
			);
		});

		it('wires onInvite to inviteUser', () => {
			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const calls = vi.mocked(InviteForm).mock.calls;
			const props = calls[0][0] as { onInvite: (email: string) => void };
			props.onInvite('test@example.com');

			expect(mockInviteUser).toHaveBeenCalledWith('test@example.com');
		});

		it('displays invites error when present', () => {
			mockUseInvites.mockReturnValue({
				invites: [],
				loading: false,
				error: 'Failed to load invites',
				inviteStatus: 'idle',
				inviteError: null,
				cancelStatus: 'idle',
				cancelError: null,
				inviteUser: mockInviteUser,
				cancelInvite: mockCancelInvite,
			});

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('invites-error')).toBeDefined();
			expect(screen.getByTestId('invites-error').textContent).toBe(
				'Failed to load invites',
			);
		});
	});

	describe('pending invites functionality', () => {
		it('passes pending invites props to PendingInvitesList', () => {
			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(vi.mocked(PendingInvitesList)).toHaveBeenCalledWith(
				expect.objectContaining({
					invites: expect.any(Array),
					loading: false,
					cancelStatus: 'idle',
					cancelError: null,
					onCancel: expect.any(Function),
				}),
				undefined,
			);
		});

		it('wires onCancel to cancelInvite', () => {
			const mockInvite: PendingInvite = {
				id: 'invite-123',
				email: 'invited@example.com',
				accessLevel: 'write',
				invitedAt: new Date().toISOString(),
				expiresAt: new Date(Date.now() + 86400000).toISOString(),
			};
			mockUseInvites.mockReturnValue({
				invites: [mockInvite],
				loading: false,
				error: null,
				inviteStatus: 'idle',
				inviteError: null,
				cancelStatus: 'idle',
				cancelError: null,
				inviteUser: mockInviteUser,
				cancelInvite: mockCancelInvite,
			});

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const calls = vi.mocked(PendingInvitesList).mock.calls;
			const props = calls[0][0] as { onCancel: (inviteId: string) => void };
			props.onCancel('invite-123');

			expect(mockCancelInvite).toHaveBeenCalledWith('invite-123');
		});
	});
});
