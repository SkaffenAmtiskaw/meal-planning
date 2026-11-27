import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { ListView } from './ListView';

import { ScrollingDayList } from '../ScrollingDayList/ScrollingDayList';
import { DayRow } from './_components/DayRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../ScrollingDayList/ScrollingDayList', () => ({
	ScrollingDayList: vi.fn(() => <div data-testid="day-list" />),
}));

vi.mock('./_components/DayRow', () => ({
	DayRow: vi.fn(() => null),
}));

const today = DateTime.local(2024, 6, 15);

describe('ListView', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
	});

	it('draws each day of the list as a desktop day row', () => {
		render(<ListView plannerId="planner-1" />);

		const { renderDay } = vi.mocked(ScrollingDayList).mock.lastCall?.[0] ?? {};
		const ref = vi.fn();
		const date = today.plus({ days: 1 });
		render(<div>{renderDay?.({ ref, date, today })}</div>);

		expect(vi.mocked(DayRow).mock.lastCall?.[0]).toEqual({
			ref,
			date,
			today,
			plannerId: 'planner-1',
		});
	});

	it('renders nothing while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));

		const { container } = render(<ListView plannerId="planner-1" />);

		expect(container.innerHTML).toBe('');
	});
});
