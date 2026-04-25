import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { ConfirmModal } from './ConfirmModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components', () => ({
	FormFeedbackAlert: ({
		status,
		errorMessage,
	}: {
		status: string;
		errorMessage?: string;
	}) =>
		status === 'error' ? (
			<div data-testid="form-feedback-alert">{errorMessage}</div>
		) : null,
}));

const defaultProps = {
	opened: true,
	onClose: vi.fn(),
	onConfirm: vi.fn(),
	loading: false,
	title: 'Delete Item',
	message: 'Are you sure? This cannot be undone.',
};

describe('ConfirmModal', () => {
	test('renders modal content when opened', () => {
		render(<ConfirmModal {...defaultProps} />);
		expect(screen.getByRole('dialog')).toBeDefined();
		expect(screen.getByTestId('cancel-button')).toBeDefined();
		expect(screen.getByTestId('confirm-button')).toBeDefined();
	});

	test('renders title and message', () => {
		render(
			<ConfirmModal
				{...defaultProps}
				title="Delete Bookmark"
				message="Are you sure you want to delete this bookmark?"
			/>,
		);
		expect(screen.getByText('Delete Bookmark')).toBeDefined();
		expect(
			screen.getByText('Are you sure you want to delete this bookmark?'),
		).toBeDefined();
	});

	test('does not render when not opened', () => {
		render(<ConfirmModal {...defaultProps} opened={false} />);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('clicking cancel calls onClose', () => {
		const onClose = vi.fn();
		render(<ConfirmModal {...defaultProps} onClose={onClose} />);
		fireEvent.click(screen.getByTestId('cancel-button'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('clicking confirm calls onConfirm', () => {
		const onConfirm = vi.fn();
		render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
		fireEvent.click(screen.getByTestId('confirm-button'));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	test('cancel button is disabled when loading', () => {
		render(<ConfirmModal {...defaultProps} loading />);
		expect(
			(screen.getByTestId('cancel-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	test('confirm button is disabled when loading', () => {
		render(<ConfirmModal {...defaultProps} loading />);
		expect(
			(screen.getByTestId('confirm-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	test('shows error alert when errorMessage is provided', () => {
		render(
			<ConfirmModal {...defaultProps} errorMessage="Something went wrong" />,
		);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	test('does not show error alert when errorMessage is undefined', () => {
		render(<ConfirmModal {...defaultProps} />);
		expect(screen.queryByTestId('form-feedback-alert')).toBeNull();
	});
});
