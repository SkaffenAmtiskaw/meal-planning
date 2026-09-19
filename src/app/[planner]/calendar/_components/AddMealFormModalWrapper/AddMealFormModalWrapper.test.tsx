import { useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddMealFormModalWrapper } from './AddMealFormModalWrapper';

import { AddMealForm } from '../AddMealForm/AddMealForm';

vi.mock('../AddMealForm/AddMealForm', () => ({
	AddMealForm: vi.fn(({ onCancel, onSuccess }) => (
		<div data-testid="add-meal-form">
			<button data-testid="cancel-button" onClick={onCancel}>
				Cancel
			</button>
			<button
				data-testid="success-button"
				onClick={() => onSuccess?.([{ date: '2024-01-01' }])}
			>
				Success
			</button>
		</div>
	)),
}));

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);

describe('AddMealFormModalWrapper', () => {
	const mockRefresh = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		mockUseRouter.mockReturnValue({
			refresh: mockRefresh,
		} as unknown as ReturnType<typeof useRouter>);
	});

	it('renders AddMealForm with the provided props', () => {
		render(
			<AddMealFormModalWrapper
				plannerId="planner-1"
				initialDate="2024-01-15"
				onClose={() => {}}
			/>,
		);

		expect(screen.getByTestId('add-meal-form')).toBeDefined();

		const formCall = vi.mocked(AddMealForm).mock.calls[0][0];
		expect(formCall.plannerId).toBe('planner-1');
		expect(formCall.initialDate).toBe('2024-01-15');
	});

	it('passes onClose as onCancel to AddMealForm', () => {
		const onClose = vi.fn();

		render(<AddMealFormModalWrapper plannerId="planner-1" onClose={onClose} />);

		fireEvent.click(screen.getByTestId('cancel-button'));

		expect(onClose).toHaveBeenCalled();
	});

	it('closes the modal and refreshes the route when AddMealForm reports success', () => {
		const onClose = vi.fn();

		render(<AddMealFormModalWrapper plannerId="planner-1" onClose={onClose} />);

		fireEvent.click(screen.getByTestId('success-button'));

		expect(onClose).toHaveBeenCalled();
		expect(mockRefresh).toHaveBeenCalled();
	});
});
