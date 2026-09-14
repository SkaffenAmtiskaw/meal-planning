import type { ReactNode } from 'react';

import { Box } from '@mantine/core';

import { act, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListView } from './ListView';

import {
	type CalendarContextValue,
	useCalendarContext,
} from '../CalendarContext';
import { DayRow } from './_components/DayRow';
import { getListDayRange } from './_utils/getListDayRange';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./_utils/getListDayRange', () => ({
	getListDayRange: vi.fn(),
}));

vi.mock('./_components/DayRow', () => ({
	DayRow: vi.fn(
		({
			date,
			onAddMeal,
		}: {
			date: DateTime;
			onAddMeal?: (date: DateTime) => void;
		}) => (
			<div data-testid="day-row" data-iso={date.toISODate()}>
				<button
					type="button"
					data-testid="gutter-trigger"
					onClick={() => onAddMeal?.(date)}
				>
					gutter
				</button>
				<button
					type="button"
					data-testid="ghost-trigger"
					onClick={() => onAddMeal?.(date)}
				>
					ghost
				</button>
			</div>
		),
	),
}));

vi.mock('./ListView.module.css', () => ({
	default: {
		scrollRegion: 'scrollRegion',
		innerColumn: 'innerColumn',
	},
}));

vi.mock('../CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

function createMockContextValue(
	overrides: Partial<CalendarContextValue> = {},
): CalendarContextValue {
	return {
		selectedDate: DateTime.local(2024, 6, 15),
		viewType: 'list',
		rangeAnchor: DateTime.local(2024, 6, 15),
		setSelectedDate: vi.fn(),
		setViewType: vi.fn(),
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
		...overrides,
	};
}

class MockIntersectionObserver {
	callback: IntersectionObserverCallback;
	elements: Element[] = [];
	observe = vi.fn((element: Element) => {
		this.elements.push(element);
	});
	unobserve = vi.fn((element: Element) => {
		this.elements = this.elements.filter((el) => el !== element);
	});
	disconnect = vi.fn(() => {
		this.elements = [];
	});

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
	}

	trigger(entries: IntersectionObserverEntry[]) {
		this.callback(entries, this as unknown as IntersectionObserver);
	}
}

let lastObserver: MockIntersectionObserver | null = null;

function IntersectionObserverMockConstructor(
	callback: IntersectionObserverCallback,
): IntersectionObserver {
	lastObserver = new MockIntersectionObserver(callback);
	return lastObserver as unknown as IntersectionObserver;
}

function getLastObserver(): MockIntersectionObserver {
	if (!lastObserver) {
		throw new Error('No IntersectionObserver instance was created');
	}
	return lastObserver;
}

function createIntersectionEntry(
	target: Element,
	{ isIntersecting, top }: { isIntersecting: boolean; top: number },
): IntersectionObserverEntry {
	return {
		target,
		isIntersecting,
		boundingClientRect: { top } as DOMRectReadOnly,
		intersectionRatio: isIntersecting ? 1 : 0,
		intersectionRect: {} as DOMRectReadOnly,
		rootBounds: null,
		time: Date.now(),
	} as IntersectionObserverEntry;
}

