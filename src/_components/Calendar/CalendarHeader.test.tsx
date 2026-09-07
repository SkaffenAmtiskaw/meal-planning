import { fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarHeader, type CalendarHeaderProps } from './CalendarHeader';
import { CalendarProvider } from './CalendarProvider';
import type { CalendarViewType } from './CalendarContext';

import { formatWeekRange } from './_utils/formatWeekRange';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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

function renderHeader(
	props: CalendarHeaderProps = {},
	{
		initialDate = DateTime.local(2024, 6, 15),
		initialView = 'month',
	}: { initialDate?: DateTime; initialView?: CalendarViewType } = {},
) {
	return render(
		<CalendarProvider initialDate={initialDate} initialView={initialView}>
			<CalendarHeader {...props} />
		</CalendarProvider>,
	);
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

			expect(screen.getByText('June 2024')).toBeDefined();

			fireEvent.click(screen.getByRole('button', { name: /previous/i }));

			expect(screen.getByText('May 2024')).toBeDefined();
		});

		it('calls goToNext when next button clicked', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.click(screen.getByRole('button', { name: /next/i }));

			expect(screen.getByText('July 2024')).toBeDefined();
		});

		it('calls goToToday when today button clicked', () => {
			renderHeader({}, { initialDate: DateTime.local(2020, 1, 1) });

			fireEvent.click(screen.getByRole('button', { name: /today/i }));

			expect(
				screen.getByText(DateTime.now().toFormat('MMMM yyyy')),
			).toBeDefined();
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

		it('displays list date label in list view', () => {
			renderHeader(
				{},
				{ initialDate: DateTime.local(2024, 6, 15), initialView: 'list' },
			);

			expect(screen.getByText('June 15, 2024')).toBeDefined();
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
			const initialDate = DateTime.local(2024, 6, 12);
			renderHeader({}, { initialDate, initialView: 'month' });

			fireEvent.click(screen.getByRole('button', { name: 'Week' }));

			expect(screen.getByText(formatWeekRange(initialDate))).toBeDefined();
		});
	});

	describe('date picker', () => {
		it('displays the selected date', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			expect(screen.getByDisplayValue('2024-06-15')).toBeDefined();
		});

		it('calls setSelectedDate with the picked date', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '2024-07-20' },
			});

			expect(screen.getByText('July 2024')).toBeDefined();
		});

		it('does not update selectedDate when the picker is cleared', () => {
			renderHeader({}, { initialDate: DateTime.local(2024, 6, 15) });

			fireEvent.change(screen.getByDisplayValue('2024-06-15'), {
				target: { value: '' },
			});

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
