import { act, fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccessLevel } from '@/_models/user';

import { AccessLevelEditor } from './AccessLevelEditor';
import { MemberActions } from './MemberActions';
import { RemoveMemberButton } from './RemoveMemberButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./AccessLevelEditor', () => ({
	AccessLevelEditor: vi.fn(() => null),
}));

vi.mock('./RemoveMemberButton', () => ({
	RemoveMemberButton: vi.fn(() => null),
}));

describe('MemberActions', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const memberName = 'John Doe';
	const currentAccessLevel: AccessLevel = 'write';
	const availableLevels: AccessLevel[] = ['admin', 'write', 'read'];
	const onUpdate = vi.fn();
	const onRemove = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows edit and remove buttons by default', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		expect(screen.getByTestId('edit-access-level')).toBeDefined();
		expect(vi.mocked(RemoveMemberButton)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				memberEmail,
				memberName,
				onRemove,
			}),
			undefined,
		);
	});

	it('hides buttons when hidden is true', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden
			/>,
		);

		expect(screen.queryByTestId('edit-access-level')).toBeNull();
		expect(vi.mocked(RemoveMemberButton)).not.toHaveBeenCalled();
	});

	it('shows AccessLevelEditor when edit button is clicked', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		expect(vi.mocked(AccessLevelEditor)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				memberEmail,
				currentAccessLevel,
				availableLevels,
				onSave: expect.any(Function),
				onCancel: expect.any(Function),
				onError,
			}),
			undefined,
		);
	});

	it('calls onUpdate and exits edit mode when AccessLevelEditor onSave is triggered', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		const { onSave } = vi.mocked(AccessLevelEditor).mock.calls[0][0];
		act(() => {
			onSave();
		});

		expect(onUpdate).toHaveBeenCalled();
		expect(vi.mocked(AccessLevelEditor)).toHaveBeenCalledTimes(1);
	});

	it('exits edit mode when AccessLevelEditor onCancel is triggered', () => {
		render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));
		expect(vi.mocked(AccessLevelEditor)).toHaveBeenCalledTimes(1);

		const { onCancel } = vi.mocked(AccessLevelEditor).mock.calls[0][0];
		act(() => {
			onCancel();
		});

		expect(vi.mocked(AccessLevelEditor)).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('edit-access-level')).toBeDefined();
	});

	it('keeps editing interface visible when hidden becomes true', () => {
		const { rerender } = render(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden={false}
			/>,
		);

		fireEvent.click(screen.getByTestId('edit-access-level'));

		rerender(
			<MemberActions
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				currentAccessLevel={currentAccessLevel}
				availableLevels={availableLevels}
				onUpdate={onUpdate}
				onRemove={onRemove}
				onError={onError}
				hidden
			/>,
		);

		expect(vi.mocked(AccessLevelEditor)).toHaveBeenCalledTimes(2);
		expect(screen.queryByTestId('edit-access-level')).toBeNull();
	});
});
