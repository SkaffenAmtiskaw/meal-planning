import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { PhoneListView } from './PhoneListView';

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

vi.mock('./_components/PhoneDaySection', () => ({
	PhoneDaySection: vi.fn(({ date }: { date: DateTime }) => (
		<div data-testid="day-section">{date.toISODate()}</div>
	)),
}));

vi.mock('./_components/PhoneDayListSkeleton', () => ({
	PhoneDayListSkeleton: vi.fn(() => <div data-testid="day-list-skeleton" />),
}));

const today = DateTime.local(2024, 6, 15);
const days = [14, 15, 16].map((day) => DateTime.local(2024, 6, day));

describe('PhoneListView', () => {
	beforeEach(() => {
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
		vi.mocked(getListDayRange).mockReturnValue(days);
		vi.mocked(useListScroll).mockReturnValue({
			regionRef: { current: null },
			dayRef: vi.fn(() => vi.fn()),
		});
	});

	it("shows a section for each day of the window around the viewer's today, as a list", () => {
		render(<PhoneListView plannerId="planner-1" />);

		expect(getListDayRange).toHaveBeenCalledWith(today);
		const items = screen.getAllByRole('listitem');
		expect(items.map((item) => item.textContent)).toEqual([
			'2024-06-14',
			'2024-06-15',
			'2024-06-16',
		]);
		expect(screen.queryByTestId('day-list-skeleton')).toBeNull();
	});

	it('shows skeleton days while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));

		render(<PhoneListView plannerId="planner-1" />);

		expect(screen.getByTestId('day-list-skeleton')).toBeDefined();
		expect(screen.queryByTestId('day-section')).toBeNull();
	});
});
