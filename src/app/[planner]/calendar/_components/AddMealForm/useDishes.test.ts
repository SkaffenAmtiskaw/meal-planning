import { act, renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { useDishes } from './useDishes';

describe('useDishes', () => {
	test('initializes with exactly one dish', () => {
		const { result } = renderHook(() => useDishes());
		expect(result.current.dishes).toHaveLength(1);
	});

	test('initial dish has default values', () => {
		const { result } = renderHook(() => useDishes());
		const dish = result.current.dishes[0];
		expect(dish.name).toBe('');
		expect(dish.sourceType).toBe('none');
		expect(dish.savedId).toBe('');
		expect(dish.sourceText).toBe('');
		expect(dish.note).toBe('');
		expect(dish.noteExpanded).toBe(false);
	});

	test('addDish appends a second dish', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		expect(result.current.dishes).toHaveLength(2);
	});

	test('addDish gives each new dish a unique id', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const [first, second] = result.current.dishes;
		expect(first.id).not.toBe(second.id);
	});

	test('removeDish removes the correct dish', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const idToRemove = result.current.dishes[0].id;
		act(() => result.current.removeDish(idToRemove));
		expect(result.current.dishes).toHaveLength(1);
		expect(result.current.dishes[0].id).not.toBe(idToRemove);
	});

	test('removeDish with unknown id does not change the list', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.removeDish('nonexistent-id'));
		expect(result.current.dishes).toHaveLength(1);
	});

	test('updateDish merges patch into the correct dish', () => {
		const { result } = renderHook(() => useDishes());
		const id = result.current.dishes[0].id;
		act(() => result.current.updateDish(id, { name: 'Pasta' }));
		expect(result.current.dishes[0].name).toBe('Pasta');
	});

	test('updateDish does not mutate other dishes', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const [first, second] = result.current.dishes;
		act(() => result.current.updateDish(first.id, { name: 'Soup' }));
		expect(result.current.dishes[1].id).toBe(second.id);
		expect(result.current.dishes[1].name).toBe('');
	});
});
