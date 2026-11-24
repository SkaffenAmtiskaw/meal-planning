import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishDraft, makeMealDraft } from '#fixtures/dish';
import { useFormFeedback } from '@/_hooks';

import { MealForm } from './MealForm';

import { MealFields } from './_components/MealFields/MealFields';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@/_components', () => ({
	FormFeedbackAlert: vi.fn(() => null),
}));
vi.mock('./_components/MealFormLayout/MealFormLayout', () => ({
	MealFormLayout: vi.fn(({ meal, footer }) => (
		<>
			{meal}
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

const draft = makeMealDraft({
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [makeDishDraft({ name: 'Tacos' })],
});

const savedInput = {
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [{ name: 'Tacos' }],
};

const ok = { ok: true as const, data: undefined };

const setField = (field: string, value: string) =>
	act(() =>
		vi
			.mocked(MealFields)
			.mock.lastCall?.[0].onFieldChange(field as 'mealName', value),
	);

describe('MealForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves the draft through the save it was given, then reports the saved meal', async () => {
		const save = vi.fn(async () => ok);
		const onSuccess = vi.fn();
		render(
			<MealForm
				initialDraft={draft}
				save={save}
				onSuccess={onSuccess}
				onCancel={vi.fn()}
			/>,
		);

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }));
		});

		expect(save).toHaveBeenCalledWith(savedInput);
		expect(onSuccess).toHaveBeenCalledWith(savedInput);
	});

	it('closes at once after a save, with no countdown', () => {
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(vi.mocked(useFormFeedback)).toHaveBeenCalledWith({
			successDuration: 0,
		});
	});

	it('lets Add Meal be pressed only once Date and Meal name are filled', () => {
		render(
			<MealForm
				initialDraft={makeMealDraft({ date: '2026-11-27' })}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].canSubmit).toBe(false);

		setField('mealName', 'Supper');

		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].canSubmit).toBe(true);
	});

	it('reports the date and meal name to its frame as they change', () => {
		const onStatusChange = vi.fn();
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
				onStatusChange={onStatusChange}
			/>,
		);
		expect(onStatusChange).toHaveBeenLastCalledWith({
			date: '2026-11-27',
			mealName: 'Taco Night',
			linking: false,
		});

		setField('mealName', 'Burrito Night');

		expect(onStatusChange).toHaveBeenLastCalledWith({
			date: '2026-11-27',
			mealName: 'Burrito Night',
			linking: false,
		});
	});

	it('works without a frame listening for its status', () => {
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		setField('mealName', 'Burrito Night');
	});
});
