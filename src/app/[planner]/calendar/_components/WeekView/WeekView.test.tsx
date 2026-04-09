import 'temporal-polyfill/global';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WeekView } from './WeekView';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockWeekMealCard = vi.fn();
vi.mock('./WeekMealCard', () => ({
	WeekMealCard: (props: Record<string, unknown>) => {
		mockWeekMealCard(props);
		return <div data-testid="week-meal-card" />;
	},
}));

// 2024-01-14 is a Sunday
const weekStart = Temporal.PlainDate.from('2024-01-14');

const defaultProps = {
	calendar: [] as { date: string; meals?: unknown[] }[],
	currentWeekStart: weekStart,
	onMealClick: vi.fn(),
	plannerId: 'planner-1',
	savedItems: [],
} as Parameters<typeof WeekView>[0];

describe('WeekView', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders 7 day columns', () => {
		render(<WeekView {...defaultProps} />);
		// Sun Jan 14 through Sat Jan 20
		for (let i = 14; i <= 20; i++) {
			const pad = String(i).padStart(2, '0');
			expect(screen.getByTestId(`week-day-2024-01-${pad}`)).toBeDefined();
		}
	});

	test('renders correct day header labels', () => {
		render(<WeekView {...defaultProps} />);
		expect(screen.getByText('Sun 1/14')).toBeDefined();
		expect(screen.getByText('Mon 1/15')).toBeDefined();
		expect(screen.getByText('Tue 1/16')).toBeDefined();
		expect(screen.getByText('Wed 1/17')).toBeDefined();
		expect(screen.getByText('Thu 1/18')).toBeDefined();
		expect(screen.getByText('Fri 1/19')).toBeDefined();
		expect(screen.getByText('Sat 1/20')).toBeDefined();
	});

	test('renders the week-view container', () => {
		render(<WeekView {...defaultProps} />);
		expect(screen.getByTestId('week-view')).toBeDefined();
	});

	test('shows no meal cards when calendar is empty', () => {
		render(<WeekView {...defaultProps} />);
		expect(screen.queryAllByTestId('week-meal-card')).toHaveLength(0);
	});

	test('shows no meal cards for a day with an empty meals array', () => {
		const calendar = [{ date: '2024-01-15', meals: [] }];
		render(<WeekView {...defaultProps} calendar={calendar} />);
		expect(screen.queryAllByTestId('week-meal-card')).toHaveLength(0);
	});

	test('renders a WeekMealCard in the correct day column', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />);
		const col = screen.getByTestId('week-day-2024-01-15');
		expect(col.querySelector('[data-testid="week-meal-card"]')).not.toBeNull();
	});

	test('renders multiple WeekMealCards for the same day', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{ _id: 'meal-1', name: 'Breakfast', dishes: [] },
					{ _id: 'meal-2', name: 'Dinner', dishes: [] },
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />);
		expect(screen.getAllByTestId('week-meal-card')).toHaveLength(2);
	});

	test('renders WeekMealCards across different day columns', () => {
		const calendar = [
			{
				date: '2024-01-14',
				meals: [{ _id: 'meal-1', name: 'Sunday Brunch', dishes: [] }],
			},
			{
				date: '2024-01-20',
				meals: [{ _id: 'meal-2', name: 'Saturday Dinner', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />);
		expect(
			screen
				.getByTestId('week-day-2024-01-14')
				.querySelector('[data-testid="week-meal-card"]'),
		).not.toBeNull();
		expect(
			screen
				.getByTestId('week-day-2024-01-20')
				.querySelector('[data-testid="week-meal-card"]'),
		).not.toBeNull();
	});

	test('ignores calendar days outside the current week', () => {
		const calendar = [
			{
				date: '2024-01-13', // Saturday before the week
				meals: [{ _id: 'meal-1', name: 'Last Week', dishes: [] }],
			},
			{
				date: '2024-01-21', // Sunday after the week
				meals: [{ _id: 'meal-2', name: 'Next Week', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />);
		expect(screen.queryAllByTestId('week-meal-card')).toHaveLength(0);
	});

	test('passes meal, day, plannerId, and onMealClick to WeekMealCard', () => {
		const onMealClick = vi.fn();
		const meal = { _id: 'meal-1', name: 'Breakfast', dishes: [] };
		const calendar = [{ date: '2024-01-15', meals: [meal] }];
		render(
			<WeekView
				{...defaultProps}
				calendar={calendar}
				onMealClick={onMealClick}
			/>,
		);
		expect(mockWeekMealCard).toHaveBeenCalledWith(
			expect.objectContaining({
				meal,
				day: Temporal.PlainDate.from('2024-01-15'),
				plannerId: 'planner-1',
				onMealClick,
			}),
		);
	});

	test('passes a savedMap built from savedItems to WeekMealCard', () => {
		const savedItems = [
			{ _id: 'saved-1', name: 'Tasty Recipe', url: 'https://example.com' },
		];
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Lunch', dishes: [] }],
			},
		];
		render(
			<WeekView
				{...defaultProps}
				calendar={calendar}
				savedItems={savedItems}
			/>,
		);
		expect(mockWeekMealCard).toHaveBeenCalledWith(
			expect.objectContaining({
				savedMap: new Map([
					[
						'saved-1',
						{
							_id: 'saved-1',
							name: 'Tasty Recipe',
							url: 'https://example.com',
						},
					],
				]),
			}),
		);
	});
});
