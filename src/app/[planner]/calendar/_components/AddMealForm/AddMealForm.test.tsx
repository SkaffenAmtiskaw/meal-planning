import { act, fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { addMeal } from '@/_actions/calendar';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback } from '@/_hooks';

import { AddMealForm } from './AddMealForm';
import { DishRow } from './DishRow';
import { useDishes } from './useDishes';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock(
	'@/_actions/calendar',
	async () => await import('@mocks/@/_actions/calendar'),
);

vi.mock('@/_components', async () => ({
	FormFeedbackAlert: vi.fn(() => null),
	SubmitButton: vi.fn(() => null),
}));

vi.mock('./DishRow', async () => ({
	DishRow: vi.fn(() => null),
}));

vi.mock('./useDishes', async () => ({
	useDishes: vi.fn(),
}));

const defaultProps = {
	plannerId: 'planner-1',
	onClose: vi.fn(),
};

const makeDish = (overrides: Partial<{ id: string; name: string }> = {}) => ({
	id: overrides.id ?? 'dish-1',
	name: overrides.name ?? '',
	sourceType: 'none' as const,
	savedId: '',
	sourceText: '',
	note: '',
	noteExpanded: false,
});

describe('AddMealForm', () => {
	const mockAddDish = vi.fn();
	const mockRemoveDish = vi.fn();
	const mockUpdateDish = vi.fn();

	beforeAll(() => {
		vi.mocked(useDishes).mockReturnValue({
			dishes: [makeDish()],
			addDish: mockAddDish,
			removeDish: mockRemoveDish,
			updateDish: mockUpdateDish,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('calls addDish when "Add dish" is clicked', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByText('Add dish'));
		expect(mockAddDish).toHaveBeenCalledOnce();
	});

	test('cancel button calls onClose', () => {
		const onClose = vi.fn();
		render(<AddMealForm {...defaultProps} onClose={onClose} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('passes status and errorMessage to FormFeedbackAlert', () => {
		vi.mocked(useFormFeedback).mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(FormFeedbackAlert)).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'error',
				errorMessage: 'Something went wrong',
			}),
			undefined,
		);
	});

	test('passes status and label to SubmitButton', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(SubmitButton)).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'idle',
				countdown: 0,
				label: 'Add Meal',
			}),
			undefined,
		);
	});

	test('calls addMeal with form values and dishes on submit', async () => {
		vi.mocked(addMeal).mockResolvedValueOnce({
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
				dishes: expect.any(Array),
			}),
		);
	});

	test('calls onMealAdded with calendar and calls onClose on successful submission', async () => {
		const onClose = vi.fn();
		const onMealAdded = vi.fn();
		const calendar = [{ date: '2024-06-15', meals: [] }];
		vi.mocked(addMeal).mockResolvedValueOnce({
			ok: true,
			data: { calendar },
		});

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

	test('passes showRemove false to DishRow when there is only one dish', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(DishRow)).toHaveBeenCalledWith(
			expect.objectContaining({ showRemove: false }),
			undefined,
		);
	});

	test('passes showRemove true to DishRow when there are multiple dishes', () => {
		vi.mocked(useDishes).mockReturnValueOnce({
			dishes: [makeDish({ id: 'dish-1' }), makeDish({ id: 'dish-2' })],
			addDish: mockAddDish,
			removeDish: mockRemoveDish,
			updateDish: mockUpdateDish,
		});
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(DishRow)).toHaveBeenCalledWith(
			expect.objectContaining({ showRemove: true }),
			undefined,
		);
	});

	test('DishRow onUpdate callback calls updateDish', () => {
		render(<AddMealForm {...defaultProps} />);
		const { onUpdate } = vi.mocked(DishRow).mock.calls[0][0];
		onUpdate({ name: 'test' });
		expect(mockUpdateDish).toHaveBeenCalledWith('dish-1', { name: 'test' });
	});

	test('DishRow onRemove callback calls removeDish', () => {
		render(<AddMealForm {...defaultProps} />);
		const { onRemove } = vi.mocked(DishRow).mock.calls[0][0];
		onRemove();
		expect(mockRemoveDish).toHaveBeenCalledWith('dish-1');
	});

	test('does not throw when onMealAdded is not provided', async () => {
		const onClose = vi.fn();
		vi.mocked(addMeal).mockResolvedValueOnce({
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
