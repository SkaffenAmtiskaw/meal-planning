import { useDisclosure } from '@mantine/hooks';

import { act, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmModal } from '@/_components';
import { useAsyncStatus } from '@/_hooks';

import { ConfirmButton } from './ConfirmButton';

vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));
vi.mock('@/_components', async () => ({
	ConfirmModal: vi.fn(() => null),
}));

describe('ConfirmButton', () => {
	const mockOnConfirm = vi.fn();
	const mockOnSuccess = vi.fn();
	const mockOnError = vi.fn();
	const mockOpen = vi.fn();
	const mockClose = vi.fn();

	const defaultProps = {
		onConfirm: mockOnConfirm,
		title: 'Delete Item?',
		message: 'Are you sure you want to delete this item?',
		confirmButtonText: 'Delete',
		renderTrigger: (onOpen: () => void) => (
			<button data-testid="trigger-button" onClick={onOpen} type="button">
				Delete Item
			</button>
		),
	};

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useDisclosure).mockReturnValue([
			false,
			{ open: mockOpen, close: mockClose, toggle: vi.fn(), set: vi.fn() },
		]);
	});

	it('opens modal when trigger is clicked', () => {
		render(<ConfirmButton {...defaultProps} />);

		screen.getByTestId('trigger-button').click();

		expect(mockOpen).toHaveBeenCalledOnce();
	});

	it('calls onConfirm when confirmed', async () => {
		render(<ConfirmButton {...defaultProps} />);

		const { onConfirm } = vi.mocked(ConfirmModal).mock.calls[0][0];
		await act(async () => {
			await onConfirm();
		});

		expect(mockOnConfirm).toHaveBeenCalledOnce();
	});

	it('calls onSuccess and closes modal on success', async () => {
		render(<ConfirmButton {...defaultProps} onSuccess={mockOnSuccess} />);

		const { onConfirm } = vi.mocked(ConfirmModal).mock.calls[0][0];
		await act(async () => {
			await onConfirm();
		});

		expect(mockOnSuccess).toHaveBeenCalledOnce();
		expect(mockClose).toHaveBeenCalledOnce();
	});

	it('calls onError when run returns a failure result', async () => {
		vi.mocked(useAsyncStatus).mockReturnValueOnce({
			status: 'idle',
			error: null,
			run: vi.fn().mockResolvedValue({ ok: false, error: 'Failed' }),
			reset: vi.fn(),
		});

		render(<ConfirmButton {...defaultProps} onError={mockOnError} />);

		const { onConfirm } = vi.mocked(ConfirmModal).mock.calls[0][0];
		await act(async () => {
			await onConfirm();
		});

		expect(mockOnError).toHaveBeenCalledWith('Failed');
		expect(mockClose).not.toHaveBeenCalled();
	});

	it('does not call callbacks when run returns undefined', async () => {
		vi.mocked(useAsyncStatus).mockReturnValueOnce({
			status: 'idle',
			error: null,
			run: vi.fn().mockResolvedValue(undefined),
			reset: vi.fn(),
		});

		render(
			<ConfirmButton
				{...defaultProps}
				onSuccess={mockOnSuccess}
				onError={mockOnError}
			/>,
		);

		const { onConfirm } = vi.mocked(ConfirmModal).mock.calls[0][0];
		await act(async () => {
			await onConfirm();
		});

		expect(mockOnSuccess).not.toHaveBeenCalled();
		expect(mockOnError).not.toHaveBeenCalled();
		expect(mockClose).not.toHaveBeenCalled();
	});

	it('closes modal and resets async status when cancelled', () => {
		const mockReset = vi.fn();
		vi.mocked(useAsyncStatus).mockReturnValueOnce({
			status: 'idle',
			error: null,
			run: vi.fn(),
			reset: mockReset,
		});

		render(<ConfirmButton {...defaultProps} />);

		const { onClose } = vi.mocked(ConfirmModal).mock.calls[0][0];
		act(() => {
			onClose();
		});

		expect(mockClose).toHaveBeenCalledOnce();
		expect(mockReset).toHaveBeenCalledOnce();
	});
});
