import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeMealValues } from '#fixtures/dish';
import { addMeal } from '@/_actions/calendar';
import { useIsMobile, useSnackbar } from '@/_hooks';

import { AddMealModalContent } from './AddMealModalContent';

import {
	MealFormProvider,
	newMealValues,
	useMealForm,
} from '../../../_hooks/useMealForm';
import { MealDateSubtitle } from '../../../MealDateSubtitle/MealDateSubtitle';
import { MealForm } from '../../../MealForm';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock(
	'@/_actions/calendar',
	async () => await import('#mocks/@/_actions/calendar'),
);
vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);
vi.mock('../../../MealForm', () => ({
	MealForm: vi.fn(() => <div data-testid="meal-form" />),
}));
vi.mock('../../../MealDateSubtitle/MealDateSubtitle', () => ({
	MealDateSubtitle: vi.fn(() => null),
}));

const formProps = () => vi.mocked(MealForm).mock.lastCall?.[0];

const saved = { date: '2026-11-27', mealName: 'Taco Night', dishes: [] };

const props = {
	initialDate: '2026-11-26',
	plannerId: 'planner-1',
	close: vi.fn(),
};

describe('AddMealModalContent', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('starts a form on the date Add Meal was opened with, and gives it to the meal form', () => {
		const start = makeMealValues({ date: '2026-11-26' });
		vi.mocked(newMealValues).mockReturnValueOnce(start);
		render(<AddMealModalContent {...props} />);

		expect(newMealValues).toHaveBeenCalledWith('2026-11-26');
		expect(useMealForm).toHaveBeenCalledWith(start);
		expect(vi.mocked(MealFormProvider).mock.lastCall?.[0].form).toBe(
			vi.mocked(useMealForm).mock.results[0].value,
		);
	});

	it("shows the form's date under the title on desktop", () => {
		const form = useMealForm(makeMealValues());
		vi.mocked(useMealForm).mockReturnValueOnce({
			...form,
			values: makeMealValues({ date: '2026-11-27' }),
		});
		render(<AddMealModalContent {...props} />);

		expect(MealDateSubtitle).toHaveBeenLastCalledWith(
			{ date: '2026-11-27' },
			undefined,
		);
	});

	it("saves to the modal's planner", async () => {
		render(<AddMealModalContent {...props} />);

		await formProps()?.save(saved);

		expect(addMeal).toHaveBeenCalledWith({ plannerId: 'planner-1', ...saved });
	});

	it('closes after a save, and confirms it with the date the meal was saved on', () => {
		const show = vi.fn();
		vi.mocked(useSnackbar).mockReturnValue({ show });
		render(<AddMealModalContent {...props} />);

		act(() => formProps()?.onSuccess(saved));

		expect(props.close).toHaveBeenCalledTimes(1);
		expect(show).toHaveBeenCalledWith({ message: 'Added to Fri, Nov 27' });
	});

	it('closes on Cancel with no confirmation', () => {
		const show = vi.fn();
		vi.mocked(useSnackbar).mockReturnValue({ show });
		render(<AddMealModalContent {...props} />);

		act(() => formProps()?.onCancel());

		expect(props.close).toHaveBeenCalledTimes(1);
		expect(show).not.toHaveBeenCalled();
	});

	it('puts Cancel in the top bar on a phone, with no date line', () => {
		vi.mocked(useIsMobile).mockReturnValueOnce(true);
		render(<AddMealModalContent {...props} />);

		expect(MealDateSubtitle).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(props.close).toHaveBeenCalledTimes(1);
	});
});
