import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlannerClient } from '@/_actions/planner';

import CalendarPage from './page';

import { CalendarView } from './_components/CalendarView/CalendarView';

vi.mock('@/_utils/zObjectId', async () => {
	const { z } = await import('zod');
	return { zObjectId: z.string() };
});

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
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

		vi.mocked(getPlannerClient).mockResolvedValueOnce({
			_id: plannerId,
			name: "Test User's Planner",
			calendar,
			saved,
			tags: [],
		} as unknown as Awaited<ReturnType<typeof getPlannerClient>>);

		render(await CalendarPage({ params, searchParams }));

		expect(getPlannerClient).toHaveBeenCalledWith(plannerId);

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
