import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyboardEvent, ReactNode } from 'react';

import { DatePicker, type DatePickerProps } from '@mantine/dates';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { type SwipeDirection, useIsMobile, useSwipe, useToday } from '@/_hooks';

import { DatePickerGrid } from './DatePickerGrid';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
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

// Renders the month title the grid draws and returns the skeleton around it.
function monthLabelSkeleton(month: string): HTMLElement {
	const { monthLabelFormat } = lastProps() as {
		monthLabelFormat: (month: string) => ReactNode;
	};
	render(monthLabelFormat(month));
	return screen.getByTestId('skeleton');
}

// Renders the number the grid draws for a day and returns the skeleton around it.
function daySkeleton(date: string): HTMLElement {
	render(lastProps().renderDay?.(date) as ReactNode);
	return screen.getByTestId('skeleton');
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
		vi.mocked(useToday).mockReturnValue(
			makeKnownDay(DateTime.fromISO('2024-06-11')),
		);
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(markFor('2024-06-11').dataset.ring).toBe('true');
	});

	it("shows the viewer's month first when there's no value and the browser is still a month behind", () => {
		vi.mocked(useToday).mockReturnValue(
			makeKnownDay(DateTime.fromISO('2024-07-01')),
		);
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

	it('shows the month title', () => {
		render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

		expect(monthLabelSkeleton('2024-06-01').textContent).toBe('June 2024');
	});

	describe('while the day is unknown', () => {
		// Swipes the grid the way the swipe hook reports it.
		function swipe(direction: SwipeDirection): void {
			act(() => vi.mocked(useSwipe).mock.lastCall?.[0].onSwipe(direction));
		}

		// Presses a key on a day the way Mantine passes it to the day button.
		function pressKey(date: string, key: string): void {
			act(() =>
				lastProps()
					.getDayProps?.(date)
					?.onKeyDown?.({
						key,
						preventDefault: vi.fn(),
					} as unknown as KeyboardEvent<HTMLButtonElement>),
			);
		}

		describe('in the middle of a month', () => {
			beforeEach(() => {
				vi.mocked(useToday).mockReturnValue(
					makeUnknownDay(DateTime.fromISO('2024-06-10')),
				);
			});

			it('rings none of the days it could be', () => {
				render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

				for (const date of ['2024-06-09', '2024-06-10', '2024-06-11']) {
					expect(markFor(date).dataset.ring).toBe('false');
					cleanup();
				}
			});

			it('marks no day button as the current date', () => {
				render(<DatePickerGrid value="2024-06-15" onChange={vi.fn()} />);

				expect(
					lastProps().getDayProps?.('2024-06-10')?.['aria-current'],
				).toBeUndefined();
			});

			it("shows today's month first when there's no value", () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);

				expect(DateTime.fromISO(lastProps().date as string).month).toBe(6);
			});

			it('draws the month title and days without skeletons', () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);

				expect(monthLabelSkeleton('2024-06-01').dataset.visible).toBe('false');
				cleanup();
				expect(daySkeleton('2024-06-12').dataset.visible).toBe('false');
			});

			it('lets days be picked', () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);

				expect(lastProps().getDayProps?.('2024-06-12')?.disabled).toBe(false);
			});
		});

		describe("on a month's last day", () => {
			beforeEach(() => {
				vi.mocked(useToday).mockReturnValue(
					makeUnknownDay(DateTime.fromISO('2024-06-30')),
				);
			});

			it('draws the month title and days under skeletons with no value', () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);

				expect(monthLabelSkeleton('2024-06-01').dataset.visible).toBe('true');
				cleanup();
				expect(daySkeleton('2024-06-12').dataset.visible).toBe('true');
			});

			it("doesn't let days be picked with no value", () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);

				expect(lastProps().getDayProps?.('2024-06-12')?.disabled).toBe(true);
			});

			it("doesn't page when Mantine pages with no value", () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);
				const shown = lastProps().date;

				act(() => lastProps().onDateChange?.('2024-08-01'));

				expect(lastProps().date).toBe(shown);
			});

			it("doesn't page on a swipe with no value", () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);
				const shown = lastProps().date;

				swipe('left');

				expect(lastProps().date).toBe(shown);
			});

			it("doesn't page on a key press with no value", () => {
				render(<DatePickerGrid value={null} onChange={vi.fn()} />);
				const shown = lastProps().date;

				pressKey('2024-06-29', 'PageDown');

				expect(lastProps().date).toBe(shown);
			});

			it("draws the value's month without skeletons", () => {
				render(<DatePickerGrid value="2024-08-15" onChange={vi.fn()} />);

				expect(lastProps().date).toBe('2024-08-15');
				expect(monthLabelSkeleton('2024-08-01').dataset.visible).toBe('false');
				expect(lastProps().getDayProps?.('2024-08-12')?.disabled).toBe(false);
			});

			it("pages from the value's month", () => {
				render(<DatePickerGrid value="2024-08-15" onChange={vi.fn()} />);

				swipe('left');

				expect(lastProps().date).toBe('2024-09-01');
			});
		});

		it("draws the month under skeletons on a month's first day with no value", () => {
			vi.mocked(useToday).mockReturnValue(
				makeUnknownDay(DateTime.fromISO('2024-07-01')),
			);
			render(<DatePickerGrid value={null} onChange={vi.fn()} />);

			expect(monthLabelSkeleton('2024-06-01').dataset.visible).toBe('true');
		});

		it("rings today and opens on its month once it's known", () => {
			vi.mocked(useToday).mockReturnValue(
				makeUnknownDay(DateTime.fromISO('2024-06-30')),
			);
			const { rerender } = render(
				<DatePickerGrid value={null} onChange={vi.fn()} />,
			);

			vi.mocked(useToday).mockReturnValue(
				makeKnownDay(DateTime.fromISO('2024-07-01')),
			);
			rerender(<DatePickerGrid value={null} onChange={vi.fn()} />);

			expect(lastProps().date).toBe('2024-07-01');
			expect(lastProps().getDayProps?.('2024-07-01')?.disabled).toBe(false);
			expect(markFor('2024-07-01').dataset.ring).toBe('true');
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
