import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ReactNode } from 'react';

import { makeDishLinking } from '#fixtures/dish';

import { DishLinkingProvider } from './DishLinkingProvider';
import { useDishLinkingContext } from './useDishLinkingContext';

describe('useDishLinkingContext', () => {
	it('gives the linking its provider holds', () => {
		const value = makeDishLinking();

		const { result } = renderHook(() => useDishLinkingContext(), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<DishLinkingProvider value={value}>{children}</DishLinkingProvider>
			),
		});

		expect(result.current).toBe(value);
	});

	it('throws outside DishLinkingProvider', () => {
		expect(() => renderHook(() => useDishLinkingContext())).toThrow(
			'useDishLinkingContext must be used inside DishLinkingProvider',
		);
	});
});
