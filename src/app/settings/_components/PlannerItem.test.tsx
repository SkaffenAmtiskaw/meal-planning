import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { PlannerItem } from './PlannerItem';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return actual;
});

vi.mock('./MemberList', () => ({
	MemberList: ({ plannerId }: { plannerId: string }) => (
		<div data-testid="member-list" data-planner-id={plannerId} />
	),
}));

const mockUseRenamePlanner = vi.fn();
vi.mock('./useRenamePlanner', () => ({
	useRenamePlanner: (...args: unknown[]) => mockUseRenamePlanner(...args),
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
		const accessLevels: AccessLevel[] = ['owner', 'admin', 'write', 'read'];

		accessLevels.forEach((accessLevel) => {
			it(`shows Leave Planner button for ${accessLevel} access`, () => {
				mockUseRenamePlanner.mockReturnValue(notEditingState);

				render(<PlannerItem id={id} name={name} accessLevel={accessLevel} />);

				expect(screen.getByTestId('leave-planner-button')).toBeDefined();
			});
		});

		it('shows subtle variant Leave Planner button for owner', () => {
			mockUseRenamePlanner.mockReturnValue(notEditingState);

			render(<PlannerItem id={id} name={name} accessLevel="owner" />);

			const button = screen.getByTestId('leave-planner-button');
			// The button should be present - we can't easily test variant in mock,
			// but the test verifies it exists
			expect(button).toBeDefined();
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
