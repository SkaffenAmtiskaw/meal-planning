import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { useSavedItemCriteria } from './useSavedItemCriteria';

import type { DishDraft } from '../../types';

const soup = makeDishDraft({ key: 'soup', name: 'chicken' });
const bread = makeDishDraft({ key: 'bread', name: 'Bread' });

const renderCriteria = (linkingDish: DishDraft | null = null) =>
	renderHook(({ dish }) => useSavedItemCriteria(dish), {
		initialProps: { dish: linkingDish },
	});

describe('useSavedItemCriteria', () => {
	it('starts empty and holds the search and tags the user picks', () => {
		const { result } = renderCriteria();
		expect(result.current[0]).toEqual({ search: '', tagIds: [] });

		act(() => result.current[1].setSearch('taco'));
		act(() => result.current[1].setTagIds(['quick', 'vegetarian']));

		expect(result.current[0]).toEqual({
			search: 'taco',
			tagIds: ['quick', 'vegetarian'],
		});
	});

	it("fills the search with the dish's name and clears the tags when linking starts", () => {
		const { result, rerender } = renderCriteria();
		act(() => result.current[1].setSearch('taco'));
		act(() => result.current[1].setTagIds(['quick']));

		rerender({ dish: soup });

		expect(result.current[0]).toEqual({ search: 'chicken', tagIds: [] });
	});

	// A pick, Cancel, Esc and deleting the dish all end with no dish being linked.
	it('empties the search and clears the tags when linking ends', () => {
		const { result, rerender } = renderCriteria(soup);
		act(() => result.current[1].setSearch('risotto'));
		act(() => result.current[1].setTagIds(['quick']));

		rerender({ dish: null });

		expect(result.current[0]).toEqual({ search: '', tagIds: [] });
	});

	it("fills the search with the next dish's name and clears the tags when linking moves to it", () => {
		const { result, rerender } = renderCriteria(soup);
		act(() => result.current[1].setTagIds(['quick']));

		rerender({ dish: bread });

		expect(result.current[0]).toEqual({ search: 'Bread', tagIds: [] });
	});

	it('keeps the search the user typed while the same dish stays linked, even as it is renamed', () => {
		const { result, rerender } = renderCriteria(soup);
		act(() => result.current[1].setSearch('risotto'));

		rerender({ dish: { ...soup, name: 'chicken soup' } });

		expect(result.current[0].search).toBe('risotto');
	});

	it('keeps the search the user typed outside link mode', () => {
		const { result, rerender } = renderCriteria();
		act(() => result.current[1].setSearch('taco'));

		rerender({ dish: null });

		expect(result.current[0].search).toBe('taco');
	});

	it('starts from the dish being linked when it mounts mid-link', () => {
		const { result } = renderCriteria(soup);

		expect(result.current[0]).toEqual({ search: 'chicken', tagIds: [] });
	});
});
