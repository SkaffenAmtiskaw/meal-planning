import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { MemberActions } from './MemberActions';

const mockUpdateMemberAccess = vi.fn();

vi.mock('@/_actions/planner/updateMemberAccess', () => ({
	updateMemberAccess: (...args: unknown[]) => mockUpdateMemberAccess(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconPencil: () => <svg data-testid="icon-pencil" />,
	IconTrash: () => <svg data-testid="icon-trash" />,
	IconCheck: () => <svg data-testid="icon-check" />,
	IconX: () => <svg data-testid="icon-x" />,
}));

const { mockOpen } = vi.hoisted(() => {
	const mockOpen = vi.fn();
	return { mockOpen };
});

vi.mock('./RemoveMemberButton', () => ({
	RemoveMemberButton: ({
		plannerId: _plannerId,
		memberEmail: _memberEmail,
		memberName,
		onRemove: _onRemove,
		onError: _onError,
	}: {
		plannerId: string;
		memberEmail: string;
		memberName: string;
		onRemove: () => void;
		onError: (error: string) => void;
	}) => (
		<button type="button" data-testid="remove-member-button" onClick={mockOpen}>
			Remove {memberName}
		</button>
	),
}));

describe('MemberActions', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const memberName = 'John Doe';
	const currentAccessLevel: AccessLevel = 'write';
	const ownerAvailableLevels: AccessLevel[] = ['admin', 'write', 'read'];
	const adminAvailableLevels: AccessLevel[] = ['write', 'read'];
	const onUpdate = vi.fn();
	const onRemove = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders pencil and trash buttons in fixed-width container', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		expect(screen.getByTestId('edit-access-level')).toBeDefined();
		expect(screen.getByTestId('remove-member-button')).toBeDefined();
	});

	it('clicking pencil button shows AccessLevelEditor editing interface', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		// Initially, select should not be visible
		expect(screen.queryByTestId('access-level-select')).toBeNull();

		// Click pencil to enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Select should now be visible
		expect(screen.getByTestId('access-level-select')).toBeDefined();
		expect(screen.getByTestId('save-access-level')).toBeDefined();
		expect(screen.getByTestId('cancel-access-level')).toBeDefined();
	});

	it('clicking cancel reverts to buttons view', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		// Enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));
		expect(screen.getByTestId('access-level-select')).toBeDefined();

		// Click cancel
		fireEvent.click(screen.getByTestId('cancel-access-level'));

		// Should return to button view
		expect(screen.queryByTestId('access-level-select')).toBeNull();
		expect(screen.getByTestId('edit-access-level')).toBeDefined();
	});

	it('clicking trash button opens remove member modal', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('remove-member-button'));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('saves access level change and calls onUpdate', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		// Enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Change the select value
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		// Save
		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(mockUpdateMemberAccess).toHaveBeenCalledWith(
				plannerId,
				memberEmail,
				'read',
			);
		});

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalled();
		});

		// Should return to button view
		expect(screen.queryByTestId('access-level-select')).toBeNull();
	});

	it('calls onError when update fails', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		// Enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Change the select value
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		// Save
		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(onError).toHaveBeenCalledWith('Cannot change owner access');
		});

		// Should return to button view even on error
		expect(screen.queryByTestId('access-level-select')).toBeNull();
	});

	it('owner sees all access level options (admin, write, read)', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		expect(select).toBeDefined();

		// Check that all options are available
		const options = select.querySelectorAll('option');
		const optionValues = Array.from(options).map((opt) => opt.value);
		expect(optionValues).toContain('admin');
		expect(optionValues).toContain('write');
		expect(optionValues).toContain('read');
	});

	it('admin sees only write and read options', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={adminAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		expect(select).toBeDefined();

		// Check options available to admin
		const options = select.querySelectorAll('option');
		const optionValues = Array.from(options).map((opt) => opt.value);
		expect(optionValues).not.toContain('admin');
		expect(optionValues).toContain('write');
		expect(optionValues).toContain('read');
	});

	it('does not save when value is unchanged', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		// Enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Don't change value, just save
		fireEvent.click(screen.getByTestId('save-access-level'));

		expect(mockUpdateMemberAccess).not.toHaveBeenCalled();
		expect(screen.queryByTestId('access-level-select')).toBeNull();
	});

	it('container has fixed width of 64px', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		const container = screen.getByTestId('member-actions-container');
		expect(container).toBeDefined();
	});

	it('renders empty container when hidden is true', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden={true}
			/>,
		);

		// Container should still exist
		const container = screen.getByTestId('member-actions-container');
		expect(container).toBeDefined();

		// But buttons should not be rendered
		expect(screen.queryByTestId('edit-access-level')).toBeNull();
		expect(screen.queryByTestId('remove-member-button')).toBeNull();
	});

	it('renders buttons when hidden is false', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden={false}
			/>,
		);

		const container = screen.getByTestId('member-actions-container');
		expect(container).toBeDefined();

		// Buttons should be rendered
		expect(screen.getByTestId('edit-access-level')).toBeDefined();
		expect(screen.getByTestId('remove-member-button')).toBeDefined();
	});

	it('shows editing interface even when hidden was initially true', () => {
		const { rerender } = render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden={false}
			/>,
		);

		// Enter edit mode
		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Editing interface should be visible
		expect(screen.getByTestId('access-level-select')).toBeDefined();

		// Re-render with hidden=true - should still show editing interface
		rerender(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={ownerAvailableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden={true}
			/>,
		);

		// Editing interface should still be visible (hidden is ignored in edit mode)
		expect(screen.getByTestId('access-level-select')).toBeDefined();
		expect(screen.getByTestId('save-access-level')).toBeDefined();
		expect(screen.getByTestId('cancel-access-level')).toBeDefined();
	});
});
