import { renderHook } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { usePlannerSavedItems } from './usePlannerSavedItems';

const { usePlannerContextMock } = vi.hoisted(() => ({
	usePlannerContextMock: vi.fn(),
}));

vi.mock('@/app/[planner]/_components', () => ({
	usePlannerContext: usePlannerContextMock,
}));

describe('map planner saved items', () => {
	test('should map the saved items in a planner', () => {
		usePlannerContextMock.mockReturnValue({
			saved: [
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
			],
		});

		const { result } = renderHook(() => usePlannerSavedItems());

		const savedItems = result.current;

		expect(savedItems).toEqual([
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
});
