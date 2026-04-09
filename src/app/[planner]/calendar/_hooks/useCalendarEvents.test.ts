import { act, renderHook } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { useCalendarEvents } from './useCalendarEvents';

const { mockSet, mockEventsService } = vi.hoisted(() => {
	const mockSet = vi.fn();
	return { mockSet, mockEventsService: { set: mockSet } };
});

vi.mock('@schedule-x/events-service', () => ({
	createEventsServicePlugin: vi.fn(() => mockEventsService),
}));

const { mockToScheduleXEvents } = vi.hoisted(() => ({
	mockToScheduleXEvents: vi.fn(),
}));

vi.mock('../_utils/toScheduleXEvents', () => ({
	toScheduleXEvents: (...args: unknown[]) => mockToScheduleXEvents(...args),
}));

describe('useCalendarEvents', () => {
	test('returns the eventsService plugin', () => {
		mockToScheduleXEvents.mockReturnValue([]);
		const { result } = renderHook(() => useCalendarEvents([], []));
		expect(result.current.eventsService).toBe(mockEventsService);
	});

	test('initializes events from toScheduleXEvents with calendar and savedItems', () => {
		const mockEvents = [
			{
				id: 'meal-1',
				start: 'mock',
				end: 'mock',
				title: 'Breakfast',
				dishes: [],
			},
		];
		const calendar = [{ date: '2024-01-01', meals: [] }];
		const savedItems = [{ _id: '1', name: 'Recipe' }];
		mockToScheduleXEvents.mockReturnValueOnce(mockEvents);
		const { result } = renderHook(() =>
			useCalendarEvents(calendar, savedItems),
		);
		expect(mockToScheduleXEvents).toHaveBeenCalledWith(calendar, savedItems);
		expect(result.current.initialEvents).toBe(mockEvents);
	});

	test('handleMealAdded calls eventsService.set with transformed events', () => {
		const updatedEvents = [
			{ id: 'meal-2', start: 'mock', end: 'mock', title: 'Lunch', dishes: [] },
		];
		const newCalendar = [{ date: '2024-01-02', meals: [] }];
		const savedItems = [{ _id: '1', name: 'Recipe' }];
		mockToScheduleXEvents.mockReturnValueOnce([]); // initialEvents
		mockToScheduleXEvents.mockReturnValueOnce(updatedEvents);
		const { result } = renderHook(() => useCalendarEvents([], savedItems));
		act(() => result.current.handleMealAdded(newCalendar));
		expect(mockToScheduleXEvents).toHaveBeenCalledWith(newCalendar, savedItems);
		expect(mockSet).toHaveBeenCalledWith(updatedEvents);
	});
});
