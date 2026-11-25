import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOpenDishList } from './useOpenDishList';

describe('useOpenDishList', () => {
	it('starts with no list open, and tracks the one opened', () => {
		const { result } = renderHook(() => useOpenDishList());
		expect(result.current[0]).toBeNull();

		act(() => result.current[1].openList('a'));

		expect(result.current[0]).toBe('a');
	});

	it('keeps only one list open', () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));

		act(() => result.current[1].openList('b'));

		expect(result.current[0]).toBe('b');
	});

	it('closes the open list', () => {
		const { result } = renderHook(() => useOpenDishList());
		act(() => result.current[1].openList('a'));

		act(() => result.current[1].closeList());

		expect(result.current[0]).toBeNull();
	});
});
