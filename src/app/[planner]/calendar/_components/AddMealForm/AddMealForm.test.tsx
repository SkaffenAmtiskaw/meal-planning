import { mockUseFormFeedback } from '@mocks/@/_hooks';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { addMeal } from '@/_actions/planner/addMeal';

import { AddMealForm } from './AddMealForm';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

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
	SubmitButton: ({
		label,
		status,
		countdown,
	}: {
		label: string;
		status: string;
		countdown: number;
	}) => (
		<button
			type={status === 'success' ? 'button' : 'submit'}
			data-testid="submit-button"
			disabled={status === 'submitting'}
		>
			{status === 'success' ? `Saved! Closing in ${countdown}…` : label}
		</button>
	),
}));

vi.mock('./DishRow', () => ({
	DishRow: ({
		index,
		onUpdate,
		onRemove,
	}: {
		index: number;
		showRemove: boolean;
		onUpdate: (p: unknown) => void;
		onRemove: () => void;
	}) => (
		<div data-testid={`dish-row-${index}`}>
			<button
				type="button"
				data-testid={`dish-trigger-update-${index}`}
				onClick={() => onUpdate({ name: 'test' })}
			/>
			<button
				type="button"
				data-testid={`dish-trigger-remove-${index}`}
				onClick={onRemove}
			/>
		</div>
	),
}));

vi.mock('@/_actions/planner/addMeal', () => ({
	addMeal: vi.fn(),
}));

const defaultProps = {
	plannerId: 'planner-1',
	onClose: vi.fn(),
};

describe('AddMealForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders date, meal name and description fields', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('meal-date')).toBeDefined();
		expect(screen.getByTestId('meal-name')).toBeDefined();
		expect(screen.getByTestId('meal-description')).toBeDefined();
	});

	test('renders one dish row by default', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
		expect(screen.queryByTestId('dish-row-1')).toBeNull();
	});

	test('adds a dish row when "Add dish" is clicked', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		expect(screen.getByTestId('dish-row-1')).toBeDefined();
	});

	test('cancel button calls onClose', () => {
		const onClose = vi.fn();
		render(<AddMealForm {...defaultProps} onClose={onClose} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('shows error alert when status is error', () => {
		mockUseFormFeedback.mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	test('submitting calls addMeal with form values and dishes', async () => {
		vi.mocked(addMeal).mockResolvedValue({
			ok: true,
			data: { calendar: [] },
		});

		render(<AddMealForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(addMeal).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				date: '',
				mealName: '',
			}),
		);
	});

	test('calls onMealAdded with calendar and calls onClose on successful submission', async () => {
		const onClose = vi.fn();
		const onMealAdded = vi.fn();
		const calendar = [{ date: '2024-06-15', meals: [] }];
		vi.mocked(addMeal).mockResolvedValue({ ok: true, data: { calendar } });

		render(
			<AddMealForm
				{...defaultProps}
				onClose={onClose}
				onMealAdded={onMealAdded}
			/>,
		);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(onMealAdded).toHaveBeenCalledWith(calendar);
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('DishRow onUpdate is wired to updateDish', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('dish-trigger-update-0'));
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
	});

	test('DishRow onRemove is wired to removeDish', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		fireEvent.click(screen.getByTestId('dish-trigger-remove-0'));
		expect(screen.queryByTestId('dish-row-1')).toBeNull();
	});

	test('does not throw when onMealAdded is not provided', async () => {
		const onClose = vi.fn();
		vi.mocked(addMeal).mockResolvedValue({
			ok: true,
			data: { calendar: [] },
		});

		render(<AddMealForm {...defaultProps} onClose={onClose} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(onClose).toHaveBeenCalledOnce();
	});
});
