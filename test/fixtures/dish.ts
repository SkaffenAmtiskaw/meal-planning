import { vi } from 'vitest';

import type { Dish } from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDish';
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

// What useDish() gives a row piece: a dish with no flags set, and a spy for each of the form's actions.
export const makeDish = (overrides: Partial<Dish> = {}): Dish => ({
	dish: makeDishDraft(),
	nameless: false,
	linking: false,
	listOpenId: null,
	linkedIds: new Set(),
	renameDish: vi.fn(),
	removeDish: vi.fn(),
	unlinkDish: vi.fn(),
	setReference: vi.fn(),
	setNote: vi.fn(),
	startLinking: vi.fn(),
	openList: vi.fn(),
	closeList: vi.fn(),
	chooseRecipe: vi.fn(),
	...overrides,
});
