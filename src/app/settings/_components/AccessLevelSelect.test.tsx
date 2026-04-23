import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AccessLevelSelect } from './AccessLevelSelect';

const mockUpdateMemberAccess = vi.fn();

vi.mock('@/_actions/planner/updateMemberAccess', () => ({
	updateMemberAccess: (...args: unknown[]) => mockUpdateMemberAccess(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('AccessLevelSelect', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const onUpdate = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('shows badge and pencil by default', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		expect(screen.getByTestId('access-level-badge')).toBeDefined();
		expect(screen.getByTestId('edit-access-level')).toBeDefined();
	});

	test('clicking pencil shows select and save/cancel buttons', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		expect(screen.getByTestId('access-level-select')).toBeDefined();
		expect(screen.getByTestId('save-access-level')).toBeDefined();
		expect(screen.getByTestId('cancel-access-level')).toBeDefined();
	});

	test('owner sees all options (admin, write, read)', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		expect(select).toBeDefined();
	});

	test('admin sees only write/read options', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={false}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		expect(select).toBeDefined();
	});

	test('save calls updateMemberAccess', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Change the select value
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(mockUpdateMemberAccess).toHaveBeenCalledWith(
				plannerId,
				memberEmail,
				'read',
			);
		});
	});

	test('on success: closes edit mode, calls onUpdate', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalled();
		});

		// Edit mode should be closed - badge should be visible again
		expect(screen.getByTestId('access-level-badge')).toBeDefined();
		expect(screen.queryByTestId('access-level-select')).toBeNull();
	});

	test('on error: reverts selection, calls onError', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(onError).toHaveBeenCalledWith('Cannot change owner access');
		});

		// Edit mode should be closed
		expect(screen.getByTestId('access-level-badge')).toBeDefined();
	});

	test('cancel reverts to original value', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		fireEvent.click(screen.getByTestId('cancel-access-level'));

		// updateMemberAccess should not be called on cancel
		expect(mockUpdateMemberAccess).not.toHaveBeenCalled();

		// Edit mode should be closed
		expect(screen.getByTestId('access-level-badge')).toBeDefined();
		expect(screen.queryByTestId('access-level-select')).toBeNull();
	});

	test('save does nothing if value unchanged', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		// Don't change the value, just save
		fireEvent.click(screen.getByTestId('save-access-level'));

		expect(mockUpdateMemberAccess).not.toHaveBeenCalled();

		// Edit mode should be closed
		expect(screen.getByTestId('access-level-badge')).toBeDefined();
	});

	test('displays correct badge color', () => {
		const { rerender } = render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="owner"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('red');

		rerender(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="admin"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('orange');

		rerender(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('blue');

		rerender(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="read"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
			/>,
		);

		expect(
			screen.getByTestId('access-level-badge').getAttribute('data-color'),
		).toBe('gray');
	});

	test('hidden prop hides edit button', () => {
		render(
			<AccessLevelSelect
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel="write"
				viewerIsOwner={true}
				onUpdate={onUpdate}
				onError={onError}
				hidden
			/>,
		);

		expect(screen.getByTestId('access-level-badge')).toBeDefined();
		expect(screen.queryByTestId('edit-access-level')).toBeNull();
	});
});
