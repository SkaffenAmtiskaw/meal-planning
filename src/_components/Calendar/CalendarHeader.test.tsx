import { Group } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	type CalendarContextValue,
	type CalendarViewType,
	useCalendarContext,
} from './CalendarContext';
import { CalendarHeader, type CalendarHeaderProps } from './CalendarHeader';

import { formatWeekRange } from './_utils/formatWeekRange';

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
}));

vi.mock('./CalendarContext', () => ({
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

function renderHeader(
	props: CalendarHeaderProps = {},
	{
		initialDate = DateTime.local(2024, 6, 15),
		initialView = 'month',
		rangeAnchor = initialDate,
	}: {
		initialDate?: DateTime;
		initialView?: CalendarViewType;
		rangeAnchor?: DateTime;
	} = {},
) {
	vi.mocked(useCalendarContext).mockReturnValue(
		createMockContextValue({
			selectedDate: initialDate,
			viewType: initialView,
			rangeAnchor,
		}),
	);

	return render(<CalendarHeader {...props} />);
}

describe('CalendarHeader', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('layout', () => {
		it('renders Today button', () => {
			renderHeader();

			expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
		});

		it('renders Previous and Next navigation buttons', () => {
			renderHeader();

			expect(screen.getByRole('button', { name: 'Previous' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Next' })).toBeDefined();
		});

		it('renders the date label', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByText('June 2024')).toBeDefined();
		});

		it('applies a bottom border class to the root group', () => {
			renderHeader();

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					className: 'header',
				}),
				undefined,
			);
		});
	});

	describe('sticky header', () => {
		it('renders the header with sticky positioning', () => {
			renderHeader();

			expect(vi.mocked(Group)).toHaveBeenCalledWith(
				expect.objectContaining({
					pos: 'sticky',
					top: 0,
				}),
				undefined,
			);
		});
	});

	describe('right group', () => {
		it('renders rightSection, view switcher, and date picker in order', () => {
			const { container } = renderHeader({
				rightSection: <span data-testid="custom-right">Add</span>,
			});
			const rightGroup = container.firstChild?.lastChild as HTMLElement;

			expect(rightGroup.children[0].getAttribute('data-testid')).toBe(
				'custom-right',
			);
			expect(
				rightGroup.children[1].querySelector('button[data-value="month"]'),
			).not.toBeNull();
			expect(rightGroup.children[2].getAttribute('type')).toBe('date');
		});
	});

	describe('navigation', () => {
		it('calls goToPrevious when prev button clicked', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByRole('button', { name: /previous/i }));

			expect(mockGoToPrevious).toHaveBeenCalled();
		});

		it('calls goToNext when next button clicked', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByRole('button', { name: /next/i }));

			expect(mockGoToNext).toHaveBeenCalled();
		});

		it('calls goToToday when today button clicked', () => {
			renderHeader({}, { initialDate: DateTime.local(2020, 1, 1) });

			fireEvent.click(screen.getByRole('button', { name: /today/i }));

			expect(mockGoToToday).toHaveBeenCalled();
		});
	});

	describe('date label', () => {
		it('displays month label in month view', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByText('June 2024')).toBeDefined();
		});

		it('displays week range label in week view', () => {
			const initialDate = DateTime.local(2024, 6, 12);
			renderHeader({}, { initialDate, initialView: 'week' });

			expect(screen.getByText(formatWeekRange(initialDate))).toBeDefined();
		});

		it('includes years on both sides when the week spans years', () => {
			const initialDate = DateTime.local(2024, 12, 31);
			renderHeader({}, { initialDate, initialView: 'week' });

			expect(screen.getByText(formatWeekRange(initialDate))).toBeDefined();
		});

		it('displays selectedDate label in list view', () => {
			renderHeader(
				{},
				{ initialDate: DateTime.local(2024, 6, 15), initialView: 'list' },
			);

			expect(screen.getByText('June 2024')).toBeDefined();
		});
	});

	describe('list view', () => {
		it('hides Previous and Next buttons in list view', () => {
			renderHeader(
				{},
				{ initialDate: DateTime.local(2024, 6, 15), initialView: 'list' },
			);

			expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
			expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
		});
	});

	describe('view switcher', () => {
		it('renders all views by default', () => {
			renderHeader();

			expect(screen.getByRole('button', { name: 'Month' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Week' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'List' })).toBeDefined();
		});

		it('limits views when availableViews is provided', () => {
			renderHeader({ availableViews: ['month', 'list'] });

			expect(screen.getByRole('button', { name: 'Month' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'List' })).toBeDefined();
			expect(screen.queryByRole('button', { name: 'Week' })).toBeNull();
		});

		it('calls setViewType when a view is selected', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 12) });

			fireEvent.click(screen.getByRole('button', { name: 'Week' }));

			expect(mockSetViewType).toHaveBeenCalledWith('week');
		});
	});

	describe('date picker', () => {
		it('displays the selected date', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByDisplayValue('2024-06-15')).toBeDefined();
		});

		it('calls navigateToDate with the picked date', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '2024-07-20' },
			});

			expect(mockNavigateToDate).toHaveBeenCalledTimes(1);
			expect(mockNavigateToDate.mock.calls[0]?.[0].toISODate()).toBe(
				'2024-07-20',
			);
		});

		it('does not call navigateToDate when the picker is cleared', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '' },
			});

			expect(mockNavigateToDate).not.toHaveBeenCalled();
			expect(screen.getByText('June 2024')).toBeDefined();
		});
	});

	describe('right section', () => {
		it('renders rightSection content', () => {
			renderHeader({
				rightSection: <span data-testid="custom-right">Add</span>,
			});

			expect(screen.getByTestId('custom-right')).toBeDefined();
		});
	});
});
