import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/planner/invite.types';
import type { AccessLevel } from '@/_models/user';

import { PlannerItem } from './PlannerItem';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

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
vi.mock('@/_components', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/_components')>();
	return {
		...actual,
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
	};
});

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return actual;
});

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

describe('PlannerItem', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRefresh.mockClear();
		mockLeavePlanner.mockClear();
		mockOnSuccessCallback.mockClear();
	});

	describe('renders', () => {
		it('renders accordion with planner name in control', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('accordion')).toBeDefined();
			expect(screen.getByTestId('accordion-item')).toBeDefined();
			expect(screen.getByTestId('accordion-control')).toBeDefined();
			expect(screen.getByTestId('accordion-panel')).toBeDefined();
		});

		it('displays planner name in accordion control', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const control = screen.getByTestId('accordion-control');
			expect(control.textContent).toContain(name);
		});
	});

	describe('inline rename functionality', () => {
		it('shows disabled name input in accordion panel by default', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const input = screen.getByTestId('planner-name-input');
			expect(input).toBeDefined();
			expect(input.getAttribute('disabled')).not.toBeNull();
		});

		it('shows Rename button when not editing', () => {
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

	describe('accordion stays open', () => {
		it('renders accordion when editing', () => {
			mockUseRenamePlanner.mockReturnValue(editingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			// Accordion should still be rendered
			expect(screen.getByTestId('accordion')).toBeDefined();
			expect(screen.getByTestId('accordion-panel')).toBeDefined();
			// And panel should contain the inline editing UI
			expect(screen.getByTestId('planner-name-input')).toBeDefined();
		});

		it('keeps MemberList visible when editing', () => {
			mockUseRenamePlanner.mockReturnValue(editingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('member-list')).toBeDefined();
		});
	});

	describe('access level badges', () => {
		const testCases: {
			accessLevel: AccessLevel;
			shouldShowBadge: boolean;
			expectedColor?: string;
		}[] = [
			{ accessLevel: 'owner', shouldShowBadge: false },
			{ accessLevel: 'admin', shouldShowBadge: true, expectedColor: 'orange' },
			{ accessLevel: 'write', shouldShowBadge: true, expectedColor: 'blue' },
			{ accessLevel: 'read', shouldShowBadge: true, expectedColor: 'gray' },
		];

		testCases.forEach(({ accessLevel, shouldShowBadge, expectedColor }) => {
			it(`for ${accessLevel} access, badge ${shouldShowBadge ? 'is shown' : 'is not shown'}`, () => {
				mockUseRenamePlanner.mockReturnValue(notEditingState);

				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				const badge = screen.queryByTestId('access-level-badge');
				if (shouldShowBadge) {
					expect(badge).toBeDefined();
					expect(badge?.getAttribute('data-color')).toBe(expectedColor);
					expect(badge?.textContent).toBe(accessLevel);
				} else {
					expect(badge).toBeNull();
				}
			});
		});
	});

	describe('accordion panel content', () => {
		it('shows MemberList for owner access level', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('member-list')).toBeDefined();
			expect(
				screen.getByTestId('member-list').getAttribute('data-planner-id'),
			).toBe(id);
		});

		it('shows MemberList for admin access level', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			expect(screen.getByTestId('member-list')).toBeDefined();
		});

		it('does not show MemberList for write access level', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="write" />);

			expect(screen.queryByTestId('member-list')).toBeNull();
		});

		it('does not show MemberList for read access level', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="read" />);

			expect(screen.queryByTestId('member-list')).toBeNull();
		});

		it('shows access level info text for write users', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="write" />);

			expect(
				screen.getByText(/You have write access to this planner/),
			).toBeDefined();
		});

		it('shows access level info text for read users', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="read" />);

			expect(
				screen.getByText(/You have read access to this planner/),
			).toBeDefined();
		});
	});

	describe('leave planner button', () => {
		it('does NOT show Leave Planner button for owner', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.queryByTestId('confirm-button')).toBeNull();
		});

		it('shows Leave Planner button for admin access', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			expect(screen.getByTestId('confirm-button')).toBeDefined();
		});

		it('shows Leave Planner button for write access', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="write" />);

			expect(screen.getByTestId('confirm-button')).toBeDefined();
		});

		it('shows Leave Planner button for read access', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="read" />);

			expect(screen.getByTestId('confirm-button')).toBeDefined();
		});

		it('displays confirmation modal with correct title and message', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

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
			mockUseRenamePlanner.mockReturnValue(notEditingState);
			mockLeavePlanner.mockResolvedValue({ ok: true });

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockLeavePlanner).toHaveBeenCalledWith(id);
			});
		});

		it('calls router.refresh when leave succeeds', async () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);
			mockLeavePlanner.mockResolvedValue({ ok: true });

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			fireEvent.click(screen.getByTestId('confirm-action'));

			await waitFor(() => {
				expect(mockRefresh).toHaveBeenCalled();
			});
		});

		it('does not call router.refresh when leave fails', async () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);
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
			mockUseRenamePlanner.mockReturnValue(notEditingState);
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

	describe('rename button visibility by access level', () => {
		it('shows rename button in panel for owner', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(screen.getByTestId('rename-button')).toBeDefined();
		});

		it('shows rename button in panel for admin', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			expect(screen.getByTestId('rename-button')).toBeDefined();
		});

		it('does not show rename button for write access', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="write" />);

			expect(screen.queryByTestId('rename-button')).toBeNull();
		});

		it('does not show rename button for read access', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="read" />);

			expect(screen.queryByTestId('rename-button')).toBeNull();
		});
	});

	describe('useRenamePlanner integration', () => {
		it('passes id and name to useRenamePlanner', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			expect(mockUseRenamePlanner).toHaveBeenCalledWith(id, name);
		});
	});

	describe('invite functionality', () => {
		it('calls inviteUser when invite form is submitted with valid email', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);
			mockInviteUser.mockResolvedValue(undefined);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const emailInput = screen.getByTestId('input-Email address');
			fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

			fireEvent.click(screen.getByTestId('invite-button'));

			expect(mockInviteUser).toHaveBeenCalledWith('test@example.com');
		});

		it('displays invites error when present', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);
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

	describe('cancel invite functionality', () => {
		it('calls cancelInvite when cancel button is clicked on a pending invite', () => {
			const inviteId = 'invite-123';
			mockUseRenamePlanner.mockReturnValue(notEditingState);
			const mockInvite: PendingInvite = {
				id: inviteId,
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
			mockCancelInvite.mockResolvedValue(undefined);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			fireEvent.click(screen.getByTestId(`cancel-button-${inviteId}`));

			expect(mockCancelInvite).toHaveBeenCalledWith(inviteId);
		});
	});
});

describe('getAccessLevelColor', () => {
	it('returns red for owner', () => {
		expect(getAccessLevelColor('owner')).toBe('red');
	});

	it('returns orange for admin', () => {
		expect(getAccessLevelColor('admin')).toBe('orange');
	});

	it('returns blue for write', () => {
		expect(getAccessLevelColor('write')).toBe('blue');
	});

	it('returns gray for read', () => {
		expect(getAccessLevelColor('read')).toBe('gray');
	});
});
