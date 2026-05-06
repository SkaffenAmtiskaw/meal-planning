import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateMemberAccess } from '@/_actions/sharing';
import type { AccessLevel } from '@/_models/user';

import { AccessLevelEditor } from './AccessLevelEditor';

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('AccessLevelEditor', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const currentAccessLevel: AccessLevel = 'write';
	const availableLevels: AccessLevel[] = ['admin', 'write', 'read'];
	const onSave = vi.fn();
	const onCancel = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
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

		expect(updateMemberAccess).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('saves access level change and calls onSave on success', async () => {
		vi.mocked(updateMemberAccess).mockResolvedValueOnce({ ok: true });

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

		fireEvent.change(screen.getByTestId('access-level-select'), {
			target: { value: 'read' },
		});

		fireEvent.click(screen.getByTestId('save-access-level'));

		await waitFor(() => {
			expect(updateMemberAccess).toHaveBeenCalledWith(
				plannerId,
				memberEmail,
				'read',
			);
			expect(onSave).toHaveBeenCalled();
		});

		expect(onCancel).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it('calls onError when update fails', async () => {
		vi.mocked(updateMemberAccess).mockResolvedValueOnce({
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

		fireEvent.change(screen.getByTestId('access-level-select'), {
			target: { value: 'read' },
		});

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
		expect(updateMemberAccess).not.toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});
});
