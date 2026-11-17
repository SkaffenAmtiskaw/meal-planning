import { describe, expect, test } from 'vitest';

import type { DayInterface } from '@/_models/types';

import { toScheduleXEvents } from './toScheduleXEvents';

describe('toScheduleXEvents', () => {
	test('returns empty array for empty calendar', () => {
		expect(toScheduleXEvents([])).toEqual([]);
	});

	test('returns empty array for days with empty meals array', () => {
		const calendar: DayInterface[] = [{ date: '2024-01-15', meals: [] }];
		expect(toScheduleXEvents(calendar)).toEqual([]);
	});

	test('maps a meal to a schedule-x event with PlainDate start/end', () => {
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
		const [event] = toScheduleXEvents(calendar);
		expect(event.id).toBe('meal-1');
		expect(event.title).toBe('Breakfast');
		expect(event.description).toBe('Morning meal');
		expect(event.start.toString()).toBe('2024-01-15');
		expect(event.end.toString()).toBe('2024-01-15');
		expect(event.dishes).toEqual([{ _id: 'dish-1', name: 'Eggs' }]);
	});

	test('maps meal without description', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Lunch', dishes: [] }],
			},
		];
		const events = toScheduleXEvents(calendar);
		expect(events[0].description).toBeUndefined();
	});

	test('maps multiple meals on the same day to separate events', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{ _id: 'meal-1', name: 'Breakfast', dishes: [] },
					{ _id: 'meal-2', name: 'Dinner', dishes: [] },
				],
			},
		];
		const events = toScheduleXEvents(calendar);
		expect(events).toHaveLength(2);
		expect(events[0].id).toBe('meal-1');
		expect(events[1].id).toBe('meal-2');
	});

	test('maps meals across multiple days', () => {
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
		const events = toScheduleXEvents(calendar);
		expect(events).toHaveLength(2);
		expect(events[0].start.toString()).toBe('2024-01-15');
		expect(events[1].start.toString()).toBe('2024-01-16');
	});

	test('uses same PlainDate for both start and end', () => {
		const calendar: DayInterface[] = [
			{
				date: '2024-03-20',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
			},
		];
		const [event] = toScheduleXEvents(calendar);
		expect(event.start.toString()).toBe('2024-03-20');
		expect(event.end.toString()).toBe('2024-03-20');
	});

	test('preserves dish data on the event', () => {
		const dishes = [{ _id: 'dish-1', name: 'Pasta', note: 'al dente' }];
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes }],
			},
		];
		expect(toScheduleXEvents(calendar)[0].dishes).toEqual(dishes);
	});

	test('resolves a bookmark string source to its url', () => {
		const savedItems = [
			{ _id: 'saved-1', name: 'My Bookmark', url: 'https://example.com' },
		];
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
		const [event] = toScheduleXEvents(calendar, savedItems);
		expect(event.dishes[0].source).toEqual({ url: 'https://example.com' });
	});

	test('resolves a recipe string source to its _id', () => {
		const savedItems = [{ _id: 'saved-1', name: 'My Recipe' }];
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
		const [event] = toScheduleXEvents(calendar, savedItems);
		expect(event.dishes[0].source).toEqual({ _id: 'saved-1' });
	});

	test('leaves string source unchanged when not found in savedItems', () => {
		const savedItems = [{ _id: 'saved-99', name: 'Other' }];
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
		const [event] = toScheduleXEvents(calendar, savedItems);
		expect(event.dishes[0].source).toBe('saved-1');
	});

	test('does not alter object sources', () => {
		const source = { url: 'https://blog.com' };
		const calendar: DayInterface[] = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Dinner',
						dishes: [{ _id: 'dish-1', name: 'Pasta', source }],
					},
				],
			},
		];
		const savedItems = [{ _id: 'saved-1', name: 'Other' }];
		const [event] = toScheduleXEvents(calendar, savedItems);
		expect(event.dishes[0].source).toEqual(source);
	});
});
