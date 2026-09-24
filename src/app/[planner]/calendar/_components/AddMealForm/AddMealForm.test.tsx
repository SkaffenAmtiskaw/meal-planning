import { ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';

import { makeDish } from '@fixtures/dish';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addMeal } from '@/_actions/calendar';
import { FormFeedbackAlert, SubmitButton } from '@/_components';
import { useFormFeedback, useIsMobile } from '@/_hooks';

import { AddMealForm } from './AddMealForm';
import { DishList } from './DishList';
import { useDishes } from './useDishes';

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

vi.mock('./DishList', async () => ({
	DishList: vi.fn(() => <div data-testid="dish-list" />),
}));

vi.mock('./useDishes', async () => ({
	useDishes: vi.fn(),
}));

const defaultProps = {
	plannerId: 'planner-1',
	onCancel: vi.fn(),
};

describe('AddMealForm', () => {
	const mockAddDish = vi.fn();
	const mockRemoveDish = vi.fn();
	const mockUpdateDish = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useDishes).mockReturnValue({
			dishes: [makeDish()],
			addDish: mockAddDish,
			removeDish: mockRemoveDish,
			updateDish: mockUpdateDish,
		});
		vi.mocked(useIsMobile).mockReturnValue(false);
	});

	it('passes addDish to DishList', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(DishList)).toHaveBeenCalledWith(
			expect.objectContaining({ onAddDish: mockAddDish }),
			undefined,
		);
	});

	it('passes status and errorMessage to FormFeedbackAlert', () => {
		vi.mocked(useFormFeedback).mockReturnValueOnce({
			status: 'error',
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

	it('passes status and label to SubmitButton', () => {
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

	it('calls addMeal with form values and dishes on submit', async () => {
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
				dishes: [
					{
						name: '',
						sourceType: 'none',
						savedId: undefined,
						sourceText: undefined,
						note: undefined,
					},
				],
			}),
		);
	});

	it('calls onSuccess with calendar on successful submission', async () => {
		const onSuccess = vi.fn();
		const calendar = [{ date: '2024-06-15', meals: [] }];
		vi.mocked(addMeal).mockResolvedValueOnce({
			ok: true,
			data: { calendar },
		});

		render(<AddMealForm {...defaultProps} onSuccess={onSuccess} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(onSuccess).toHaveBeenCalledWith(calendar);
	});

	it('calls onCancel when the Cancel button is clicked', () => {
		const onCancel = vi.fn();
		render(<AddMealForm {...defaultProps} onCancel={onCancel} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('does not call onSuccess when submission fails', async () => {
		const onSuccess = vi.fn();
		vi.mocked(addMeal).mockResolvedValueOnce({
			ok: false,
			error: 'Something went wrong',
		});

		render(<AddMealForm {...defaultProps} onSuccess={onSuccess} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(onSuccess).not.toHaveBeenCalled();
	});

	it('prefills the date field when initialDate is provided', () => {
		vi.mocked(useForm).mockImplementationOnce(
			(options) =>
				({
					onSubmit:
						(handler: (values: Record<string, unknown>) => void) =>
						(event: { preventDefault: () => void }) => {
							event.preventDefault();
							handler(options?.initialValues ?? {});
						},
					getInputProps: vi.fn((field: string) => ({
						value: options?.initialValues?.[field],
						onChange: () => {},
					})),
					key: vi.fn((field: string) => field),
				}) as unknown as ReturnType<typeof useForm>,
		);

		render(<AddMealForm {...defaultProps} initialDate="2024-06-15" />);
		expect((screen.getByTestId('meal-date') as HTMLInputElement).value).toBe(
			'2024-06-15',
		);
	});

	it('passes dishes to DishList', () => {
		const dishes = [makeDish({ id: 'dish-1' }), makeDish({ id: 'dish-2' })];
		vi.mocked(useDishes).mockReturnValueOnce({
			dishes,
			addDish: mockAddDish,
			removeDish: mockRemoveDish,
			updateDish: mockUpdateDish,
		});
		render(<AddMealForm {...defaultProps} />);
		expect(vi.mocked(DishList)).toHaveBeenCalledWith(
			expect.objectContaining({ dishes }),
			undefined,
		);
	});

	it('DishList onUpdate callback calls updateDish', () => {
		render(<AddMealForm {...defaultProps} />);
		const { onUpdateDish } = vi.mocked(DishList).mock.calls[0][0];
		onUpdateDish('dish-1', { name: 'updated' });
		expect(mockUpdateDish).toHaveBeenCalledWith('dish-1', { name: 'updated' });
	});

	it('DishList onRemove callback calls removeDish', () => {
		render(<AddMealForm {...defaultProps} />);
		const { onRemoveDish } = vi.mocked(DishList).mock.calls[0][0];
		onRemoveDish('dish-1');
		expect(mockRemoveDish).toHaveBeenCalledWith('dish-1');
	});

	it('calls onSubtitleChange when date or meal name changes', () => {
		const onSubtitleChange = vi.fn();
		render(
			<AddMealForm {...defaultProps} onSubtitleChange={onSubtitleChange} />,
		);

		fireEvent.change(screen.getByTestId('meal-name'), {
			target: { value: 'Thai night' },
		});
		expect(onSubtitleChange).toHaveBeenLastCalledWith('Thai night');

		fireEvent.change(screen.getByTestId('meal-date'), {
			target: { value: '2024-09-10' },
		});
		expect(onSubtitleChange).toHaveBeenLastCalledWith(
			'Tuesday, September 10 · Thai night',
		);
	});

	it('calls onSubtitleChange with formatted initialDate on mount', () => {
		const onSubtitleChange = vi.fn();
		render(
			<AddMealForm
				{...defaultProps}
				initialDate="2024-09-10"
				onSubtitleChange={onSubtitleChange}
			/>,
		);
		expect(onSubtitleChange).toHaveBeenCalledWith('Tuesday, September 10');
	});

	it('renders MealFields and DishList', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('meal-date')).toBeDefined();
		expect(screen.getByTestId('dish-list')).toBeDefined();
	});

	it('uses desktop layout when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false);
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('desktop-layout')).toBeDefined();
		expect(screen.queryByTestId('mobile-layout')).toBeNull();
	});

	it('uses mobile layout when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true);
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('mobile-layout')).toBeDefined();
		expect(screen.queryByTestId('desktop-layout')).toBeNull();
	});

	it('wraps mobile content in a ScrollArea so the stacked fields can scroll', () => {
		vi.mocked(useIsMobile).mockReturnValue(true);
		render(<AddMealForm {...defaultProps} />);

		expect(vi.mocked(ScrollArea)).toHaveBeenCalledWith(
			expect.objectContaining({
				'data-testid': 'mobile-layout',
			}),
			undefined,
		);

		const mobileLayout = screen.getByTestId('mobile-layout');
		expect(
			mobileLayout.querySelector('[data-testid="meal-date"]'),
		).not.toBeNull();
		expect(
			mobileLayout.querySelector('[data-testid="dish-list"]'),
		).not.toBeNull();
	});

	it('shows the dish count in the footer', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByText('1 dish on this meal')).toBeDefined();
	});

	it('updates the footer dish count when more dishes are added', () => {
		vi.mocked(useDishes).mockReturnValueOnce({
			dishes: [makeDish({ id: 'dish-1' }), makeDish({ id: 'dish-2' })],
			addDish: mockAddDish,
			removeDish: mockRemoveDish,
			updateDish: mockUpdateDish,
		});
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByText('2 dishes on this meal')).toBeDefined();
	});

	it('does not throw when onSuccess is not provided', async () => {
		vi.mocked(addMeal).mockResolvedValueOnce({
			ok: true,
			data: { calendar: [] },
		});

		render(<AddMealForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(addMeal).toHaveBeenCalledOnce();
	});
});
