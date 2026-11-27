import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay } from '#fixtures/viewerDay';
import { useToday, useTodayOrThrow } from '@/_hooks';

import { ScrollingDayList } from './ScrollingDayList';

import { useListScroll } from '../../_hooks/useListScroll';
import { getListDayRange } from '../_utils/getListDayRange';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../_utils/getListDayRange', () => ({
	getListDayRange: vi.fn(),
}));

vi.mock('../../_hooks/useListScroll', () => ({
	useListScroll: vi.fn(),
}));

const today = DateTime.local(2024, 6, 15);
const days = [14, 15, 16].map((day) => DateTime.local(2024, 6, day));
const dayRef = vi.fn((date: DateTime) => Object.assign(vi.fn(), { date }));

describe('ScrollingDayList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
		vi.mocked(useTodayOrThrow).mockReturnValue(today);
		vi.mocked(getListDayRange).mockReturnValue(days);
		vi.mocked(useListScroll).mockReturnValue({
			regionRef: { current: null },
			dayRef,
		});
	});

	it("draws each day of the window around the viewer's today as a list item", () => {
		render(<ScrollingDayList renderDay={({ date }) => date.toISODate()} />);

		expect(getListDayRange).toHaveBeenCalledWith(today);
		expect(useListScroll).toHaveBeenCalledWith(days);
		expect(
			screen.getAllByRole('listitem').map((item) => item.textContent),
		).toEqual(['2024-06-14', '2024-06-15', '2024-06-16']);
	});

	it("hands each day its scroll ref, its date and today's date", () => {
		const renderDay = vi.fn(() => null);

		render(<ScrollingDayList renderDay={renderDay} />);

		expect(renderDay).toHaveBeenCalledWith({
			ref: dayRef.mock.results[1].value,
			date: days[1],
			today,
		});
	});
});
