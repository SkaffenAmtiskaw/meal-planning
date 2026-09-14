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

import type { SerializedDay } from '../../_utils/toScheduleXEvents';

describe('AddMealFormModalWrapper', () => {
	beforeEach(() => {
		vi.resetAllMocks();
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

	it('passes onMealAdded to AddMealForm', () => {
		const onMealAdded = vi.fn((_: SerializedDay[]) => {});

		render(
			<AddMealFormModalWrapper
				plannerId="planner-1"
				onMealAdded={onMealAdded}
				onClose={() => {}}
			/>,
		);

		const formCall = vi.mocked(AddMealForm).mock.calls[0][0];
		expect(formCall.onMealAdded).toBe(onMealAdded);
	});

	it('closes the modal via onSuccess when AddMealForm reports success', () => {
		const onClose = vi.fn();

		render(<AddMealFormModalWrapper plannerId="planner-1" onClose={onClose} />);

		fireEvent.click(screen.getByTestId('success-button'));

		expect(onClose).toHaveBeenCalled();
	});
});
