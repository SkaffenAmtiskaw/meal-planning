import { MantineProvider } from '@mantine/core';
import { useNextCalendarApp } from '@schedule-x/react';
import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { CalendarView } from './CalendarView';

vi.mock('@schedule-x/calendar', () => ({
	createViewList: vi.fn(),
	createViewMonthAgenda: vi.fn(),
	createViewMonthGrid: vi.fn(),
	createViewWeek: vi.fn(),
}));

const mockGetAll = vi.fn();

vi.mock('@schedule-x/events-service', () => ({
	createEventsServicePlugin: vi.fn(() => ({ getAll: mockGetAll })),
}));

vi.mock('@schedule-x/react', () => ({
	useNextCalendarApp: vi.fn((config) => {
		config?.callbacks?.onRender?.();
		return null;
	}),
	ScheduleXCalendar: vi.fn(({ customComponents }) => {
		const HeaderComponent = customComponents?.headerContentRightPrepend;
		return (
			<div data-testid="schedule-x-calendar">
				{HeaderComponent && <HeaderComponent />}
			</div>
		);
	}),
}));

vi.mock('@schedule-x/theme-default/dist/index.css', () => ({}));
vi.mock('temporal-polyfill/global', () => ({}));

vi.mock('./AddMealButton', () => ({
	AddMealButton: ({
		plannerId,
		savedItems,
	}: {
		plannerId?: string;
		savedItems?: unknown[];
	}) => (
		<div
			data-testid="add-meal-button"
			data-planner-id={plannerId}
			data-saved-count={savedItems?.length}
		/>
	),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const savedItems = [{ _id: '1', name: 'Pasta' }];

describe('CalendarView', () => {
	test('renders the calendar', () => {
		render(<CalendarView plannerId="planner-1" savedItems={[]} />, { wrapper });
		expect(screen.getByTestId('schedule-x-calendar')).toBeDefined();
	});

	test('renders AddMealButton in header via customComponents', () => {
		render(<CalendarView plannerId="planner-1" savedItems={[]} />, { wrapper });
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
	});

	test('passes plannerId to AddMealButton', () => {
		render(<CalendarView plannerId="planner-1" savedItems={[]} />, { wrapper });
		expect(
			screen.getByTestId('add-meal-button').getAttribute('data-planner-id'),
		).toBe('planner-1');
	});

	test('passes savedItems to AddMealButton', () => {
		render(<CalendarView plannerId="planner-1" savedItems={savedItems} />, {
			wrapper,
		});
		expect(
			screen.getByTestId('add-meal-button').getAttribute('data-saved-count'),
		).toBe('1');
	});

	test('calls eventsService.getAll in onRender callback', () => {
		render(<CalendarView plannerId="planner-1" savedItems={[]} />, { wrapper });
		expect(vi.mocked(useNextCalendarApp)).toHaveBeenCalled();
		expect(mockGetAll).toHaveBeenCalled();
	});
});
