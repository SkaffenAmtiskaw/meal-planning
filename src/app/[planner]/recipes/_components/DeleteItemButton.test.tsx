import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DeleteItemButton } from './DeleteItemButton';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

const { mockUseFormFeedback } = vi.hoisted(() => {
	const mockUseFormFeedback = vi.fn(() => ({
		status: 'idle' as FeedbackStatus,
		errorMessage: undefined as string | undefined,
		wrap: (fn: () => Promise<void>, onSuccess: () => void) => async () => {
			await fn();
			onSuccess();
		},
		reset: vi.fn(),
	}));
	return { mockUseFormFeedback };
});

const mockUseCanWrite = vi.fn();

vi.mock('@/_hooks', () => ({
	useFormFeedback: () => mockUseFormFeedback(),
}));

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: () => mockUseCanWrite(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DeleteConfirmModal', () => ({
	DeleteConfirmModal: ({
		errorMessage,
		loading,
		onClose,
		onConfirm,
		opened,
	}: {
		opened: boolean;
		onClose: () => void;
		onConfirm: () => void;
		loading: boolean;
		errorMessage?: string;
		title: string;
		message: string;
	}) =>
		opened ? (
			<div data-testid="delete-confirm-modal">
				<span data-testid="modal-loading">{String(loading)}</span>
				{errorMessage && <span data-testid="modal-error">{errorMessage}</span>}
				<button data-testid="modal-cancel" onClick={onClose} type="button">
					Cancel
				</button>
				<button data-testid="modal-confirm" onClick={onConfirm} type="button">
					Delete
				</button>
			</div>
		) : null,
}));

const defaultProps = {
	onDelete: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
	title: 'Delete Item',
	message: 'Are you sure?',
};

const defaultFormFeedback = () => ({
	status: 'idle' as FeedbackStatus,
	errorMessage: undefined as string | undefined,
	wrap: (fn: () => Promise<void>, onSuccess: () => void) => async () => {
		await fn();
		onSuccess();
	},
	reset: vi.fn(),
});

beforeEach(() => {
	mockUseFormFeedback.mockImplementation(defaultFormFeedback);
	mockUseCanWrite.mockReturnValue(true);
	vi.clearAllMocks();
});

describe('DeleteItemButton', () => {
	test('renders delete button with default testid', () => {
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	test('renders delete button with custom testid', () => {
		render(<DeleteItemButton {...defaultProps} data-testid="custom-delete" />);
		expect(screen.getByTestId('custom-delete')).toBeDefined();
	});

	test('modal is not shown initially', () => {
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
	});

	test('clicking delete button opens modal', () => {
		render(<DeleteItemButton {...defaultProps} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('delete-confirm-modal')).toBeDefined();
	});

	test('clicking cancel closes modal without calling onDelete', () => {
		const onDelete = vi.fn();
		render(<DeleteItemButton {...defaultProps} onDelete={onDelete} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-cancel'));
		expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
		expect(onDelete).not.toHaveBeenCalled();
	});

	test('confirming calls onDelete and refreshes', async () => {
		const onDelete = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<DeleteItemButton {...defaultProps} onDelete={onDelete} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(onDelete).toHaveBeenCalledOnce();
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	test('modal closes after confirmed delete', async () => {
		const onDelete = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<DeleteItemButton {...defaultProps} onDelete={onDelete} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		fireEvent.click(screen.getByTestId('modal-confirm'));

		await waitFor(() => {
			expect(screen.queryByTestId('delete-confirm-modal')).toBeNull();
		});
	});

	test('passes loading=true to modal when submitting', () => {
		mockUseFormFeedback.mockImplementation(() => ({
			status: 'submitting' as FeedbackStatus,
			errorMessage: undefined,
			wrap: vi.fn(),
			reset: vi.fn(),
		}));
		render(<DeleteItemButton {...defaultProps} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('modal-loading').textContent).toBe('true');
	});

	test('passes errorMessage to modal when status is error', () => {
		mockUseFormFeedback.mockImplementation(() => ({
			status: 'error' as FeedbackStatus,
			errorMessage: 'Delete failed',
			wrap: vi.fn(),
			reset: vi.fn(),
		}));
		render(<DeleteItemButton {...defaultProps} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(screen.getByTestId('modal-error').textContent).toBe('Delete failed');
	});

	test('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.queryByTestId('delete-button')).toBeNull();
	});

	test('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});
});
