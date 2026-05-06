import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import CalendarPage from './page';

import { CalendarView } from './_components/CalendarView/CalendarView';

vi.mock('@/_models', async () => {
	const { z } = await import('zod');
	return { zObjectId: z.string() };
});

vi.mock('./_components/CalendarView/CalendarView', () => ({
	CalendarView: vi.fn(() => null),
}));

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });
const searchParams = Promise.resolve({});

describe('CalendarPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes plannerId to CalendarView', async () => {
		render(await CalendarPage({ params, searchParams }));

		expect(vi.mocked(CalendarView)).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId }),
			undefined,
		);
	});
});
