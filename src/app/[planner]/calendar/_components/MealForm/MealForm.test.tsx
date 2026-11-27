import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useForm } from '@mantine/form';

import { makeDishValues, makeMealValues } from '#fixtures/dish';
import { useFormFeedback } from '@/_hooks';

import { MealForm } from './MealForm';

import { hasRequiredFields, useMealFormContext } from '../_hooks/useMealForm';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';

vi.mock('@mantine/form', async () => await import('#mocks/@mantine/form'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@/_components', () => ({
	FormFeedbackAlert: vi.fn(() => null),
}));
vi.mock(
	'../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);
vi.mock(
	'./_hooks/useDishLinking',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDishLinking'
		),
);
vi.mock('./_components/MealFormLayout/MealFormLayout', () => ({
	MealFormLayout: vi.fn(({ meal, dishes, saved, footer }) => (
		<>
			{meal}
			{dishes}
			{saved}
			{footer}
			<button type="submit">Add Meal</button>
		</>
	)),
}));
vi.mock('./_components/MealFields/MealFields', () => ({
	MealFields: vi.fn(() => null),
}));
vi.mock('./_components/DishList/DishList', () => ({
	DishList: vi.fn(() => null),
}));
vi.mock('./_components/MealFormFooter/MealFormFooter', () => ({
	MealFormFooter: vi.fn(() => null),
}));
vi.mock('./_components/SavedRecipesColumn/SavedRecipesColumn', () => ({
	SavedRecipesColumn: vi.fn(() => null),
}));

const values = makeMealValues({
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [makeDishValues({ name: 'Tacos' })],
});

const savedInput = {
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [{ name: 'Tacos' }],
};

const ok = { ok: true as const, data: undefined };

const renderForm = (props: Partial<Parameters<typeof MealForm>[0]> = {}) =>
	render(
		<MealForm
			save={vi.fn(async () => ok)}
			onSuccess={vi.fn()}
			onCancel={vi.fn()}
			{...props}
		/>,
	);

const submit = () =>
	act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }));
	});

describe('MealForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves the values through the save it was given, then reports the saved meal', async () => {
		vi.mocked(useMealFormContext).mockReturnValue(
			useForm({ initialValues: values }) as unknown as ReturnType<
				typeof useMealFormContext
			>,
		);
		const save = vi.fn(async () => ok);
		const onSuccess = vi.fn();
		renderForm({ save, onSuccess });

		await submit();

		expect(save).toHaveBeenCalledWith(savedInput);
		expect(onSuccess).toHaveBeenCalledWith(savedInput);
	});

	it("submits through the form, so a save waits on the form's checks", async () => {
		const form = useMealFormContext();
		const onSubmit = vi.fn(() => vi.fn());
		vi.mocked(useMealFormContext).mockReturnValue({ ...form, onSubmit });
		const save = vi.fn(async () => ok);
		renderForm({ save });

		await submit();

		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(save).not.toHaveBeenCalled();
	});

	it('closes at once after a save, with no countdown', () => {
		renderForm();

		expect(vi.mocked(useFormFeedback)).toHaveBeenCalledWith({
			successDuration: 0,
		});
	});

	it.each([
		true,
		false,
	])('lets Add Meal be pressed only once the required fields are filled (%s)', (filled) => {
		vi.mocked(hasRequiredFields).mockReturnValue(filled);
		renderForm();

		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].canSubmit).toBe(filled);
		expect(hasRequiredFields).toHaveBeenCalledWith(
			vi.mocked(useMealFormContext).mock.results[0].value.values,
		);
	});
});
