import React from 'react';

import { Flex, Group, Popover, SegmentedControl, Stack } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatWeekRange } from '@/_components/Calendar/_utils/formatWeekRange';
import {
	type CalendarContextValue,
	type CalendarViewType,
	useCalendarContext,
} from '@/_components/Calendar/CalendarContext';
import { AddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import { CalendarHeaderDesktop, CalendarHeaderMobile } from './CalendarHeader';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./CalendarHeader.module.css', () => ({
	default: { header: 'header' },
}));

vi.mock('@mantine/dates', () => ({
	DatePickerInput: vi.fn(({ value, onChange, 'data-testid': testId }) => (
		<input
			type="date"
			data-testid={testId}
			value={value ?? ''}
			onChange={(e) => onChange?.(e.target.value)}
		/>
	)),
	DatePicker: vi.fn(({ value, onChange, 'data-testid': testId }) => (
		<input
			type="date"
			data-testid={testId}
			value={value ?? ''}
			onChange={(e) => onChange?.(e.target.value)}
		/>
	)),
}));

vi.mock('@/_components/Calendar/_components/CalendarNavButtons', async () => ({
	CalendarTodayButton: vi.fn(({ size }) => (
		<button data-testid="today-button" data-size={size} aria-label="Today">
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

vi.mock('@/app/[planner]/calendar/_components/AddMealButton', () => ({
	AddMealButton: vi.fn(() => (
		<button data-testid="add-meal-button">Add Meal</button>
	)),
}));

vi.mock('@/_components/Calendar/CalendarContext', () => ({
	useCalendarContext: vi.fn(),
}));

const mockNavigateToDate = vi.fn();
const mockGoToToday = vi.fn();
const mockGoToPrevious = vi.fn();
const mockGoToNext = vi.fn();
const mockSetViewType = vi.fn();

function createMockContextValue(
	overrides: Partial<CalendarContextValue> = {},
): CalendarContextValue {
	return {
		selectedDate: DateTime.local(2024, 6, 15),
		viewType: 'month',
		rangeAnchor: DateTime.local(2024, 6, 15),
		setSelectedDate: vi.fn(),
		setViewType: mockSetViewType,
		navigateToDate: mockNavigateToDate,
		goToToday: mockGoToToday,
		goToPrevious: mockGoToPrevious,
		goToNext: mockGoToNext,
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
		vi.mocked(Popover).mockImplementation(({ children, opened }) => (
			<>
				{React.Children.toArray(children)[0]}
				{opened ? React.Children.toArray(children)[1] : null}
			</>
		));
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

		it('displays the selected date in the date picker', () => {
			renderDesktop({ initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByDisplayValue('2024-06-15')).toBeDefined();
		});

		it('calls navigateToDate with the picked date', () => {
			renderDesktop({ initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '2024-07-20' },
			});

			expect(mockNavigateToDate).toHaveBeenCalledTimes(1);
			expect(mockNavigateToDate.mock.calls[0]?.[0].toISODate()).toBe(
				'2024-07-20',
			);
		});

		it('does not call navigateToDate when the desktop picker is cleared', () => {
			renderDesktop({ initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '' },
			});

			expect(mockNavigateToDate).not.toHaveBeenCalled();
		});

		it('applies sticky positioning and bottom border class to the root group', () => {
			renderDesktop();

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					className: 'header',
					pos: 'sticky',
					top: 0,
				}),
				undefined,
			);
		});
	});

	describe('CalendarHeaderMobile', () => {
		it('renders the sticky header root with the bottom-border class', () => {
			renderMobile();

			expect(vi.mocked(Stack)).toHaveBeenCalledWith(
				expect.objectContaining({
					className: 'header',
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

		it('uses large touch targets for mobile navigation buttons', () => {
			renderMobile();

			expect(
				screen.getByTestId('previous-button').getAttribute('data-size'),
			).toBe('lg');
			expect(screen.getByTestId('next-button').getAttribute('data-size')).toBe(
				'lg',
			);
			expect(screen.getByTestId('today-button').getAttribute('data-size')).toBe(
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

		it('centers the month/year label in a flex container', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			expect(vi.mocked(Flex)).toHaveBeenCalledWith(
				expect.objectContaining({
					flex: 1,
					justify: 'center',
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

		it('opens the date picker popover when the month label is clicked', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.queryByTestId('popover-dropdown')).toBeNull();

			fireEvent.click(screen.getByText('June 2024'));

			expect(screen.getByTestId('popover-dropdown')).toBeDefined();
		});

		it('passes an ISO date string to the mobile DatePicker', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByText('June 2024'));

			const datePickerProps = vi.mocked(DatePicker).mock.calls[0]?.[0];
			expect(datePickerProps?.value).toBe('2024-06-15');
		});

		it('navigates to the picked date and closes the popover', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByText('June 2024'));
			expect(screen.getByTestId('popover-dropdown')).toBeDefined();

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '2024-07-20' },
			});

			expect(mockNavigateToDate).toHaveBeenCalledTimes(1);
			expect(mockNavigateToDate.mock.calls[0]?.[0].toISODate()).toBe(
				'2024-07-20',
			);
			expect(screen.queryByTestId('popover-dropdown')).toBeNull();
		});

		it('does not navigate when the mobile picker is cleared', () => {
			renderMobile({ initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByText('June 2024'));

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '' },
			});

			expect(mockNavigateToDate).not.toHaveBeenCalled();
		});
	});
});
