import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { DeleteConfirmModal } from './DeleteConfirmModal';

vi.mock('@mantine/core', () => ({
	Modal: ({
		children,
		opened,
	}: {
		children: React.ReactNode;
		opened: boolean;
	}) => (opened ? <div data-testid="modal">{children}</div> : null),

	Button: ({
		children,
		disabled,
		loading,
		onClick,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		loading?: boolean;
		onClick?: () => void;
		'data-testid'?: string;
	}) => (
		<button
			data-testid={testId}
			disabled={disabled ?? loading}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	),

	Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

	Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const defaultProps = {
	opened: true,
	onClose: vi.fn(),
	onConfirm: vi.fn(),
	loading: false,
};

describe('DeleteConfirmModal', () => {
	test('renders modal content when opened', () => {
		render(<DeleteConfirmModal {...defaultProps} />);
		expect(screen.getByTestId('modal')).toBeDefined();
		expect(screen.getByTestId('cancel-button')).toBeDefined();
		expect(screen.getByTestId('confirm-delete-button')).toBeDefined();
	});

	test('does not render when not opened', () => {
		render(<DeleteConfirmModal {...defaultProps} opened={false} />);
		expect(screen.queryByTestId('modal')).toBeNull();
	});

	test('clicking cancel calls onClose', () => {
		const onClose = vi.fn();
		render(<DeleteConfirmModal {...defaultProps} onClose={onClose} />);
		fireEvent.click(screen.getByTestId('cancel-button'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('clicking delete calls onConfirm', () => {
		const onConfirm = vi.fn();
		render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
		fireEvent.click(screen.getByTestId('confirm-delete-button'));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	test('cancel button is disabled when loading', () => {
		render(<DeleteConfirmModal {...defaultProps} loading />);
		expect(
			(screen.getByTestId('cancel-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	test('confirm delete button is disabled when loading', () => {
		render(<DeleteConfirmModal {...defaultProps} loading />);
		expect(
			(screen.getByTestId('confirm-delete-button') as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});
});
