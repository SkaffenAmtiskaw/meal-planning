import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeDishDraft } from '#fixtures/dish';

import { DishProvider } from './DishProvider';
import { MealDishesProvider } from './MealDishesProvider';
import { useDish } from './useDish';
import type { MealDishes } from './types';

const soup = makeDishDraft({ key: 'soup', name: 'Soup' });

const mealDishes = (overrides: Partial<MealDishes> = {}): MealDishes => ({
	namelessKeys: new Set(),
	linkingKey: null,
	linkedIds: new Set(),
	openDishList: null,
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

const renderDish = (value: MealDishes) =>
	renderHook(() => useDish(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<MealDishesProvider value={value}>
				<DishProvider dish={soup}>{children}</DishProvider>
			</MealDishesProvider>
		),
	}).result.current;

describe('useDish', () => {
	it('gives the dish its provider holds', () => {
		expect(renderDish(mealDishes()).dish).toBe(soup);
	});

	it.each([
		{ keys: ['soup'], nameless: true },
		{ keys: ['bread'], nameless: false },
	])('marks the dish nameless only when its key is flagged ($keys)', ({
		keys,
		nameless,
	}) => {
		const dish = renderDish(mealDishes({ namelessKeys: new Set(keys) }));

		expect(dish.nameless).toBe(nameless);
	});

	it.each([
		{ linkingKey: 'soup', linking: true },
		{ linkingKey: 'bread', linking: false },
		{ linkingKey: null, linking: false },
	])('marks the dish linking only while it is the one being linked ($linkingKey)', ({
		linkingKey,
		linking,
	}) => {
		expect(renderDish(mealDishes({ linkingKey })).linking).toBe(linking);
	});

	it.each([
		{ openDishList: { key: 'soup', id: 3 }, listOpenId: 3 },
		{ openDishList: { key: 'bread', id: 3 }, listOpenId: null },
		{ openDishList: null, listOpenId: null },
	])("gives the open's id only while the dish's own list is open ($openDishList.key)", ({
		openDishList,
		listOpenId,
	}) => {
		expect(renderDish(mealDishes({ openDishList })).listOpenId).toBe(
			listOpenId,
		);
	});

	it("passes the form's actions on, called with the key they're given", () => {
		const value = mealDishes();
		const dish = renderDish(value);

		dish.renameDish('soup', 'Tomato Soup');

		expect(value.renameDish).toHaveBeenCalledWith('soup', 'Tomato Soup');
		expect(dish.linkedIds).toBe(value.linkedIds);
	});

	it('throws outside DishProvider', () => {
		expect(() =>
			renderHook(() => useDish(), {
				wrapper: ({ children }: { children: ReactNode }) => (
					<MealDishesProvider value={mealDishes()}>
						{children}
					</MealDishesProvider>
				),
			}),
		).toThrow('useDish must be used inside DishProvider');
	});

	it('throws outside MealDishesProvider', () => {
		expect(() =>
			renderHook(() => useDish(), {
				wrapper: ({ children }: { children: ReactNode }) => (
					<DishProvider dish={soup}>{children}</DishProvider>
				),
			}),
		).toThrow('useDish must be used inside MealDishesProvider');
	});
});
