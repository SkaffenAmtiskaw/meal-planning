import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanner } from '@/_actions/planner/getPlanner';

import CalendarPage from './page';

import { CalendarView } from './_components/CalendarView/CalendarView';

vi.mock(
	'@/_actions/planner/getPlanner',
	async () => await import('#mocks/@/_actions/planner/getPlanner'),
);

vi.mock('./_components/CalendarView/CalendarView', async () => ({
	CalendarView: vi.fn(() => null),
}));

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });
const searchParams = Promise.resolve({});

describe('CalendarPage', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('passes plannerId to CalendarView', async () => {
		render(await CalendarPage({ params, searchParams }));

		expect(vi.mocked(CalendarView)).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId }),
			undefined,
		);
	});

	it('fetches planner data and passes calendar and savedItems to CalendarView', async () => {
		const calendar = [{ date: '2026-03-27', meals: [] }];
		const saved = [
			{ _id: 'bookmark-1', name: 'Bookmark One', url: 'https://example.com/1' },
			{
				_id: 'recipe-1',
				name: 'Recipe One',
				ingredients: [],
				instructions: [],
			},
		];

		vi.mocked(getPlanner).mockResolvedValueOnce({
			_id: plannerId,
			name: "Test User's Planner",
			calendar,
			saved,
			tags: [],
		} as unknown as Awaited<ReturnType<typeof getPlanner>>);

		render(await CalendarPage({ params, searchParams }));

		expect(getPlanner).toHaveBeenCalledWith(plannerId);

		expect(vi.mocked(CalendarView)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				calendar,
				savedItems: saved,
			}),
			undefined,
		);
	});
});
