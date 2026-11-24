import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '@mantine/core';

import { addMeal } from '@/_actions/calendar';
import { useIsMobile, useSnackbar } from '@/_hooks';

import { AddMealModal } from './AddMealModal';

import { MealForm } from '../MealForm';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock(
	'@/_actions/calendar',
	async () => await import('#mocks/@/_actions/calendar'),
);
vi.mock('../MealForm', () => ({
	MealForm: vi.fn(() => <div data-testid="meal-form" />),
	newMealDraft: vi.fn((initialDate?: string) => ({ date: initialDate ?? '' })),
}));

const formProps = () => vi.mocked(MealForm).mock.lastCall?.[0];
const rootProps = () => vi.mocked(Modal.Root).mock.lastCall?.[0];

const status = { date: '2026-11-27', mealName: 'Taco Night', linking: false };

const props = { data: {}, close: vi.fn(), plannerId: 'planner-1' };

describe('AddMealModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('is closed and renders no form while it has no data', () => {
		render(<AddMealModal {...props} data={null} />);

		expect(screen.queryByTestId('meal-form')).toBeNull();
	});

	it('starts the form on the date it was opened with', () => {
		render(<AddMealModal {...props} data={{ initialDate: '2026-11-27' }} />);

		expect(formProps()?.initialDraft).toEqual({ date: '2026-11-27' });
	});

	it("saves to the modal's planner", async () => {
		render(<AddMealModal {...props} />);

		await formProps()?.save({
			date: '2026-11-27',
			mealName: 'Taco Night',
			dishes: [],
		});

		expect(addMeal).toHaveBeenCalledWith({
			plannerId: 'planner-1',
			date: '2026-11-27',
			mealName: 'Taco Night',
			dishes: [],
		});
	});

	it.each([
		{
			how: 'a save',
			call: () =>
				formProps()?.onSuccess({
					date: '2026-11-27',
					mealName: 'Taco Night',
					dishes: [],
				}),
		},
		{ how: 'Cancel', call: () => formProps()?.onCancel() },
		{ how: 'the close button or Esc', call: () => rootProps()?.onClose() },
	])('closes after $how', ({ call }) => {
		render(<AddMealModal {...props} />);

		act(() => call());

		expect(props.close).toHaveBeenCalledTimes(1);
	});

	it('confirms a save with the date the meal was saved on, with no Undo', () => {
		const show = vi.fn();
		vi.mocked(useSnackbar).mockReturnValue({ show });
		render(<AddMealModal {...props} data={{ initialDate: '2026-11-20' }} />);

		act(() =>
			formProps()?.onSuccess({
				date: '2026-11-27',
				mealName: 'Taco Night',
				dishes: [],
			}),
		);

		expect(show).toHaveBeenCalledWith({ message: 'Added to Fri, Nov 27' });
	});

	it('shows no confirmation after Cancel', () => {
		const show = vi.fn();
		vi.mocked(useSnackbar).mockReturnValue({ show });
		render(<AddMealModal {...props} />);

		act(() => formProps()?.onCancel());

		expect(show).not.toHaveBeenCalled();
	});

	it('shows the date and meal name the form reports under the title on desktop', () => {
		render(<AddMealModal {...props} />);

		act(() => formProps()?.onStatusChange?.(status));

		expect(screen.getByTestId('modal-subtitle').textContent).toBe(
			'Friday, November 27 · Taco Night',
		);
	});

	it('starts the next open with no subtitle', () => {
		const { rerender } = render(<AddMealModal {...props} />);
		act(() => formProps()?.onStatusChange?.(status));

		act(() => rootProps()?.onClose());
		rerender(<AddMealModal {...props} data={null} />);
		rerender(<AddMealModal {...props} />);

		expect(screen.queryByTestId('modal-subtitle')).toBeNull();
	});

	it('keeps the modal open on Esc while a dish is being linked', () => {
		render(<AddMealModal {...props} />);
		expect(rootProps()?.closeOnEscape).toBe(true);

		act(() => formProps()?.onStatusChange?.({ ...status, linking: true }));

		expect(rootProps()?.closeOnEscape).toBe(false);
	});

	describe('on a phone', () => {
		beforeEach(() => {
			vi.mocked(useIsMobile).mockReturnValue(true);
		});

		it('fills the screen, with Cancel in its top bar and no subtitle', () => {
			render(<AddMealModal {...props} />);
			act(() => formProps()?.onStatusChange?.(status));

			expect(rootProps()?.fullScreen).toBe(true);
			expect(screen.queryByTestId('modal-subtitle')).toBeNull();

			fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
			expect(props.close).toHaveBeenCalledTimes(1);
		});
	});
});
