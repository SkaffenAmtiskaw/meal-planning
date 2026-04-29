import type React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionResult } from '@/_utils/actionResult/ActionResult';

import { ConfirmButton } from './ConfirmButton';

// Mock useDisclosure from @mantine/hooks
const { mockOpen, mockClose, mockUseDisclosure } = vi.hoisted(() => {
	const mockOpen = vi.fn();
	const mockClose = vi.fn();
	const mockUseDisclosure = vi.fn(() => [
		false,
		{ open: mockOpen, close: mockClose },
	]);
	return { mockOpen, mockClose, mockUseDisclosure };
});

vi.mock('@mantine/hooks', () => ({
	useDisclosure: mockUseDisclosure,
}));

// Mock useAsyncStatus from @/_hooks
const { mockRun, mockReset, mockUseAsyncStatus } = vi.hoisted(() => {
	const mockRun = vi.fn();
	const mockReset = vi.fn();
	const mockUseAsyncStatus = vi.fn(() => ({
		status: 'idle' as 'idle' | 'error' | 'loading',
		error: null as string | null,
		run: mockRun,
		reset: mockReset,
	}));
	return { mockRun, mockReset, mockUseAsyncStatus };
});

vi.mock('@/_hooks', () => ({
	useAsyncStatus: mockUseAsyncStatus,
}));

// Mock ConfirmModal
vi.mock('@/_components', () => ({
	ConfirmModal: ({
		errorMessage,
		onClose,
		onConfirm,
		opened,
		loading,
		title,
		message,
		confirmButtonText,
	}: {
		opened: boolean;
		onClose: () => void;
		onConfirm: () => void;
		errorMessage?: string;
		loading?: boolean;
		title?: string;
		message?: React.ReactNode;
		confirmButtonText?: string;
	}) => {
		return opened ? (
			<div data-testid="confirm-modal" role="dialog">
				<div data-testid="modal-title">{title}</div>
				<div data-testid="modal-message">{message}</div>
				{errorMessage && <div data-testid="modal-error">{errorMessage}</div>}
				<button data-testid="modal-cancel" onClick={onClose} type="button">
					Cancel
				</button>
				<button
					data-testid="modal-confirm"
					onClick={onConfirm}
					disabled={loading}
					type="button"
				>
					{confirmButtonText || 'Confirm'}
				</button>
			</div>
		) : null;
	},
}));

describe('ConfirmButton', () => {
	const mockOnConfirm = vi.fn<() => Promise<ActionResult>>();
	const mockOnSuccess = vi.fn();
	const mockOnError = vi.fn();

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
		mockUseDisclosure.mockReturnValue([
			false,
			{ open: mockOpen, close: mockClose },
		]);
		mockUseAsyncStatus.mockReturnValue({
			status: 'idle',
			error: null,
			run: mockRun,
			reset: mockReset,
		});
	});

	it('renders trigger via render prop', () => {
		render(<ConfirmButton {...defaultProps} />);

		expect(screen.getByTestId('trigger-button')).toBeDefined();
		expect(screen.getByTestId('trigger-button').textContent).toBe(
			'Delete Item',
		);
	});

	it('opens modal when trigger is clicked', () => {
		render(<ConfirmButton {...defaultProps} />);

		fireEvent.click(screen.getByTestId('trigger-button'));

		expect(mockOpen).toHaveBeenCalledOnce();
	});

	it('calls run with onConfirm when confirmed', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		mockRun.mockResolvedValue({ ok: true, data: undefined });

		render(<ConfirmButton {...defaultProps} />);

		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockRun).toHaveBeenCalledOnce();
		});

		// Verify run was called with the onConfirm function
		expect(mockRun).toHaveBeenCalledWith(mockOnConfirm);
	});

	it('calls onSuccess and closes modal on success', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		mockRun.mockResolvedValue({ ok: true, data: undefined });

		render(<ConfirmButton {...defaultProps} onSuccess={mockOnSuccess} />);

		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockRun).toHaveBeenCalledOnce();
		});

		// Verify callbacks were called
		expect(mockOnSuccess).toHaveBeenCalledOnce();
		expect(mockClose).toHaveBeenCalledOnce();
	});

	it('calls onError on failure without closing modal', async () => {
		const errorMessage = 'Failed to delete item';
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		mockRun.mockResolvedValue({ ok: false, error: errorMessage });

		render(<ConfirmButton {...defaultProps} onError={mockOnError} />);

		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockRun).toHaveBeenCalledOnce();
		});

		expect(mockOnError).toHaveBeenCalledOnce();
		expect(mockOnError).toHaveBeenCalledWith(errorMessage);
		expect(mockClose).not.toHaveBeenCalled();
	});

	it('closes modal and resets when cancel clicked', () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(<ConfirmButton {...defaultProps} />);

		fireEvent.click(screen.getByTestId('modal-cancel'));

		expect(mockClose).toHaveBeenCalledOnce();
		expect(mockReset).toHaveBeenCalledOnce();
	});

	it('displays error message in modal when error occurs', () => {
		const errorMessage = 'Something went wrong';
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		mockUseAsyncStatus.mockReturnValue({
			status: 'error',
			error: errorMessage,
			run: mockRun,
			reset: mockReset,
		});

		render(<ConfirmButton {...defaultProps} />);

		expect(screen.getByTestId('modal-error').textContent).toBe(errorMessage);
	});

	it('does not call onError when run returns undefined (exception case)', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		// When an exception occurs, run returns undefined
		mockRun.mockResolvedValue(undefined);

		render(<ConfirmButton {...defaultProps} onError={mockOnError} />);

		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockRun).toHaveBeenCalledOnce();
		});

		// onError should not be called when result is undefined
		expect(mockOnError).not.toHaveBeenCalled();
		expect(mockClose).not.toHaveBeenCalled();
	});
});
