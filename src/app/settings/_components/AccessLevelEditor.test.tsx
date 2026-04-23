import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { AccessLevelEditor } from './AccessLevelEditor';

const mockUpdateMemberAccess = vi.fn();

vi.mock('@/_actions/planner/updateMemberAccess', () => ({
	updateMemberAccess: (...args: unknown[]) => mockUpdateMemberAccess(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconCheck: () => <svg data-testid="icon-check" />,
	IconX: () => <svg data-testid="icon-x" />,
}));

describe('AccessLevelEditor', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const currentAccessLevel: AccessLevel = 'write';
	const availableLevels: AccessLevel[] = ['admin', 'write', 'read'];
	const onSave = vi.fn();
	const onCancel = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders select with available levels', () => {
		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

		expect(screen.getByTestId('access-level-select')).toBeDefined();
		expect(screen.getByTestId('save-access-level')).toBeDefined();
		expect(screen.getByTestId('cancel-access-level')).toBeDefined();
	});

	it('calls onCancel without saving when value is unchanged', () => {
		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('save-access-level'));

		expect(mockUpdateMemberAccess).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('saves access level change and calls onSave on success', async () => {
		mockUpdateMemberAccess.mockResolvedValue({ ok: true });

		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

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
			expect(onSave).toHaveBeenCalled();
		});

		expect(onCancel).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it('calls onError when update fails', async () => {
		mockUpdateMemberAccess.mockResolvedValue({
			ok: false,
			error: 'Cannot change owner access',
		});

		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

		// Change the select value
		const select = screen.getByTestId('access-level-select');
		fireEvent.change(select, { target: { value: 'read' } });

		// Save
		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(onError).toHaveBeenCalledWith('Cannot change owner access');
		});

		expect(onSave).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
	});

	it('calls onCancel when cancel button is clicked', () => {
		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('cancel-access-level'));

		expect(onCancel).toHaveBeenCalled();
		expect(mockUpdateMemberAccess).not.toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it('renders all available levels in select', () => {
		render(
			<AccessLevelEditor
				plannerId={plannerId}
				memberEmail={memberEmail}
				currentAccessLevel={currentAccessLevel}
				availableLevels={['write', 'read']}
				onSave={onSave}
				onCancel={onCancel}
				onError={onError}
			/>,
		);

		const select = screen.getByTestId('access-level-select');
		const options = select.querySelectorAll('option');
		const optionValues = Array.from(options).map((opt) => opt.value);

		expect(optionValues).toContain('write');
		expect(optionValues).toContain('read');
		expect(optionValues).not.toContain('admin');
	});
});
