import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import { toCalendarMeals } from './toCalendarMeals';
import type { CalendarEvent } from './toCalendarEvents';

vi.mock('@/_theme/colors', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/_theme/colors')>();
	return {
		...actual,
		getMealColor: vi.fn(),
	};
});

const mockGetMealColor = vi.mocked(getMealColor);

describe('toCalendarMeals', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns an empty array for an empty CalendarEvent array', () => {
		const result = toCalendarMeals([]);

		expect(result).toEqual([]);
	});

	it('maps a CalendarEvent array to CalendarMeal objects', () => {
		mockGetMealColor.mockImplementation((title) =>
			title === 'Breakfast' ? 'fern' : 'seafoam',
		);

		const calendarEvents: CalendarEvent[] = [
			{
				id: 'meal-1',
				start: '2024-01-15',
				end: '2024-01-15',
				title: 'Breakfast',
				description: 'Morning meal',
				dishes: [{ name: 'Eggs' }],
			},
			{
				id: 'meal-2',
				start: '2024-01-16',
				end: '2024-01-16',
				title: 'Dinner',
				dishes: [],
			},
		];

		const result = toCalendarMeals(calendarEvents);

		expect(result).toEqual([
			{
				id: 'meal-1',
				date: '2024-01-15',
				name: 'Breakfast',
				description: 'Morning meal',
				borderColor: TAG_COLORS.fern.border,
				dishes: [{ name: 'Eggs' }],
			},
			{
				id: 'meal-2',
				date: '2024-01-16',
				name: 'Dinner',
				borderColor: TAG_COLORS.seafoam.border,
				dishes: [],
			},
		]);
	});
});
