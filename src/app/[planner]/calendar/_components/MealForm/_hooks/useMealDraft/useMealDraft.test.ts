import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeDishDraft, makeMealDraft } from '#fixtures/dish';

import { useMealDraft } from './useMealDraft';

const twoDishes = makeMealDraft({
	dishes: [
		makeDishDraft({ key: 'a', name: 'Soup' }),
		makeDishDraft({ key: 'b', name: 'Bread' }),
	],
});

describe('useMealDraft', () => {
	it('starts from the draft it was given', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		expect(result.current.draft).toEqual(twoDishes);
	});

	it('sets a meal field', () => {
		const { result } = renderHook(() => useMealDraft(makeMealDraft()));

		act(() => result.current.setField('mealName', 'Taco Night'));

		expect(result.current.draft.mealName).toBe('Taco Night');
	});

	it('adds an empty dish at the end', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.addDish());

		expect(result.current.draft.dishes).toHaveLength(3);
		expect(result.current.draft.dishes[2]).toMatchObject({
			name: '',
			source: null,
			note: '',
		});
	});

	it('adds a dish at the end, named after the saved recipe and linked to it', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() =>
			result.current.addLinkedDish({
				_id: 'saved-1',
				name: 'Lemon Herb Chicken',
				kind: 'recipe',
				tags: [],
			}),
		);

		expect(result.current.draft.dishes).toHaveLength(3);
		expect(result.current.draft.dishes[2]).toMatchObject({
			name: 'Lemon Herb Chicken',
			source: { kind: 'saved', savedId: 'saved-1' },
			note: '',
		});
	});

	it('removes only the dish with that key', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.removeDish('a'));

		expect(result.current.draft.dishes.map((d) => d.key)).toEqual(['b']);
	});

	it("sets a dish's reference", () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.setReference('a', 'p. 12'));

		expect(result.current.draft.dishes[0].source).toEqual({
			kind: 'reference',
			text: 'p. 12',
		});
		expect(result.current.draft.dishes[1].source).toBeNull();
	});

	it('leaves a dish with nothing linked once its reference is cleared', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.setReference('a', 'p. 12'));
		act(() => result.current.setReference('a', ''));

		expect(result.current.draft.dishes[0].source).toBeNull();
	});

	it("sets only that dish's note", () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.setNote('b', 'Buy rolls'));

		expect(result.current.draft.dishes.map((d) => d.note)).toEqual([
			'',
			'Buy rolls',
		]);
	});

	it('unlinks a dish, keeping its name', () => {
		const linked = makeMealDraft({
			dishes: [
				makeDishDraft({
					key: 'a',
					name: 'Soup',
					source: { kind: 'saved', savedId: 'saved-1' },
				}),
			],
		});
		const { result } = renderHook(() => useMealDraft(linked));

		act(() => result.current.unlinkDish('a'));

		expect(result.current.draft.dishes[0]).toEqual({
			...linked.dishes[0],
			source: null,
		});
	});

	it('renames only the dish with that key, keeping its link', () => {
		const linked = makeMealDraft({
			dishes: [
				makeDishDraft({
					key: 'a',
					name: 'Soup',
					source: { kind: 'saved', savedId: 'saved-1' },
				}),
				makeDishDraft({ key: 'b', name: 'Bread' }),
			],
		});
		const { result } = renderHook(() => useMealDraft(linked));

		act(() => result.current.renameDish('a', 'Tomato Soup'));

		expect(result.current.draft.dishes).toEqual([
			{ ...linked.dishes[0], name: 'Tomato Soup' },
			linked.dishes[1],
		]);
	});
});
