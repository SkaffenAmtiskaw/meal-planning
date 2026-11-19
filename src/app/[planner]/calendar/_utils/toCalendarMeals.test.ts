import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DayInterface } from '@/_models/types';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import { resolveDishSource } from './resolveDishSource';
import { toCalendarMeals } from './toCalendarMeals';

vi.mock('@/_theme/colors', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/_theme/colors')>();
	return {
		...actual,
		getMealColor: vi.fn(() => 'fern'),
	};
});

vi.mock('./resolveDishSource', () => ({
	resolveDishSource: vi.fn((dish) => dish),
}));

const mockGetMealColor = vi.mocked(getMealColor);
const mockResolveDishSource = vi.mocked(resolveDishSource);

describe('toCalendarMeals', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns an empty array for an empty calendar', () => {
		expect(toCalendarMeals([])).toEqual([]);
	});

	it('returns an empty array for days with no meals', () => {
		const calendar: DayInterface[] = [{ date: '2024-01-15', meals: [] }];
		expect(toCalendarMeals(calendar)).toEqual([]);
	});

	it('maps each meal to a CalendarMeal on its day, coloured by its name', () => {
		mockGetMealColor.mockImplementation((name) =>
			name === 'Breakfast' ? 'fern' : 'seafoam',
		);
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Breakfast',
						description: 'Morning meal',
						dishes: [{ _id: 'dish-1', name: 'Eggs' }],
					},
				],
			},
			{
				date: '2024-01-16',
				meals: [{ _id: 'meal-2', name: 'Dinner', dishes: [] }],
			},
		];

		expect(toCalendarMeals(calendar)).toEqual([
			{
				id: 'meal-1',
				date: '2024-01-15',
				name: 'Breakfast',
				description: 'Morning meal',
				borderColor: TAG_COLORS.fern.border,
				dishes: [{ _id: 'dish-1', name: 'Eggs' }],
			},
			{
				id: 'meal-2',
				date: '2024-01-16',
				name: 'Dinner',
				description: undefined,
				borderColor: TAG_COLORS.seafoam.border,
				dishes: [],
			},
		]);
	});

	it('maps several meals on one day to separate CalendarMeals', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{ _id: 'meal-1', name: 'Breakfast', dishes: [] },
					{ _id: 'meal-2', name: 'Dinner', dishes: [] },
				],
			},
		];

		const meals = toCalendarMeals(calendar);

		expect(meals.map((meal) => meal.id)).toEqual(['meal-1', 'meal-2']);
	});

	it('resolves each dish source against the saved items', () => {
		const dishes = [
			{ _id: 'dish-1', name: 'Pasta', source: 'saved-1' },
			{ _id: 'dish-2', name: 'Salad' },
		];
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes }],
			},
		];
		const savedItem = {
			_id: 'saved-1',
			name: 'My Bookmark',
			url: 'https://example.com',
		};

		toCalendarMeals(calendar, [savedItem]);

		const savedMap = new Map([['saved-1', savedItem]]);
		expect(mockResolveDishSource).toHaveBeenCalledTimes(2);
		expect(mockResolveDishSource).toHaveBeenCalledWith(dishes[0], savedMap);
		expect(mockResolveDishSource).toHaveBeenCalledWith(dishes[1], savedMap);
	});

	it('returns the resolved dishes on the meal', () => {
		const resolvedDish = {
			name: 'Pasta',
			source: { url: 'https://example.com' },
		};
		mockResolveDishSource.mockReturnValueOnce(resolvedDish);
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Dinner',
						dishes: [{ _id: 'dish-1', name: 'Pasta', source: 'saved-1' }],
					},
				],
			},
		];

		const [meal] = toCalendarMeals(calendar);

		expect(meal.dishes).toEqual([resolvedDish]);
	});
});
