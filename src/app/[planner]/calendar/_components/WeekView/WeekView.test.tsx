import 'temporal-polyfill/global';

import { MantineProvider } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { WeekView } from './WeekView';

// 2024-01-14 is a Sunday
const weekStart = Temporal.PlainDate.from('2024-01-14');

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const defaultProps = {
	calendar: [] as { date: string; meals?: unknown[] }[],
	currentWeekStart: weekStart,
	plannerId: 'planner-1',
	savedItems: [],
} as Parameters<typeof WeekView>[0];

describe('WeekView', () => {
	test('renders 7 day columns', () => {
		render(<WeekView {...defaultProps} />, { wrapper });
		// Sun Jan 14 through Sat Jan 20
		for (let i = 14; i <= 20; i++) {
			const pad = String(i).padStart(2, '0');
			expect(screen.getByTestId(`week-day-2024-01-${pad}`)).toBeDefined();
		}
	});

	test('renders correct day header labels', () => {
		render(<WeekView {...defaultProps} />, { wrapper });
		expect(screen.getByText('Sun 1/14')).toBeDefined();
		expect(screen.getByText('Mon 1/15')).toBeDefined();
		expect(screen.getByText('Tue 1/16')).toBeDefined();
		expect(screen.getByText('Wed 1/17')).toBeDefined();
		expect(screen.getByText('Thu 1/18')).toBeDefined();
		expect(screen.getByText('Fri 1/19')).toBeDefined();
		expect(screen.getByText('Sat 1/20')).toBeDefined();
	});

	test('shows no meal cards when calendar is empty', () => {
		render(<WeekView {...defaultProps} />, { wrapper });
		expect(screen.queryAllByTestId('week-meal-card')).toHaveLength(0);
	});

	test('shows no meal cards for a day with an empty meals array', () => {
		const calendar = [{ date: '2024-01-15', meals: [] }];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.queryAllByTestId('week-meal-card')).toHaveLength(0);
	});

	test('shows meal card in the correct day column', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		const col = screen.getByTestId('week-day-2024-01-15');
		expect(col.querySelector('[data-testid="week-meal-card"]')).not.toBeNull();
	});

	test('shows meal name in card', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Breakfast')).toBeDefined();
	});

	test('shows meal description when present', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Breakfast',
						description: 'Morning fuel',
						dishes: [],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Morning fuel')).toBeDefined();
	});

	test('does not render description element when absent', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [{ _id: 'meal-1', name: 'Breakfast', dishes: [] }],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.queryByText('undefined')).toBeNull();
	});

	test('shows dish names in meal card', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Breakfast',
						dishes: [{ name: 'Eggs' }, { name: 'Toast' }],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Eggs')).toBeDefined();
		expect(screen.getByText('Toast')).toBeDefined();
	});

	test('shows multiple meals for the same day', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{ _id: 'meal-1', name: 'Breakfast', dishes: [] },
					{ _id: 'meal-2', name: 'Dinner', dishes: [] },
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getAllByTestId('week-meal-card')).toHaveLength(2);
	});

	test('shows meals across different days', () => {
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
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Sunday Brunch')).toBeDefined();
		expect(screen.getByText('Saturday Dinner')).toBeDefined();
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
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.queryByText('Last Week')).toBeNull();
		expect(screen.queryByText('Next Week')).toBeNull();
	});

	test('renders the week-view container', () => {
		render(<WeekView {...defaultProps} />, { wrapper });
		expect(screen.getByTestId('week-view')).toBeDefined();
	});

	test('dish with url source renders as external Anchor link', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [{ name: 'Pasta', source: { url: 'https://example.com' } }],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		const link = screen.getByRole('link', { name: 'Pasta' });
		expect(link.getAttribute('href')).toBe('https://example.com');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('dish with _id source renders as internal Anchor link', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [{ name: 'Carbonara', source: { _id: 'recipe-123' } }],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		const link = screen.getByRole('link', { name: 'Carbonara' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-123');
	});

	test('dish with ref source renders as plain text', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [
							{ name: 'Roast Chicken', source: { ref: 'The Flavor Bible' } },
						],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Roast Chicken')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish with unresolvable string source renders as plain text', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [{ name: 'Soup', source: 'unknown-id' }],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Soup')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('dish with no source renders as plain text', () => {
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [{ name: 'Salad' }],
					},
				],
			},
		];
		render(<WeekView {...defaultProps} calendar={calendar} />, { wrapper });
		expect(screen.getByText('Salad')).toBeDefined();
		expect(screen.queryByRole('link')).toBeNull();
	});

	test('resolves bookmark string source to external link via savedItems', () => {
		const savedItems = [
			{ _id: 'saved-1', name: 'Tasty Recipe', url: 'https://tasty.co/recipe' },
		];
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [{ name: 'Tasty Pasta', source: 'saved-1' }],
					},
				],
			},
		];
		render(
			<WeekView
				{...defaultProps}
				calendar={calendar}
				savedItems={savedItems}
			/>,
			{ wrapper },
		);
		const link = screen.getByRole('link', { name: 'Tasty Pasta' });
		expect(link.getAttribute('href')).toBe('https://tasty.co/recipe');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('resolves saved recipe string source to internal link via savedItems', () => {
		const savedItems = [{ _id: 'recipe-abc', name: 'Carbonara' }];
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Dinner',
						dishes: [{ name: 'Carbonara', source: 'recipe-abc' }],
					},
				],
			},
		];
		render(
			<WeekView
				{...defaultProps}
				calendar={calendar}
				savedItems={savedItems}
			/>,
			{ wrapper },
		);
		const link = screen.getByRole('link', { name: 'Carbonara' });
		expect(link.getAttribute('href')).toBe('/planner-1/recipes/recipe-abc');
	});

	test('dish with a note still renders as a link when source resolves', () => {
		const savedItems = [
			{ _id: 'saved-1', name: 'Some Recipe', url: 'https://example.com' },
		];
		const calendar = [
			{
				date: '2024-01-15',
				meals: [
					{
						_id: 'meal-1',
						name: 'Lunch',
						dishes: [
							{ name: 'Dish', source: 'saved-1', note: 'cook extra crispy' },
						],
					},
				],
			},
		];
		render(
			<WeekView
				{...defaultProps}
				calendar={calendar}
				savedItems={savedItems}
			/>,
			{ wrapper },
		);
		const link = screen.getByRole('link', { name: 'Dish' });
		expect(link.getAttribute('href')).toBe('https://example.com');
	});
});
