import { fireEvent, render, screen, within } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WeekView } from './WeekView';

import { useCalendarContext } from '../CalendarContext';
import { CalendarProvider } from '../CalendarProvider';
import { getWeekDates } from '../_utils/getWeekDates';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../_utils/getWeekDates', () => ({
	getWeekDates: vi.fn(),
}));

function NextWeekButton() {
	const { goToNext } = useCalendarContext();
	return <button onClick={goToNext}>Next</button>;
}

describe('WeekView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	afterEach(() => vi.useRealTimers());

	it('renders 7 day columns', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		expect(screen.getAllByTestId('week-day-column')).toHaveLength(7);
	});

	it('renders correct day header labels', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		expect(screen.getByText('Sun 9/15')).toBeDefined();
		expect(screen.getByText('Mon 9/16')).toBeDefined();
		expect(screen.getByText('Tue 9/17')).toBeDefined();
		expect(screen.getByText('Wed 9/18')).toBeDefined();
		expect(screen.getByText('Thu 9/19')).toBeDefined();
		expect(screen.getByText('Fri 9/20')).toBeDefined();
		expect(screen.getByText('Sat 9/21')).toBeDefined();
	});

	it('highlights today with an ember badge', () => {
		const today = DateTime.local(2024, 9, 18);
		vi.useFakeTimers();
		vi.setSystemTime(today.toJSDate());

		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={today} initialView="week">
				<WeekView />
			</CalendarProvider>,
		);

		const todayBadge = screen.getByTestId('week-day-today');
		expect(todayBadge).toBeDefined();
		expect(todayBadge.getAttribute('data-color')).toBe('ember');
		expect(todayBadge.textContent).toBe('Wed 9/18');

		vi.useRealTimers();
	});

	it('updates the week when selectedDate changes', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates)
			.mockReturnValueOnce([
				DateTime.local(2024, 9, 15),
				DateTime.local(2024, 9, 16),
				DateTime.local(2024, 9, 17),
				DateTime.local(2024, 9, 18),
				DateTime.local(2024, 9, 19),
				DateTime.local(2024, 9, 20),
				DateTime.local(2024, 9, 21),
			])
			.mockReturnValueOnce([
				DateTime.local(2024, 9, 22),
				DateTime.local(2024, 9, 23),
				DateTime.local(2024, 9, 24),
				DateTime.local(2024, 9, 25),
				DateTime.local(2024, 9, 26),
				DateTime.local(2024, 9, 27),
				DateTime.local(2024, 9, 28),
			]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView />
				<NextWeekButton />
			</CalendarProvider>,
		);

		expect(screen.getByText('Sun 9/15')).toBeDefined();
		expect(getWeekDates).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Next'));

		expect(screen.getByText('Sun 9/22')).toBeDefined();
		expect(getWeekDates).toHaveBeenCalledTimes(2);
	});

	it('groups events by date and renders them in the correct day column', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		const events = [
			{ id: '1', date: '2024-09-16', title: 'Monday Event' },
			{ id: '2', date: '2024-09-18', title: 'Wednesday Event' },
			{ id: '3', date: '2024-09-18', title: 'Another Wednesday Event' },
		];

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView events={events} />
			</CalendarProvider>,
		);

		const columns = screen.getAllByTestId('week-day-column');
		expect(within(columns[1]).getByText('Monday Event')).toBeDefined();
		expect(within(columns[3]).getByText('Wednesday Event')).toBeDefined();
		expect(
			within(columns[3]).getByText('Another Wednesday Event'),
		).toBeDefined();
		expect(within(columns[0]).queryByTestId('week-event')).toBeNull();
		expect(within(columns[2]).queryByTestId('week-event')).toBeNull();
		expect(within(columns[4]).queryByTestId('week-event')).toBeNull();
		expect(within(columns[5]).queryByTestId('week-event')).toBeNull();
		expect(within(columns[6]).queryByTestId('week-event')).toBeNull();
	});

	it('uses renderEvent when provided', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		const events = [{ id: '1', date: '2024-09-18', title: 'Custom Event' }];
		const renderEvent = vi.fn((event, props) => (
			<div data-testid="custom-event" data-tab-index={props.tabIndex}>
				{event.title}
			</div>
		));

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView events={events} renderEvent={renderEvent} />
			</CalendarProvider>,
		);

		expect(screen.getByTestId('custom-event')).toBeDefined();
		expect(renderEvent).toHaveBeenCalledWith(
			events[0],
			expect.objectContaining({
				tabIndex: expect.any(Number),
				ref: expect.any(Function),
			}),
		);
	});

	it('calls onEventClick when a default event is clicked', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		const event = { id: '1', date: '2024-09-18', title: 'Clickable Event' };
		const onEventClick = vi.fn();

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView events={[event]} onEventClick={onEventClick} />
			</CalendarProvider>,
		);

		fireEvent.click(screen.getByTestId('week-event'));
		expect(onEventClick).toHaveBeenCalledWith(event);
	});

	it('renders default events with button role', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView events={[{ id: '1', date: '2024-09-18', title: 'Event' }]} />
			</CalendarProvider>,
		);

		expect(screen.getByRole('button', { name: 'Event' })).toBeDefined();
	});

	it('renders nothing for days without events', () => {
		const initialDate = DateTime.local(2024, 9, 18);
		vi.mocked(getWeekDates).mockReturnValue([
			DateTime.local(2024, 9, 15),
			DateTime.local(2024, 9, 16),
			DateTime.local(2024, 9, 17),
			DateTime.local(2024, 9, 18),
			DateTime.local(2024, 9, 19),
			DateTime.local(2024, 9, 20),
			DateTime.local(2024, 9, 21),
		]);

		render(
			<CalendarProvider initialDate={initialDate} initialView="week">
				<WeekView events={[]} />
			</CalendarProvider>,
		);

		expect(screen.queryAllByTestId('week-event')).toHaveLength(0);
	});
});
