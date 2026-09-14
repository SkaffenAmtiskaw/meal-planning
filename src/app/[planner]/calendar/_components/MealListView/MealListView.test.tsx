import { useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListView } from '@/_components/Calendar';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import { useCanWrite } from '@/app/[planner]/_components';

import { MealListView } from './MealListView';

import {
	type CalendarEvent,
	toCalendarEvents,
} from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';
import {
	AddMealFormModalWrapper,
	type AddMealFormModalWrapperProps,
} from '../AddMealFormModalWrapper/AddMealFormModalWrapper';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@/_components/Calendar', async () => ({
	ListView: vi.fn(({ events }) => (
		<div data-testid="list-view" data-events={JSON.stringify(events)} />
	)),
}));

vi.mock('@/app/[planner]/_components', async () => ({
	useCanWrite: vi.fn(() => true),
}));

vi.mock('../AddMealFormModalWrapper/AddMealFormModalWrapper', async () => ({
	AddMealFormModalWrapper: vi.fn(() => (
		<div data-testid="add-meal-form-modal-wrapper" />
	)),
}));

vi.mock('../../_utils/toCalendarEvents', async () => ({
	toCalendarEvents: vi.fn(() => []),
}));

vi.mock('@/_theme/colors', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/_theme/colors')>();
	return {
		...actual,
		getMealColor: vi.fn(() => 'fern'),
	};
});

const mockUseCanWrite = vi.mocked(useCanWrite);
const mockListView = vi.mocked(ListView);
const mockModal = vi.mocked(Modal);
const mockAddMealFormModalWrapper = vi.mocked(AddMealFormModalWrapper);
const mockToCalendarEvents = vi.mocked(toCalendarEvents);
const mockGetMealColor = vi.mocked(getMealColor);

const plannerId = 'planner-123';
const onMealAdded = vi.fn();

const savedItems: SavedItem[] = [
	{ _id: 'saved-1', name: 'Saved Dish', url: 'http://example.com' },
];

const calendar: SerializedDay[] = [
	{
		date: '2024-06-15',
		meals: [
			{
				_id: 'meal-1',
				name: 'Breakfast',
				description: 'Morning meal',
				dishes: [{ name: 'Eggs' }],
			},
		],
	},
];

const calendarEvents: CalendarEvent[] = [
	{
		id: 'meal-1',
		start: '2024-06-15',
		end: '2024-06-15',
		title: 'Breakfast',
		description: 'Morning meal',
		dishes: [{ name: 'Resolved Eggs', source: { _id: 'saved-1' } }],
	},
];

function ListViewDayTrigger({
	onAddMeal,
	date,
}: {
	onAddMeal?: (date: DateTime) => void;
	date: DateTime;
}): ReactElement {
	return (
		<button
			type="button"
			data-testid="day-trigger"
			onClick={() => onAddMeal?.(date)}
		>
			Add meal
		</button>
	);
}

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
		vi.mocked(useDisclosure).mockImplementation((initialState = false) => {
			const [opened, setOpened] = useState(initialState);
			return [
				opened,
				{
					open: () => setOpened(true),
					close: () => setOpened(false),
					toggle: () => setOpened((current) => !current),
					set: (value: boolean) => setOpened(value),
				},
			];
		});
	});

	it('renders ListView', () => {
		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		expect(screen.getByTestId('list-view')).toBeDefined();
	});

	it('passes calendar-derived events to ListView', () => {
		mockToCalendarEvents.mockReturnValue(calendarEvents);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
				onMealAdded={onMealAdded}
			/>,
		);

		expect(mockToCalendarEvents).toHaveBeenCalledWith(calendar, savedItems);

		const listView = screen.getByTestId('list-view');
		const events = JSON.parse(listView.getAttribute('data-events') ?? '[]');

		expect(events).toEqual([
			{
				id: 'meal-1',
				date: '2024-06-15',
				name: 'Breakfast',
				description: 'Morning meal',
				borderColor: TAG_COLORS.fern.border,
				dishes: [{ name: 'Resolved Eggs', source: { _id: 'saved-1' } }],
			},
		]);
	});

	it('computes the correct border color for each meal from TAG_COLORS', () => {
		mockGetMealColor.mockImplementation((title) =>
			title === 'Breakfast' ? 'fern' : 'seafoam',
		);
		mockToCalendarEvents.mockReturnValue([
			{
				id: 'meal-1',
				start: '2024-06-15',
				end: '2024-06-15',
				title: 'Breakfast',
				dishes: [],
			},
			{
				id: 'meal-2',
				start: '2024-06-15',
				end: '2024-06-15',
				title: 'Dinner',
				dishes: [],
			},
		]);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				onMealAdded={onMealAdded}
			/>,
		);

		const events = JSON.parse(
			screen.getByTestId('list-view').getAttribute('data-events') ?? '[]',
		);

		expect(events[0].borderColor).toBe(TAG_COLORS.fern.border);
		expect(events[1].borderColor).toBe(TAG_COLORS.seafoam.border);
	});

	it('resolves dish sources using savedItems before passing events', () => {
		mockToCalendarEvents.mockReturnValue(calendarEvents);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={calendar}
				savedItems={savedItems}
				onMealAdded={onMealAdded}
			/>,
		);

		expect(mockToCalendarEvents).toHaveBeenCalledWith(calendar, savedItems);

		const events = JSON.parse(
			screen.getByTestId('list-view').getAttribute('data-events') ?? '[]',
		);

		expect(events[0].dishes).toEqual(calendarEvents[0].dishes);
	});

	it('passes onAddMeal to ListView when user has write access', () => {
		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: expect.any(Function) }),
			undefined,
		);
	});

	it('does not pass onAddMeal to ListView when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);

		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: undefined }),
			undefined,
		);
	});

	it('opens the modal with the correct initialDate when a day trigger is clicked', () => {
		const date = DateTime.local(2024, 6, 15);

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(mockModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Add Meal',
				size: 'lg',
				opened: true,
			}),
			undefined,
		);
		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				initialDate: date.toISODate(),
				onMealAdded,
			}),
			undefined,
		);
	});

	it('falls back to undefined initialDate when the date is invalid', () => {
		const invalidDate = DateTime.invalid('invalid');

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={invalidDate} />
		));

		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				initialDate: undefined,
			}),
			undefined,
		);
	});

	it('propagates onMealAdded and closes the modal via onClose', () => {
		const date = DateTime.local(2024, 6, 15);
		const updatedCalendar: SerializedDay[] = [];

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(
			<MealListView
				plannerId={plannerId}
				calendar={[]}
				onMealAdded={onMealAdded}
			/>,
		);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();

		const wrapperProps = mockAddMealFormModalWrapper.mock
			.calls[0][0] as AddMealFormModalWrapperProps;

		wrapperProps.onMealAdded?.(updatedCalendar);
		expect(onMealAdded).toHaveBeenCalledWith(updatedCalendar);

		act(() => {
			wrapperProps.onClose();
		});
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
