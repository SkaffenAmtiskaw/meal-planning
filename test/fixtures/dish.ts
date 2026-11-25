import type {
	DishDraft,
	MealDraft,
} from '@/app/[planner]/calendar/_components/MealForm/types';

export const makeDishDraft = (
	overrides: Partial<DishDraft> = {},
): DishDraft => ({
	key: 'dish-1',
	name: '',
	source: null,
	note: '',
	...overrides,
});

export const makeMealDraft = (
	overrides: Partial<MealDraft> = {},
): MealDraft => ({
	date: '',
	mealName: '',
	description: '',
	dishes: [makeDishDraft()],
	...overrides,
});
