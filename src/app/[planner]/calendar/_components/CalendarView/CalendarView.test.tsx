import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';
import type { DayInterface } from '@/_models/types';

import { CalendarView } from './CalendarView';

import { CalendarDaysProvider } from '../../_hooks/useCalendarMeals';
import { PlannerSavedItemsProvider } from '../../_hooks/usePlannerSavedItems';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../Calendar', async () => ({
	CalendarProvider: vi.fn(({ children }) => children),
}));

vi.mock('./CalendarViewContent', async () => ({
	CalendarViewContent: vi.fn(() => null),
}));

vi.mock(
	'../CalendarModal',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_components/CalendarModal'),
);

vi.mock(
	'../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

vi.mock(
	'../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);

const props = {
	plannerId: 'planner-1',
	calendar: [{ date: '2024-01-01', meals: [] }] as DayInterface[],
	savedItems: [
		{ _id: 'item-1', name: 'Item 1', kind: 'recipe', tags: [] },
	] as SavedItem[],
};

describe('CalendarView', () => {
	it('gives the calendar days and saved items to their providers', () => {
		render(<CalendarView {...props} />);

		expect(vi.mocked(CalendarDaysProvider)).toHaveBeenCalledWith(
			expect.objectContaining({ calendar: props.calendar }),
			undefined,
		);
		expect(vi.mocked(PlannerSavedItemsProvider)).toHaveBeenCalledWith(
			expect.objectContaining({ savedItems: props.savedItems }),
			undefined,
		);
	});
});
