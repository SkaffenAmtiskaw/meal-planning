import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactElement } from 'react';

import { Button, Group, SegmentedControl, Stack } from '@mantine/core';

import { DateTime } from 'luxon';

import { CalendarHeaderDesktop, CalendarHeaderMobile } from './CalendarHeader';

import { AddMealButton } from '../AddMealButton';
import { useCalendarContext } from '../Calendar/CalendarContext';
import type { CalendarContextValue, CalendarViewType } from '../Calendar/types';
import { formatWeekRange } from './_utils/formatWeekRange';

const mockSetViewType = vi.fn();

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_components', () => ({
	DateFieldTrigger: vi.fn(() => <button type="button">Date</button>),
}));

// Renders the header's trigger closed, so the picker and its hooks stay out of the header's tests.
vi.mock('../JumpToDate', () => ({
	JumpToDate: vi.fn(
		({
			renderTrigger,
		}: {
			renderTrigger: (trigger: {
				opened: boolean;
				onClick: () => void;
			}) => ReactElement;
		}) => renderTrigger({ opened: false, onClick: () => {} }),
	),
}));

vi.mock('./CalendarNavButtons', async () => ({
	CalendarTodayButton: vi.fn(({ size }) => (
		<button data-testid="today-button" data-size={size} aria-label="Today">
			Today
		</button>
	)),
	CalendarTodayPillButton: vi.fn(() => (
		<button data-testid="today-button" aria-label="Today">
			Today
		</button>
	)),
	CalendarPreviousButton: vi.fn(({ size }) => (
		<button
			data-testid="previous-button"
			data-size={size}
			aria-label="Previous"
		>
			Previous
		</button>
	)),
	CalendarNextButton: vi.fn(({ size }) => (
		<button data-testid="next-button" data-size={size} aria-label="Next">
			Next
		</button>
	)),
}));

vi.mock('../AddMealButton', () => ({
	AddMealButton: vi.fn(() => (
		<button data-testid="add-meal-button">Add Meal</button>
	)),
}));

