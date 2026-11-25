import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOpenDishList } from './useOpenDishList';

describe('useOpenDishList', () => {
	it('starts with no list open, and tracks the one opened', () => {
		const { result } = renderHook(() => useOpenDishList());
		expect(result.current[0]).toBeNull();

		act(() => result.current[1].openList('a'));

		expect(result.current[0]?.key).toBe('a');
	});

	it('keeps only one list open, each open with an id of its own', () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));
		const first = result.current[0];

		act(() => result.current[1].openList('b'));

		expect(result.current[0]?.key).toBe('b');
		expect(result.current[0]?.id).not.toBe(first?.id);
	});

	it("keeps the open's id when that dish's list is opened again", () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));
		const first = result.current[0];

		act(() => result.current[1].openList('a'));

		expect(result.current[0]).toEqual(first);
	});

	it("always starts a new open on restart, even of that dish's open list", () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));
		const first = result.current[0];

		act(() => result.current[1].restartList('a'));

		expect(result.current[0]?.key).toBe('a');
		expect(result.current[0]?.id).not.toBe(first?.id);
	});

	it('closes the open list', () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));

		act(() => result.current[1].closeList());

		expect(result.current[0]).toBeNull();
	});
});
