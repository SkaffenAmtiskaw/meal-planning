import type React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAsyncStatus } from '@/_hooks';
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

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

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

	it('calls onConfirm when confirmed', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(<ConfirmButton {...defaultProps} />);
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockOnConfirm).toHaveBeenCalledOnce();
		});
	});

	it('calls onSuccess and closes modal on success', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);
		// Just needs to resolve successfully
		mockOnConfirm.mockResolvedValue({ ok: true, data: undefined });

		render(<ConfirmButton {...defaultProps} onSuccess={mockOnSuccess} />);
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockOnSuccess).toHaveBeenCalledOnce();
			expect(mockClose).toHaveBeenCalledOnce();
		});
	});

	it('calls onError when run returns failure result', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		// Make onConfirm reject to trigger the catch block in useAsyncStatus mock
		mockOnConfirm.mockRejectedValue(new Error('Failed'));

		render(<ConfirmButton {...defaultProps} onError={mockOnError} />);
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(mockOnError).toHaveBeenCalledOnce();
		});
		expect(mockClose).not.toHaveBeenCalled();
	});

	it('does not call onSuccess or onError when run returns undefined', async () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		// Mock useAsyncStatus to simulate run returning undefined
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
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			// Verify neither callback is called when result is undefined
			expect(mockOnSuccess).not.toHaveBeenCalled();
			expect(mockOnError).not.toHaveBeenCalled();
		});
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
	});
});
