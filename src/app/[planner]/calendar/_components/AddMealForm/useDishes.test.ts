import { act, renderHook } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

import { useDishes } from './useDishes';

describe('useDishes', () => {
	it('initializes with exactly one dish', () => {
		const { result } = renderHook(() => useDishes());
		expect(result.current.dishes).toHaveLength(1);
	});

	it('initial dish has default values', () => {
		const { result } = renderHook(() => useDishes());
		const [dish] = result.current.dishes;
		expect(dish).toEqual({
			id: expect.any(String),
			name: '',
			sourceType: 'none',
			savedId: '',
			sourceText: '',
			note: '',
			expanded: false,
		});
	});

	it('addDish appends a second dish', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		expect(result.current.dishes).toHaveLength(2);
	});

	it('addDish gives each new dish a unique id', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const [first, second] = result.current.dishes;
		expect(first.id).not.toBe(second.id);
	});

	it('removeDish removes the correct dish', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const idToRemove = result.current.dishes[0].id;
		act(() => result.current.removeDish(idToRemove));
		expect(result.current.dishes).toHaveLength(1);
		expect(result.current.dishes[0].id).not.toBe(idToRemove);
	});

	it('removeDish with unknown id does not change the list', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.removeDish('nonexistent-id'));
		expect(result.current.dishes).toHaveLength(1);
	});

	it('updateDish merges patch into the correct dish', () => {
		const { result } = renderHook(() => useDishes());
		const id = result.current.dishes[0].id;
		act(() => result.current.updateDish(id, { name: 'Pasta' }));
		expect(result.current.dishes[0].name).toBe('Pasta');
	});

	it('updateDish does not mutate other dishes', () => {
		const { result } = renderHook(() => useDishes());
		act(() => result.current.addDish());
		const [first, second] = result.current.dishes;
		act(() => result.current.updateDish(first.id, { name: 'Soup' }));
		expect(result.current.dishes[1]).toEqual({
			...second,
			id: second.id,
		});
		expect(result.current.dishes[1].name).toBe('');
	});

	it('does not clear the note when updateDish changes expanded', () => {
		const { result } = renderHook(() => useDishes());
		const id = result.current.dishes[0].id;
		act(() =>
			result.current.updateDish(id, { note: 'Keep me', expanded: true }),
		);
		act(() => result.current.updateDish(id, { expanded: false }));
		expect(result.current.dishes[0].note).toBe('Keep me');
		expect(result.current.dishes[0].expanded).toBe(false);
	});
});
