import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RemoveMemberButton } from './RemoveMemberButton';

const mockRemoveMember = vi.fn();

vi.mock('@/_actions/planner/removeMember', () => ({
	removeMember: (...args: unknown[]) => mockRemoveMember(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => <svg data-testid="icon-trash" />,
}));

// Mock ConfirmButton - it calls onConfirm when trigger is clicked and confirm is clicked
const mockOnConfirmCallback = vi.fn();

vi.mock('@/_components', () => ({
	ConfirmButton: ({
		onConfirm,
		onSuccess,
		renderTrigger,
	}: {
		onConfirm: () => Promise<{ ok: boolean; error?: string }>;
		onSuccess?: () => void;
		renderTrigger: (onOpen: () => void) => React.ReactNode;
	}) => {
		const handleClick = async () => {
			mockOnConfirmCallback();
			const result = await onConfirm();
			if (result.ok && onSuccess) {
				onSuccess();
			}
		};
		return (
			<div data-testid="confirm-button">
				<button type="button" onClick={handleClick} onKeyDown={handleClick}>
					{renderTrigger(() => {})}
				</button>
			</div>
		);
	},
}));

describe('RemoveMemberButton', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const memberName = 'John Doe';
	const onRemove = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders trash icon button', () => {
		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		expect(screen.getByTestId('remove-member-button')).toBeDefined();
		expect(screen.getByTestId('icon-trash')).toBeDefined();
	});

	it('calls removeMember and onRemove callback on successful confirm', async () => {
		mockRemoveMember.mockResolvedValue({ ok: true });

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('remove-member-button'));

		await waitFor(() => {
			expect(mockOnConfirmCallback).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(mockRemoveMember).toHaveBeenCalledWith(plannerId, memberEmail);
		});

		await waitFor(() => {
			expect(onRemove).toHaveBeenCalled();
		});
	});

	it.each([
		{
			ok: false,
			error: 'Cannot remove owner',
			description: 'with error message',
		},
		{ ok: false, description: 'without error message (uses default)' },
	])('does not call onRemove when removal fails %s', async (result) => {
		mockRemoveMember.mockResolvedValue(result);

		render(
			<RemoveMemberButton
				plannerId={plannerId}
				memberEmail={memberEmail}
				memberName={memberName}
				onRemove={onRemove}
			/>,
		);

		fireEvent.click(screen.getByTestId('remove-member-button'));

		await waitFor(() => {
			expect(mockOnConfirmCallback).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(mockRemoveMember).toHaveBeenCalledWith(plannerId, memberEmail);
		});

		expect(onRemove).not.toHaveBeenCalled();
	});
});
