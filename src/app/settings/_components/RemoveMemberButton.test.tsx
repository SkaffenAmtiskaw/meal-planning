import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { removeMember } from '@/_actions/sharing';
import { ConfirmButton } from '@/_components';

import { RemoveMemberButton } from './RemoveMemberButton';

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);
vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@/_components', () => ({
	ConfirmButton: vi.fn(({ renderTrigger }) => renderTrigger?.(() => {})),
}));

describe('RemoveMemberButton', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const memberName = 'John Doe';
	const onRemove = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes correct props to ConfirmButton', () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const call = vi.mocked(ConfirmButton).mock.calls[0][0];
		expect(call.title).toBe(`Remove ${memberName}?`);
		expect(call.message).toBe(
			`Are you sure you want to remove ${memberEmail} from this planner? This action cannot be undone.`,
		);
		expect(call.confirmButtonText).toBe('Remove');
		expect(call.onSuccess).toBe(onRemove);
	});

	it('calls removeMember with plannerId and memberEmail on confirm', async () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const { onConfirm } = vi.mocked(ConfirmButton).mock.calls[0][0];
		await onConfirm();

		expect(removeMember).toHaveBeenCalledWith(plannerId, memberEmail);
	});

	it('returns success result when removeMember succeeds', async () => {
		vi.mocked(removeMember).mockResolvedValueOnce({ ok: true });

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const { onConfirm } = vi.mocked(ConfirmButton).mock.calls[0][0];
		const result = await onConfirm();

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it('returns error result when removeMember fails with error message', async () => {
		vi.mocked(removeMember).mockResolvedValueOnce({
			ok: false,
			error: 'Cannot remove owner',
		});

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const { onConfirm } = vi.mocked(ConfirmButton).mock.calls[0][0];
		const result = await onConfirm();

		expect(result).toEqual({ ok: false, error: 'Cannot remove owner' });
	});

	it('returns default error when removeMember fails without error message', async () => {
		vi.mocked(removeMember).mockResolvedValueOnce({ ok: false });

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		const { onConfirm } = vi.mocked(ConfirmButton).mock.calls[0][0];
		const result = await onConfirm();

		expect(result).toEqual({ ok: false, error: 'Failed to remove member' });
	});
});