vi.mock('../Calendar/CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

function createMockContextValue(
	overrides: Partial<CalendarContextValue> = {},
): CalendarContextValue {
	return {
		selectedDate: DateTime.local(2024, 6, 15),
		viewType: 'month',
		rangeAnchor: DateTime.local(2024, 6, 15),
		setSelectedDate: vi.fn(),
		setViewType: mockSetViewType,
		navigateToDate: vi.fn(),
		goToToday: vi.fn(),
		goToPrevious: vi.fn(),
		goToNext: vi.fn(),
		...overrides,
	};
}

function renderDesktop({
	initialDate = DateTime.local(2024, 6, 15),
	initialView = 'month',
}: {
	initialDate?: DateTime;
	initialView?: CalendarViewType;
} = {}) {
	vi.mocked(useCalendarContext).mockReturnValue(
		createMockContextValue({
			selectedDate: initialDate,
			viewType: initialView,
		}),
	);

	return render(<CalendarHeaderDesktop />);
}

function renderMobile({
	initialDate = DateTime.local(2024, 6, 15),
	initialView = 'month',
}: {
	initialDate?: DateTime;
	initialView?: CalendarViewType;
} = {}) {
	vi.mocked(useCalendarContext).mockReturnValue(
		createMockContextValue({
			selectedDate: initialDate,
			viewType: initialView,
		}),
	);

	return render(<CalendarHeaderMobile />);
}

describe('CalendarHeader', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('CalendarHeaderDesktop', () => {
		it('renders Today, Previous, and Next buttons in order', () => {
			renderDesktop();

			const buttons = screen.getAllByRole('button');
			expect(buttons[0].getAttribute('data-testid')).toBe('today-button');
			expect(buttons[1].getAttribute('data-testid')).toBe('previous-button');
			expect(buttons[2].getAttribute('data-testid')).toBe('next-button');
		});

		it('renders the Add Meal button', () => {
			renderDesktop();

			expect(screen.getByTestId('add-meal-button')).toBeDefined();
			expect(vi.mocked(AddMealButton)).toHaveBeenCalledWith({}, undefined);
		});

		it('renders the date label', () => {
			renderDesktop({ initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByText('June 2024')).toBeDefined();
		});

		it('displays week range label in week view', () => {
			const initialDate = DateTime.local(2024, 6, 12);
			renderDesktop({ initialDate, initialView: 'week' });

			expect(screen.getByText(formatWeekRange(initialDate))).toBeDefined();
		});

		it('hides Previous and Next buttons in list view', () => {
			renderDesktop({
				initialDate: DateTime.local(2024, 6, 15),
				initialView: 'list',
			});

			expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
			expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
			expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
		});

		it('renders a view switcher with Month, Week, and List options', () => {
			renderDesktop();

			expect(screen.getByRole('button', { name: 'Month' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Week' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'List' })).toBeDefined();
		});

		it('calls setViewType when a view is selected', () => {
			renderDesktop({ initialDate: DateTime.local(2024, 6, 12) });

			fireEvent.click(screen.getByRole('button', { name: 'Week' }));

			expect(mockSetViewType).toHaveBeenCalledWith('week');
		});

		it('applies sticky positioning to the root group', () => {
			renderDesktop();

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					pos: 'sticky',
					top: 0,
				}),
				undefined,
			);
		});
	});

	describe('CalendarHeaderMobile', () => {
		it('renders the sticky header root', () => {
			renderMobile();

			expect(vi.mocked(Stack)).toHaveBeenCalledWith(
				expect.objectContaining({
					pos: 'sticky',
					top: 0,
					gap: 'xs',
					p: 'md',
					bg: 'var(--mantine-color-body)',
					style: { zIndex: 100 },
				}),
				undefined,
			);
		});

		it('renders Today, Previous, and Next buttons in month view', () => {
			renderMobile();

			expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Previous' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Next' })).toBeDefined();
		});

		it('renders Previous, month/year label, Next, and Today in order', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			const buttons = screen.getAllByRole('button');
			expect(buttons[0].getAttribute('data-testid')).toBe('previous-button');
			expect(buttons[1].textContent).toBe('June 2024');
			expect(buttons[2].getAttribute('data-testid')).toBe('next-button');
			expect(buttons[3].getAttribute('data-testid')).toBe('today-button');
		});

		it('lays out the header row so Today is aligned to the far right', () => {
			renderMobile();

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					justify: 'space-between',
					wrap: 'nowrap',
					w: '100%',
				}),
				undefined,
			);
		});

		it('uses large touch targets for mobile navigation buttons', () => {
			renderMobile();

			expect(
				screen.getByTestId('previous-button').getAttribute('data-size'),
			).toBe('lg');
			expect(screen.getByTestId('next-button').getAttribute('data-size')).toBe(
				'lg',
			);
		});

		it('hides Previous and Next buttons in list view but keeps the month label', () => {
			renderMobile({ initialView: 'list' });

			expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
			expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
			expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
			expect(screen.getByText('June 2024')).toBeDefined();
		});

		it('centers the month/year label within the navigation group', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					justify: 'center',
					gap: 'xs',
					align: 'center',
					wrap: 'nowrap',
				}),
				undefined,
			);
		});

		it('uses a compact trigger for the month/year label', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			expect(vi.mocked(Button)).toHaveBeenCalledWith(
				expect.objectContaining({
					variant: 'subtle',
					size: 'compact-sm',
				}),
				undefined,
			);
		});

		it('renders a full-width Month/List segmented control', () => {
			renderMobile();

			expect(screen.getByRole('button', { name: 'Month' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'List' })).toBeDefined();
			expect(screen.queryByRole('button', { name: 'Week' })).toBeNull();
		});

		it('uses a large segmented control on mobile', () => {
			renderMobile();

			expect(vi.mocked(SegmentedControl)).toHaveBeenCalledWith(
				expect.objectContaining({ size: 'lg', fullWidth: true }),
				undefined,
			);
		});

		it('calls setViewType when a mobile view is selected', () => {
			renderMobile();

			fireEvent.click(screen.getByRole('button', { name: 'List' }));

			expect(mockSetViewType).toHaveBeenCalledWith('list');
		});
	});
});
