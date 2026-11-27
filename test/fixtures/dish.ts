import { vi } from 'vitest';

import type {
	DishValues,
	MealDishes,
	MealValues,
} from '@/app/[planner]/calendar/_components/_hooks/useMealForm';
import type { Dish } from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDish';
import type { DishLinking } from '@/app/[planner]/calendar/_components/MealForm/_hooks/useDishLinking';

export const makeDishValues = (
	overrides: Partial<DishValues> = {},
): DishValues => ({
	key: 'dish-1',
	name: '',
	source: null,
	note: '',
	...overrides,
});

export const makeMealValues = (
	overrides: Partial<MealValues> = {},
): MealValues => ({
	date: '',
	mealName: '',
	description: '',
	dishes: [makeDishValues()],
	...overrides,
});

// What useDish() gives a row piece: the first dish, with no message on it.
export const makeDish = (overrides: Partial<Dish> = {}): Dish => ({
	dish: makeDishValues(),
	index: 0,
	nameError: null,
	...overrides,
});

// What useMealDishes() gives: one empty dish, and a spy for each change.
export const makeMealDishes = (
	overrides: Partial<MealDishes> = {},
): MealDishes => ({
	dishes: [makeDishValues()],
	linkedIds: new Set(),
	dishCount: 0,
	addDish: vi.fn(() => 'dish-2'),
	addLinkedDish: vi.fn(),
	linkDish: vi.fn(),
	chooseRecipe: vi.fn(),
	unlinkDish: vi.fn(),
	renameAndUnlinkDish: vi.fn(),
	setReference: vi.fn(),
	deleteDish: vi.fn(),
	...overrides,
});

// What useDishLinkingContext() gives: nothing being linked, no list open, and a spy for each action.
export const makeDishLinking = (
	overrides: Partial<DishLinking> = {},
): DishLinking => ({
	linkingKey: null,
	linkingDish: null,
	openDishList: null,
	searchRef: { current: null },
	startLinking: vi.fn(),
	addDishWithList: vi.fn(),
	chooseFromList: vi.fn(),
	pickSavedItem: vi.fn(),
	openList: vi.fn(),
	closeList: vi.fn(),
	exitLinking: vi.fn(),
	...overrides,
});
