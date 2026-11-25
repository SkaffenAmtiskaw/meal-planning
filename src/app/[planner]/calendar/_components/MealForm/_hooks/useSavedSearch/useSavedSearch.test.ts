import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSavedSearch } from './useSavedSearch';

describe('useSavedSearch', () => {
	it('starts empty and holds what the user types', () => {
		const { result } = renderHook(() => useSavedSearch());
		expect(result.current.search).toBe('');

		act(() => result.current.setSearch('taco'));

		expect(result.current.search).toBe('taco');
	});

	it("fills the search with the dish's name when linking starts", () => {
		const { result } = renderHook(() => useSavedSearch());
		act(() => result.current.setSearch('taco'));

		act(() => result.current.resetForLinking('chicken'));

		expect(result.current.search).toBe('chicken');
	});
});
