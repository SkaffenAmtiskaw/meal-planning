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

	it('removes only the dish with that key', () => {
		const { result } = renderHook(() => useMealDraft(twoDishes));

		act(() => result.current.removeDish('a'));

		expect(result.current.draft.dishes.map((d) => d.key)).toEqual(['b']);
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
