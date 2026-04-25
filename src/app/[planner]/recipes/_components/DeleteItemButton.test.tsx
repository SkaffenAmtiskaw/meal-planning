import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteItemButton } from './DeleteItemButton';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

const mockUseCanWrite = vi.fn();

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: () => mockUseCanWrite(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => <svg data-testid="icon-trash" />,
}));

// Mock ConfirmButton - it calls onConfirm when trigger is clicked
const mockOnConfirmCallback = vi.fn();

vi.mock('@/_components', () => ({
	ConfirmButton: ({
		onConfirm,
		onSuccess,
		title,
		message,
		confirmButtonText,
		renderTrigger,
	}: {
		onConfirm: () => Promise<{ ok: boolean; data?: undefined; error?: string }>;
		onSuccess?: () => void;
		title: string;
		message: string;
		confirmButtonText: string;
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
				<div data-testid="confirm-button-title">{title}</div>
				<div data-testid="confirm-button-message">{message}</div>
				<div data-testid="confirm-button-text">{confirmButtonText}</div>
				<button type="button" onClick={handleClick} onKeyDown={handleClick}>
					{renderTrigger(() => {})}
				</button>
			</div>
		);
	},
}));

const defaultProps = {
	onDelete: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
	title: 'Delete Item',
	message: 'Are you sure?',
};

describe('DeleteItemButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
	});

	it('renders delete button with default testid', () => {
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	it('renders delete button with custom testid', () => {
		render(<DeleteItemButton {...defaultProps} data-testid="custom-delete" />);
		expect(screen.getByTestId('custom-delete')).toBeDefined();
	});

	it('confirming calls onDelete and refreshes', async () => {
		const onDelete = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, data: undefined });
		render(<DeleteItemButton {...defaultProps} onDelete={onDelete} />);
		fireEvent.click(screen.getByTestId('delete-button'));

		await waitFor(() => {
			expect(mockOnConfirmCallback).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(onDelete).toHaveBeenCalledOnce();
		});

		await waitFor(() => {
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	it('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.queryByTestId('delete-button')).toBeNull();
	});

	it('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);
		render(<DeleteItemButton {...defaultProps} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});
});
