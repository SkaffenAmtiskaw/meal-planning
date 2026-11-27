import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { PhoneListView } from './PhoneListView';

import { ScrollingDayList } from '../ScrollingDayList/ScrollingDayList';
import { PhoneDaySection } from './_components/PhoneDaySection';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ScrollingDayList/ScrollingDayList', () => ({
	ScrollingDayList: vi.fn(() => <div data-testid="day-list" />),
}));

vi.mock('./_components/PhoneDaySection', () => ({
	PhoneDaySection: vi.fn(() => null),
}));

vi.mock('../AddMealButton', () => ({
	MobileAddMealButton: vi.fn(() => (
		<div data-testid="mobile-add-meal-button" />
	)),
}));

vi.mock('./_components/PhoneDayListSkeleton', () => ({
	PhoneDayListSkeleton: vi.fn(() => <div data-testid="day-list-skeleton" />),
}));

const today = DateTime.local(2024, 6, 15);

describe('PhoneListView', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
	});

	it('draws each day of the list as a phone day section', () => {
		render(<PhoneListView plannerId="planner-1" />);

		expect(screen.queryByTestId('day-list-skeleton')).toBeNull();
		const { renderDay } = vi.mocked(ScrollingDayList).mock.lastCall?.[0] ?? {};
		const ref = vi.fn();
		const date = today.plus({ days: 1 });
		render(<div>{renderDay?.({ ref, date, today })}</div>);

		expect(vi.mocked(PhoneDaySection).mock.lastCall?.[0]).toEqual({
			ref,
			date,
			today,
			plannerId: 'planner-1',
		});
	});

	it('shows skeleton days while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));

		render(<PhoneListView plannerId="planner-1" />);

		expect(screen.getByTestId('day-list-skeleton')).toBeDefined();
		expect(screen.queryByTestId('day-list')).toBeNull();
	});
});
