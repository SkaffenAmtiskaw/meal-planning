import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { ListView } from './ListView';

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

vi.mock('./_components/DayRow', () => ({
	DayRow: vi.fn(({ date }: { date: DateTime }) => (
		<div data-testid="day-row">{date.toISODate()}</div>
	)),
}));

const today = DateTime.local(2024, 6, 15);
const days = [14, 15, 16].map((day) => DateTime.local(2024, 6, day));

describe('ListView', () => {
	beforeEach(() => {
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
		vi.mocked(getListDayRange).mockReturnValue(days);
		vi.mocked(useListScroll).mockReturnValue({
			regionRef: { current: null },
			dayRef: vi.fn(() => vi.fn()),
		});
	});

	it("shows a row for each day of the window around the viewer's today", () => {
		render(<ListView plannerId="planner-1" />);

		expect(getListDayRange).toHaveBeenCalledWith(today);
		expect(
			screen.getAllByTestId('day-row').map((row) => row.textContent),
		).toEqual(['2024-06-14', '2024-06-15', '2024-06-16']);
	});

	it('renders nothing while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));

		const { container } = render(<ListView plannerId="planner-1" />);

		expect(container.innerHTML).toBe('');
	});
});
