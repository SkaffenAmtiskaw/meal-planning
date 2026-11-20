import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ReactNode } from 'react';

import { PlannerSavedItemsProvider } from './PlannerSavedItemsProvider';
import { usePlannerSavedItems } from './usePlannerSavedItems';

const savedItems = [
	{
		_id: '001',
		name: 'Boiled Water',
		ingredients: ['4 c water'],
		instructions: ['Boil.'],
	},
	{
		_id: '002',
		name: 'Fish Tacos',
		url: 'https://www.americastestkitchen.com/recipes/7559-california-fish-tacos',
	},
];

const wrapper = ({ children }: { children: ReactNode }) => (
	<PlannerSavedItemsProvider savedItems={savedItems}>
		{children}
	</PlannerSavedItemsProvider>
);

describe('usePlannerSavedItems', () => {
	test('maps the saved items the provider is given', () => {
		const { result } = renderHook(() => usePlannerSavedItems(), { wrapper });

		expect(result.current).toEqual([
			{
				_id: '001',
				name: 'Boiled Water',
			},
			{
				_id: '002',
				name: 'Fish Tacos',
				url: 'https://www.americastestkitchen.com/recipes/7559-california-fish-tacos',
			},
		]);
	});

	test('throws outside the provider', () => {
		expect(() => renderHook(() => usePlannerSavedItems())).toThrow(
			'usePlannerSavedItems must be used inside PlannerSavedItemsProvider',
		);
	});
});
