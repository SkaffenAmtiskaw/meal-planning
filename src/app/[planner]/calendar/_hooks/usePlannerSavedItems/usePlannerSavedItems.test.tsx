import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ReactNode } from 'react';

import type { SavedItem } from '@/_actions/library/types';

import { PlannerSavedItemsProvider } from './PlannerSavedItemsProvider';
import { usePlannerSavedItems } from './usePlannerSavedItems';

const savedItems: SavedItem[] = [
	{ _id: '001', name: 'Boiled Water', kind: 'recipe', tags: [] },
];

const wrapper = ({ children }: { children: ReactNode }) => (
	<PlannerSavedItemsProvider savedItems={savedItems}>
		{children}
	</PlannerSavedItemsProvider>
);

describe('usePlannerSavedItems', () => {
	test('returns the saved items the provider is given', () => {
		const { result } = renderHook(() => usePlannerSavedItems(), { wrapper });

		expect(result.current).toBe(savedItems);
	});

	test('throws outside the provider', () => {
		expect(() => renderHook(() => usePlannerSavedItems())).toThrow(
			'usePlannerSavedItems must be used inside PlannerSavedItemsProvider',
		);
	});
});
