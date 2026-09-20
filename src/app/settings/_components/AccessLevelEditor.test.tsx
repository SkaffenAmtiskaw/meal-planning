import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateMemberAccess } from '@/_actions/sharing';
import type { AccessLevel } from '@/_models/types';

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

	describe('saving', () => {
		it('calls onCancel without calling updateMemberAccess when value is unchanged', () => {
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

		it('calls updateMemberAccess and onSave when value is changed', async () => {
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

			expect(updateMemberAccess).toHaveBeenCalledWith(
				plannerId,
				memberEmail,
				'read',
			);

			await waitFor(() => {
				expect(onSave).toHaveBeenCalled();
			});

			expect(onCancel).not.toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		});

		it('calls onError and onCancel when update fails', async () => {
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

			expect(updateMemberAccess).toHaveBeenCalledWith(
				plannerId,
				memberEmail,
				'read',
			);

			await waitFor(() => {
				expect(onError).toHaveBeenCalledWith('Cannot change owner access');
			});

			expect(onSave).not.toHaveBeenCalled();
			expect(onCancel).toHaveBeenCalled();
		});
	});

	describe('canceling', () => {
		it('calls onCancel when cancel is clicked', () => {
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
});