describe('ListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		lastObserver = null;
		global.IntersectionObserver =
			IntersectionObserverMockConstructor as unknown as typeof IntersectionObserver;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders a DayRow for every day in the range', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		render(<ListView />);

		expect(screen.getAllByTestId('day-row')).toHaveLength(3);
	});

	it('passes today to each DayRow', () => {
		const today = DateTime.local(2024, 6, 15);
		const dates = [
			DateTime.local(2024, 6, 13),
			DateTime.local(2024, 6, 14),
			DateTime.local(2024, 6, 15),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 13) }),
		);

		render(<ListView today={today} />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].today).toEqual(today);
		}
	});

	it('defaults today to the start of the current day when omitted', () => {
		const now = DateTime.local(2024, 6, 20, 14, 30);
		vi.useFakeTimers();
		vi.setSystemTime(now.toJSDate());

		const today = DateTime.local(2024, 6, 20).startOf('day');
		const dates = [DateTime.local(2024, 6, 20)];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 20) }),
		);

		render(<ListView />);

		expect(DayRow).toHaveBeenCalledTimes(1);
		expect(vi.mocked(DayRow).mock.calls[0][0].today).toEqual(today);
	});

	it('uses rangeAnchor from CalendarContext to build the day range', () => {
		const rangeAnchor = DateTime.local(2024, 6, 10);
		vi.mocked(getListDayRange).mockReturnValue([rangeAnchor]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor }),
		);

		render(<ListView />);

		expect(getListDayRange).toHaveBeenCalledWith(rangeAnchor);
	});

	describe('intersection observer scroll detection', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		function setupIntersectionScenario(
			selectedDate = DateTime.local(2024, 6, 13),
			rangeAnchor = DateTime.local(2024, 6, 14),
		) {
			const dates = [
				DateTime.local(2024, 6, 13),
				DateTime.local(2024, 6, 14),
				DateTime.local(2024, 6, 15),
			];
			vi.mocked(getListDayRange).mockReturnValue(dates);

			const setSelectedDate = vi.fn();
			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({
					selectedDate,
					rangeAnchor,
					setSelectedDate,
				}),
			);

			const { container, unmount } = render(<ListView />);
			const rows = Array.from(
				container.querySelectorAll('[data-iso]'),
			) as HTMLElement[];

			return { rows, setSelectedDate, unmount };
		}

		it('observes all day rows after render', () => {
			const { rows } = setupIntersectionScenario();
			const observer = getLastObserver();

			expect(observer.elements).toEqual(rows);
		});

		it('does not update selectedDate while the topmost visible row changes rapidly', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario();
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[1], { isIntersecting: true, top: 0 }),
				]);
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(setSelectedDate).not.toHaveBeenCalled();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 0 }),
				]);
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(setSelectedDate).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(setSelectedDate).toHaveBeenCalledTimes(1);
			expect(setSelectedDate).toHaveBeenCalledWith(DateTime.local(2024, 6, 15));
		});

		it('updates selectedDate to the topmost visible day after the debounce expires', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario();
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 0 }),
				]);
			});

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).toHaveBeenCalledTimes(1);
			expect(setSelectedDate).toHaveBeenCalledWith(DateTime.local(2024, 6, 15));
		});

		it('does not update selectedDate when the topmost visible day is already selected', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario(
				DateTime.local(2024, 6, 15),
			);
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 0 }),
				]);
			});

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).not.toHaveBeenCalled();
		});

		it('cleans up the observer and pending timer on unmount', () => {
			const { rows, setSelectedDate, unmount } = setupIntersectionScenario();
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 0 }),
				]);
			});

			unmount();

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).not.toHaveBeenCalled();
			expect(observer.disconnect).toHaveBeenCalled();
		});

		it('does not update selectedDate when no rows are intersecting', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario();
			const observer = getLastObserver();

			act(() => {
				observer.trigger(
					rows.map((row) =>
						createIntersectionEntry(row, { isIntersecting: false, top: 0 }),
					),
				);
			});

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).not.toHaveBeenCalled();
		});

		it('cancels the pending timer when no rows become intersecting', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario();
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 0 }),
				]);
			});

			act(() => {
				observer.trigger(
					rows.map((row) =>
						createIntersectionEntry(row, { isIntersecting: false, top: 0 }),
					),
				);
			});

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).not.toHaveBeenCalled();
		});

		it('selects the topmost intersecting row when multiple rows are visible', () => {
			const { rows, setSelectedDate } = setupIntersectionScenario(
				DateTime.local(2024, 6, 14),
			);
			const observer = getLastObserver();

			act(() => {
				observer.trigger([
					createIntersectionEntry(rows[1], { isIntersecting: true, top: 100 }),
					createIntersectionEntry(rows[0], { isIntersecting: true, top: 50 }),
					createIntersectionEntry(rows[2], { isIntersecting: true, top: 150 }),
				]);
			});

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(setSelectedDate).toHaveBeenCalledTimes(1);
			expect(setSelectedDate).toHaveBeenCalledWith(DateTime.local(2024, 6, 13));
		});

		it('does not create an observer when there are no day rows', () => {
			vi.mocked(getListDayRange).mockReturnValue([]);
			vi.mocked(useCalendarContext).mockReturnValue(
				createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 14) }),
			);

			render(<ListView />);

			expect(getLastObserver).toThrow();
		});

		it('does not create an observer when the scroll container ref is unavailable', () => {
			vi.mocked(Box).mockImplementationOnce(
				({
					children,
					'data-testid': testId,
					ref: _ref,
					...props
				}: Record<string, unknown>) => (
					<div data-testid={testId as string} {...props}>
						{children as ReactNode}
					</div>
				),
			);

			setupIntersectionScenario();

			expect(getLastObserver).toThrow();
		});
	});

	it('renders without crashing when a day has no ISO date', () => {
		const invalidDate = DateTime.invalid('invalid');
		vi.mocked(getListDayRange).mockReturnValue([invalidDate]);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		expect(() => render(<ListView />)).not.toThrow();
		expect(screen.getAllByTestId('day-row')).toHaveLength(1);
	});

	it('passes onAddMeal to each DayRow', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		const mockOnAddMeal = vi.fn();

		render(<ListView onAddMeal={mockOnAddMeal} />);

		expect(DayRow).toHaveBeenCalledTimes(3);
		for (const call of vi.mocked(DayRow).mock.calls) {
			expect(call[0].onAddMeal).toBe(mockOnAddMeal);
		}
	});

	it('calls onAddMeal with the correct date when a day row trigger is clicked', () => {
		const dates = [
			DateTime.local(2024, 6, 10),
			DateTime.local(2024, 6, 11),
			DateTime.local(2024, 6, 12),
		];
		vi.mocked(getListDayRange).mockReturnValue(dates);
		vi.mocked(useCalendarContext).mockReturnValue(
			createMockContextValue({ rangeAnchor: DateTime.local(2024, 6, 11) }),
		);

		const mockOnAddMeal = vi.fn();

		render(<ListView onAddMeal={mockOnAddMeal} />);

		const gutterTrigger = screen.getAllByTestId('gutter-trigger')[1];
		const ghostTrigger = screen.getAllByTestId('ghost-trigger')[2];

		gutterTrigger.click();
		ghostTrigger.click();

		expect(mockOnAddMeal).toHaveBeenCalledTimes(2);
		expect(mockOnAddMeal).toHaveBeenNthCalledWith(1, dates[1]);
		expect(mockOnAddMeal).toHaveBeenNthCalledWith(2, dates[2]);
	});
});
