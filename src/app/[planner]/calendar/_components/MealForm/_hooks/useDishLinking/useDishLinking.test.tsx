import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishValues, makeMealDishes } from '#fixtures/dish';
import type { SavedItem } from '@/_actions/library/types';
import { useEscapeLayer, useIsMobile } from '@/_hooks';

import { useDishLinking } from './useDishLinking';

import { useMealDishes } from '../../../_hooks/useMealForm';

vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);

const soup = makeDishValues({ key: 'soup', name: 'chicken' });
const bread = makeDishValues({ key: 'bread', name: 'Bread' });

const chicken: SavedItem = {
	_id: 'saved-1',
	name: 'Lemon Herb Chicken',
	kind: 'recipe',
	tags: [],
};

const withDishes = () => {
	const mealDishes = makeMealDishes({ dishes: [soup, bread] });
	vi.mocked(useMealDishes).mockReturnValue(mealDishes);
	return mealDishes;
};

const renderLinking = () => renderHook(() => useDishLinking()).result;

describe('useDishLinking', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false);
	});

	describe('on desktop', () => {
		it('marks the dish being linked, gives it to the column, focuses the search, and takes Esc from the frame', () => {
			withDishes();
			const result = renderLinking();
			const search = document.createElement('input');
			document.body.append(search);
			result.current.searchRef.current = search;

			act(() => result.current.startLinking('soup'));

			expect(result.current.linkingKey).toBe('soup');
			expect(result.current.linkingDish).toBe(soup);
			expect(document.activeElement).toBe(search);
			expect(useEscapeLayer).toHaveBeenLastCalledWith(true);
			search.remove();
		});

		it('links the picked recipe to the dish being linked, then leaves link mode', () => {
			const mealDishes = withDishes();
			const result = renderLinking();
			act(() => result.current.startLinking('soup'));

			act(() => result.current.pickSavedItem(chicken));

			expect(mealDishes.linkDish).toHaveBeenCalledWith('soup', chicken);
			expect(mealDishes.addLinkedDish).not.toHaveBeenCalled();
			expect(result.current.linkingKey).toBeNull();
			expect(result.current.linkingDish).toBeNull();
		});

		it('adds the picked recipe as a new dish while nothing is being linked', () => {
			const mealDishes = withDishes();
			const result = renderLinking();

			act(() => result.current.pickSavedItem(chicken));

			expect(mealDishes.addLinkedDish).toHaveBeenCalledWith(chicken);
			expect(mealDishes.linkDish).not.toHaveBeenCalled();
		});

		it('leaves link mode on Cancel', () => {
			withDishes();
			const result = renderLinking();
			act(() => result.current.startLinking('soup'));

			act(() => result.current.exitLinking());

			expect(result.current.linkingKey).toBeNull();
		});

		it('opens no list from Add dish', () => {
			const mealDishes = withDishes();
			const result = renderLinking();

			act(() => result.current.addDishWithList());

			expect(mealDishes.addDish).toHaveBeenCalledTimes(1);
			expect(result.current.openDishList).toBeNull();
		});
	});

	describe('on a phone', () => {
		beforeEach(() => {
			vi.mocked(useIsMobile).mockReturnValue(true);
		});

		it("opens the dish's saved list rather than link mode, as a phone has no column", () => {
			withDishes();
			const result = renderLinking();

			act(() => result.current.startLinking('soup'));

			expect(result.current.linkingKey).toBeNull();
			expect(result.current.openDishList?.key).toBe('soup');
		});

		it("starts the dish's list afresh, even while it's open", () => {
			withDishes();
			const result = renderLinking();
			act(() => result.current.openList('soup'));
			const open = result.current.openDishList;

			act(() => result.current.startLinking('soup'));

			expect(result.current.openDishList?.key).toBe('soup');
			expect(result.current.openDishList?.id).not.toBe(open?.id);
		});

		it("opens the new dish's list from Add dish", () => {
			withDishes();
			const result = renderLinking();

			act(() => result.current.addDishWithList());

			expect(result.current.openDishList?.key).toBe('dish-2');
		});

		it('names and links the dish from the recipe used in its list, then closes the list', () => {
			const mealDishes = withDishes();
			const result = renderLinking();
			act(() => result.current.openList('soup'));

			act(() => result.current.chooseFromList('soup', chicken));

			expect(mealDishes.chooseRecipe).toHaveBeenCalledWith('soup', chicken);
			expect(result.current.openDishList).toBeNull();
		});

		it('closes the open list', () => {
			withDishes();
			const result = renderLinking();
			act(() => result.current.openList('soup'));

			act(() => result.current.closeList());

			expect(result.current.openDishList).toBeNull();
		});
	});
});
