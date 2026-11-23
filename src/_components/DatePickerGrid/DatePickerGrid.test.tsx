import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyboardEvent, ReactNode } from 'react';

import { DatePicker, type DatePickerProps } from '@mantine/dates';

import { DateTime } from 'luxon';

import { type SwipeDirection, useIsMobile, useSwipe, useToday } from '@/_hooks';

import { DatePickerGrid } from './DatePickerGrid';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@mantine/dates', async () => await import('#mocks/@mantine/dates'));
vi.mock(
	'../NumberMark',
	async () => await import('#mocks/@/_components/NumberMark'),
);

// Today in these tests is 2024-06-10.
const TODAY = new Date(2024, 5, 10, 12);

function lastProps(): DatePickerProps {
	return vi.mocked(DatePicker).mock.lastCall?.[0] as DatePickerProps;
}

// Renders the number the grid draws for a day and returns its mark.
function markFor(date: string): HTMLElement {
	render(lastProps().renderDay?.(date) as ReactNode);
	return screen.getByTestId(`number-mark-${Number(date.slice(8))}`);
}

describe('DatePickerGrid', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(TODAY);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.mocked(useToday).mockReset();
	});

	it("shows the value's month first", () => {
		render(<DatePickerGrid value="2024-08-15" onChange={vi.fn()} />);

		expect(lastProps().date).toBe('2024-08-15');
	});

	it("shows today's month first when there's no value", () => {
		render(<DatePickerGrid value={null} onChange={vi.fn()} />);

		expect(lastProps().date).toBe('2024-06-10');
	});

	it('shows the month Mantine pages to', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		act(() => lastProps().onDateChange?.('2024-07-01'));

		expect(lastProps().date).toBe('2024-07-01');
	});

	it('labels each weekday with a single letter', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		const { weekdayFormat } = lastProps() as {
			weekdayFormat: (date: string) => string;
		};

		expect(weekdayFormat('2026-11-22')).toBe('S');
		expect(weekdayFormat('2026-11-25')).toBe('W');
	});

	it('rings today', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-10').dataset.ring).toBe('true');
	});

	it("rings today in the viewer's time zone, not the browser's", () => {
		vi.mocked(useToday).mockReturnValue(DateTime.fromISO('2024-06-11'));
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-11').dataset.ring).toBe('true');
	});

	it("shows the viewer's month first when there's no value and the browser is still a month behind", () => {
		vi.mocked(useToday).mockReturnValue(DateTime.fromISO('2024-07-01'));
		render(<DatePickerGrid value={null} onChange={vi.fn()} />);

		expect(lastProps().date).toBe('2024-07-01');
	});

	it('does not ring other days', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-11').dataset.ring).toBe('false');
	});

	it('fills the selected day', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-15').dataset.filled).toBe('true');
	});

	it('does not fill other days', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-16').dataset.filled).toBe('false');
	});

	it('fills no day when nothing is selected', () => {
		render(<DatePickerGrid value={null} onChange={vi.fn()} />);

		expect(markFor('2024-06-10').dataset.filled).toBe('false');
	});

	it('mutes days outside the month on screen', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-07-01').dataset.muted).toBe('true');
	});

	it('does not mute days in the month on screen', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-30').dataset.muted).toBe('false');
	});

	it('mutes against the month it has paged to', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		act(() => lastProps().onDateChange?.('2024-07-01'));

		expect(markFor('2024-06-30').dataset.muted).toBe('true');
	});

	it("marks today's day button as the current date", () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(lastProps().getDayProps?.('2024-06-10')?.['aria-current']).toBe(
			'date',
		);
	});

	it('does not mark other day buttons as the current date', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(
			lastProps().getDayProps?.('2024-06-11')?.['aria-current'],
		).toBeUndefined();
	});

	it("pages to the month a day's key press moves to", () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		act(() =>
			lastProps()
				.getDayProps?.('2024-06-15')
				?.onKeyDown?.({
					key: 'PageDown',
					preventDefault: vi.fn(),
				} as unknown as KeyboardEvent<HTMLButtonElement>),
		);

		expect(lastProps().date).toBe('2024-07-01');
	});

	it('marks the marked dates', () => {
		render(
			<DatePickerGrid
				value="2024-06-15"
				onChange={vi.fn()}
				markedDates={['2024-06-12', '2024-07-02']}
			/>,
		);

		expect(lastProps().getDayProps?.('2024-06-12')).toMatchObject({
			'data-marked': true,
		});
		expect(lastProps().getDayProps?.('2024-07-02')).toMatchObject({
			'data-marked': true,
		});
	});

	it('does not mark other dates', () => {
		render(
			<DatePickerGrid
				value="2024-06-15"
				onChange={vi.fn()}
				markedDates={['2024-06-12']}
			/>,
		);

		expect(
			lastProps().getDayProps?.('2024-06-13')?.['data-marked' as never],
		).toBeUndefined();
	});

	it('marks no dates by default', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(
			lastProps().getDayProps?.('2024-06-12')?.['data-marked' as never],
		).toBeUndefined();
	});

	it('uses touch sizes on phones', () => {
		vi.mocked(useIsMobile).mockReturnValue(true);
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(lastProps().size).toBe('lg');
		expect(lastProps().fullWidth).toBe(true);
		expect(markFor('2024-06-12').dataset.size).toBe('lg');
	});

	it('uses compact sizes on desktop', () => {
		vi.mocked(useIsMobile).mockReturnValue(false);
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(lastProps().size).toBe('sm');
		expect(lastProps().fullWidth).toBe(false);
		expect(markFor('2024-06-12').dataset.size).toBe('sm');
	});

	describe('swipes', () => {
		// Swipes the grid the way the swipe hook reports it.
		function swipe(direction: SwipeDirection): void {
			act(() => vi.mocked(useSwipe).mock.lastCall?.[0].onSwipe(direction));
		}

		it('turn on on phones', () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			expect(vi.mocked(useSwipe).mock.lastCall?.[0].enabled).toBe(true);
		});

		it('stay off on desktop', () => {
			vi.mocked(useIsMobile).mockReturnValue(false);
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			expect(vi.mocked(useSwipe).mock.lastCall?.[0].enabled).toBe(false);
		});

		it('show the next month on a left swipe', () => {
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			swipe('left');

			expect(lastProps().date).toBe('2024-07-01');
		});

		it('show the previous month on a right swipe', () => {
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			swipe('right');

			expect(lastProps().date).toBe('2024-05-01');
		});

		it('leave the month on a down swipe', () => {
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			swipe('down');

			expect(lastProps().date).toBe('2024-06-15');
		});

		it('page from the month Mantine paged to', () => {
			render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

			act(() => lastProps().onDateChange?.('2024-08-01'));
			swipe('left');

			expect(lastProps().date).toBe('2024-09-01');
		});

		it('pick no day', () => {
			const onChange = vi.fn();
			render(<DatePickerGrid value="2024-06-15" onChange={onChange} />);

			swipe('left');

			expect(onChange).not.toHaveBeenCalled();
		});
	});

	it('reports the picked date', () => {
		const onChange = vi.fn();
		render(<DatePickerGrid value="2024-06-15" onChange={onChange} />);

		fireEvent.change(screen.getByTestId('date-picker'), {
			target: { value: '2024-07-20' },
		});

		expect(onChange).toHaveBeenCalledWith('2024-07-20');
	});

	it('reports nothing when Mantine clears the value', () => {
		const onChange = vi.fn();
		render(<DatePickerGrid value="2024-06-15" onChange={onChange} />);

		fireEvent.change(screen.getByTestId('date-picker'), {
			target: { value: '' },
		});

		expect(onChange).not.toHaveBeenCalled();
	});
});
