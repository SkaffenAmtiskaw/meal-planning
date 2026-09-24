import { useRouter } from 'next/navigation';

import { Stack } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddMealForm } from './AddMealForm';
import { AddMealModal } from './AddMealModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));
vi.mock('./AddMealForm', () => ({
	AddMealForm: vi.fn(({ onCancel, onSuccess, onSubtitleChange }) => (
		<div data-testid="add-meal-form">
			<button data-testid="cancel-button" onClick={onCancel}>
				Cancel
			</button>
			<button data-testid="success-button" onClick={() => onSuccess?.()}>
				Success
			</button>
			<button
				data-testid="subtitle-button"
				onClick={() => onSubtitleChange?.('Mon, Jan 15 · Breakfast')}
			>
				Set Subtitle
			</button>
		</div>
	)),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockStack = vi.mocked(Stack);

describe('AddMealModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const defaultProps = {
		data: {},
		close: vi.fn(),
		plannerId: 'planner-123',
	};

	it('renders AddMealForm inside Modal.Body', () => {
		render(<AddMealModal {...defaultProps} />);

		expect(screen.getByTestId('modal-body')).toBeDefined();
		expect(screen.getByTestId('add-meal-form')).toBeDefined();
		expect(
			screen
				.getByTestId('modal-body')
				.contains(screen.getByTestId('add-meal-form')),
		).toBe(true);
	});

	it('renders header with title and no subtitle initially', () => {
		render(<AddMealModal {...defaultProps} />);

		expect(screen.getByTestId('modal-header')).toBeDefined();
		expect(screen.getByTestId('modal-title').textContent).toBe('Add Meal');
		expect(screen.queryByTestId('modal-subtitle')).toBeNull();
	});

	it('updates header subtitle when AddMealForm calls onSubtitleChange', () => {
		render(<AddMealModal {...defaultProps} />);

		fireEvent.click(screen.getByTestId('subtitle-button'));

		expect(screen.getByTestId('modal-subtitle').textContent).toBe(
			'Mon, Jan 15 · Breakfast',
		);
	});

	it('renders title and subtitle stacked in the modal header', () => {
		render(<AddMealModal {...defaultProps} />);

		fireEvent.click(screen.getByTestId('subtitle-button'));

		expect(mockStack).toHaveBeenCalledWith(
			expect.objectContaining({
				gap: 0,
				children: expect.anything(),
			}),
			undefined,
		);

		const header = screen.getByTestId('modal-header');
		const stack = header.querySelector('[data-orientation="vertical"]');
		expect(stack).not.toBeNull();
		expect(stack?.contains(screen.getByTestId('modal-title'))).toBe(true);
		expect(stack?.contains(screen.getByTestId('modal-subtitle'))).toBe(true);
	});

	it('passes initialDate and onSubtitleChange to AddMealForm when open is called with add_meal data', () => {
		render(
			<AddMealModal {...defaultProps} data={{ initialDate: '2024-01-15' }} />,
		);

		expect(vi.mocked(AddMealForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-123',
				initialDate: '2024-01-15',
				onSubtitleChange: expect.any(Function),
			}),
			undefined,
		);
	});

	it('closes the modal when cancel is clicked', () => {
		const close = vi.fn();
		render(<AddMealModal {...defaultProps} close={close} />);

		fireEvent.click(screen.getByTestId('cancel-button'));

		expect(close).toHaveBeenCalledTimes(1);
	});

	it('closes the modal and calls router.refresh when AddMealForm onSuccess is triggered', () => {
		const refresh = vi.fn();
		mockUseRouter.mockReturnValue({
			push: vi.fn(),
			replace: vi.fn(),
			refresh,
			back: vi.fn(),
			forward: vi.fn(),
			prefetch: vi.fn(),
		});

		const close = vi.fn();
		render(<AddMealModal {...defaultProps} close={close} />);

		fireEvent.click(screen.getByTestId('success-button'));

		expect(refresh).toHaveBeenCalledTimes(1);
		expect(close).toHaveBeenCalledTimes(1);
	});
});
