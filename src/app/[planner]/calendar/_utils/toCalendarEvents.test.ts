import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DayInterface } from '@/_models/types';

import { toCalendarEvents } from './toCalendarEvents';

vi.mock('./resolveDishSource', () => ({
	resolveDishSource: vi.fn((dish) => dish),
}));

import { resolveDishSource } from './resolveDishSource';

const mockResolveDishSource = vi.mocked(resolveDishSource);

describe('toCalendarEvents', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('returns empty array for empty calendar', () => {
		expect(toCalendarEvents([])).toEqual([]);
	});

	it('returns empty array for days with empty meals array', () => {
		const calendar: DayInterface[] = [{ date: '2024-01-15', meals: [] }];
		expect(toCalendarEvents(calendar)).toEqual([]);
	});

	it('maps a meal to a calendar event with string start/end dates', () => {
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
		];
		const [event] = toCalendarEvents(calendar);
		expect(event.id).toBe('meal-1');
		expect(event.title).toBe('Breakfast');
		expect(event.description).toBe('Morning meal');
		expect(event.start).toBe('2024-01-15');
		expect(event.end).toBe('2024-01-15');
		expect(event.dishes).toEqual([{ _id: 'dish-1', name: 'Eggs' }]);
	});

	it('maps meal without description', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Lunch', dishes: [] }],
			},
		];
		const events = toCalendarEvents(calendar);
		expect(events[0].description).toBeUndefined();
	});

	it('maps multiple meals on the same day to separate events', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{ _id: 'meal-1', name: 'Breakfast', dishes: [] },
					{ _id: 'meal-2', name: 'Dinner', dishes: [] },
				],
			},
		];
		const events = toCalendarEvents(calendar);
		expect(events).toHaveLength(2);
		expect(events[0].id).toBe('meal-1');
		expect(events[1].id).toBe('meal-2');
	});

	it('maps meals across multiple days', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
			{
				date: '2024-01-16',
				meals: [{ _id: 'meal-2', name: 'Lunch', dishes: [] }],
			},
		];
		const events = toCalendarEvents(calendar);
		expect(events).toHaveLength(2);
		expect(events[0].start).toBe('2024-01-15');
		expect(events[1].start).toBe('2024-01-16');
	});

	it('uses same date string for both start and end', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-03-20',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
			},
		];
		const [event] = toCalendarEvents(calendar);
		expect(event.start).toBe('2024-03-20');
		expect(event.end).toBe('2024-03-20');
	});

	it('calls resolveDishSource for each dish', () => {
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
		const savedItems = [
			{ _id: 'saved-1', name: 'My Bookmark', url: 'https://example.com' },
		];

		toCalendarEvents(calendar, savedItems);

		expect(mockResolveDishSource).toHaveBeenCalledTimes(2);
		expect(mockResolveDishSource).toHaveBeenCalledWith(
			dishes[0],
			expect.any(Map),
		);
		expect(mockResolveDishSource).toHaveBeenCalledWith(
			dishes[1],
			expect.any(Map),
		);
	});

	it('returns resolved dishes on the event', () => {
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
		const savedItems = [
			{ _id: 'saved-1', name: 'My Bookmark', url: 'https://example.com' },
		];

		const [event] = toCalendarEvents(calendar, savedItems);
		expect(event.dishes).toEqual([resolvedDish]);
	});
});
