import { render } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import CalendarPage from './page';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/utils/zObjectId');
	return { zObjectId };
});

const mockGetPlanner = vi.fn();
vi.mock('@/_actions', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

type CalendarViewProps = {
	plannerId: string;
	savedItems: { _id: string; name: string; url?: string }[];
	calendar: unknown[];
};

const mockCalendarView = vi.fn<(props: CalendarViewProps) => null>(() => null);

vi.mock('./_components/CalendarView/CalendarView', () => ({
	CalendarView: (props: CalendarViewProps) => mockCalendarView(props),
}));

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });
const searchParams = Promise.resolve({});

const makePlanner = (
	saved: Array<{ _id: { toString: () => string }; name: string }> = [],
	calendar: unknown[] = [],
) => ({
	_id: { toString: () => plannerId },
	saved,
	calendar,
	tags: [],
});

describe('CalendarPage', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('passes plannerId to CalendarView', async () => {
		mockGetPlanner.mockResolvedValue(makePlanner());
		render(await CalendarPage({ params, searchParams }));
		expect(mockCalendarView).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId }),
		);
	});

	test('passes serialized saved items to CalendarView', async () => {
		const saved = [{ _id: { toString: () => 'item-1' }, name: 'Pasta' }];
		mockGetPlanner.mockResolvedValue(makePlanner(saved));
		render(await CalendarPage({ params, searchParams }));
		expect(mockCalendarView).toHaveBeenCalledWith(
			expect.objectContaining({
				savedItems: [{ _id: 'item-1', name: 'Pasta', url: undefined }],
			}),
		);
	});

	test('includes url for bookmark saved items', async () => {
		const saved = [
			{
				_id: { toString: () => 'bm-1' },
				name: 'My Blog',
				url: 'https://example.com',
			},
		];
		mockGetPlanner.mockResolvedValue(makePlanner(saved));
		render(await CalendarPage({ params, searchParams }));
		expect(mockCalendarView).toHaveBeenCalledWith(
			expect.objectContaining({
				savedItems: [
					{ _id: 'bm-1', name: 'My Blog', url: 'https://example.com' },
				],
			}),
		);
	});

	test('passes serialized calendar to CalendarView', async () => {
		const calendar = [{ date: '2024-01-15', meals: [] }];
		mockGetPlanner.mockResolvedValue(makePlanner([], calendar));
		render(await CalendarPage({ params, searchParams }));
		expect(mockCalendarView).toHaveBeenCalledWith(
			expect.objectContaining({ calendar }),
		);
	});

	test('passes empty array when calendar is missing', async () => {
		mockGetPlanner.mockResolvedValue({
			_id: { toString: () => plannerId },
			saved: [],
			tags: [],
		});
		render(await CalendarPage({ params, searchParams }));
		expect(mockCalendarView).toHaveBeenCalledWith(
			expect.objectContaining({ calendar: [] }),
		);
	});
});
