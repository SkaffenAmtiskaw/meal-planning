import { useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { it } from '@test';
import { beforeAll, beforeEach, describe, expect, vi } from 'vitest';

import { leavePlanner } from '@/_actions/sharing';
import { ConfirmButton } from '@/_components';

import { InviteForm } from './InviteForm';
import { PendingInvitesList } from './PendingInvitesList';
import { PlannerItem } from './PlannerItem';

import type { UseInvitesResult } from '../_hooks/useInvites';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

vi.mock('@/_components', () => ({
	ConfirmButton: vi.fn(({ renderTrigger }) => (
		<div data-testid="confirm-button">{renderTrigger(() => {})}</div>
	)),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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

const mockUseInvites = vi.fn<() => UseInvitesResult>(() => ({
	invites: [],
	loading: false,
	error: null,
	inviteStatus: 'idle',
	inviteError: null,
	cancelStatus: 'idle',
	cancelError: null,
	inviteUser: mockInviteUser,
	cancelInvite: mockCancelInvite,
	refresh: vi.fn(),
}));

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
	const mockRefresh = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
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

		it('calls leavePlanner with planner ID when confirmed', async () => {
			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			const { onConfirm } = vi.mocked(ConfirmButton).mock.calls[0][0];
			await onConfirm();

			expect(leavePlanner).toHaveBeenCalledWith(id);
		});

		it('calls router.refresh when leave succeeds', () => {
			render(<PlannerItem id={id} name={name} accessLevel="admin" />);

			const { onSuccess } = vi.mocked(ConfirmButton).mock.calls[0][0];
			onSuccess?.();

			expect(mockRefresh).toHaveBeenCalled();
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
				refresh: vi.fn(),
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
			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const calls = vi.mocked(PendingInvitesList).mock.calls;
			const props = calls[0][0] as { onCancel: (inviteId: string) => void };
			props.onCancel('invite-123');

			expect(mockCancelInvite).toHaveBeenCalledWith('invite-123');
		});
	});
});
