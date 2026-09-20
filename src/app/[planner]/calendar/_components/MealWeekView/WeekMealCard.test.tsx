import { Paper } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMealColor } from '@/_theme/colors';

import { WeekMealCard } from './WeekMealCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { DishLink } from '../DishLink/DishLink';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@/_theme/colors', () => ({
	getMealColor: vi.fn(() => 'tangerine'),
	TAG_COLORS: {
		tangerine: { bg: '#FDEBD6', text: '#7A3410', border: '#F5B47A' },
	},
}));
vi.mock('@/_theme/focus.module.css', () => ({
	default: { focusRing: 'focus-ring-mock' },
}));
vi.mock('../DishLink/DishLink', () => ({
	DishLink: vi.fn(({ dish, tabIndex }) => (
		<span data-testid="dish-link" data-tab-index={tabIndex}>
			{dish.name}
		</span>
	)),
}));

describe('WeekMealCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseEvent: CalendarEvent = {
		id: 'meal-1',
		start: '2024-01-01',
		end: '2024-01-01',
		title: 'Dinner',
		dishes: [],
	};

	it('calls getMealColor with event title', () => {
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(getMealColor).toHaveBeenCalledWith('Dinner');
	});

	it('renders the meal title', () => {
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(screen.getByText('Dinner')).toBeDefined();
	});

	it('renders description conditionally', () => {
		const eventWithDescription = { ...baseEvent, description: 'Family meal' };
		const { rerender } = render(
			<WeekMealCard event={eventWithDescription} plannerId="planner-1" />,
		);
		expect(screen.getByText('Family meal')).toBeDefined();

		rerender(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(screen.queryByText('Family meal')).toBeNull();
	});

	it('renders a DishLink for each dish', () => {
		const event: CalendarEvent = {
			...baseEvent,
			dishes: [
				{ name: 'Soup', source: { url: 'https://example.com/soup' } },
				{ name: 'Pasta', source: { _id: 'recipe-1' } },
			],
		};
		render(<WeekMealCard event={event} plannerId="planner-1" />);

		expect(DishLink).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Soup')).toBeDefined();
		expect(screen.getByText('Pasta')).toBeDefined();
	});

	it('removes dish links from the tab order', () => {
		const event: CalendarEvent = {
			...baseEvent,
			dishes: [{ name: 'Soup', source: { url: 'https://example.com/soup' } }],
		};
		render(<WeekMealCard event={event} plannerId="planner-1" />);
		expect(screen.getByTestId('dish-link').getAttribute('data-tab-index')).toBe(
			'-1',
		);
	});

	it('forwards tabIndex to the Paper root', () => {
		render(
			<WeekMealCard event={baseEvent} plannerId="planner-1" tabIndex={-1} />,
		);
		expect(Paper).toHaveBeenCalledWith(
			expect.objectContaining({
				tabIndex: -1,
			}),
			undefined,
		);
	});

	it('forwards ref to the Paper root', () => {
		const ref = vi.fn();
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" ref={ref} />);
		expect(Paper).toHaveBeenCalledWith(
			expect.objectContaining({
				ref,
			}),
			undefined,
		);
	});

	it('still calls onClick when the card is clicked', () => {
		const onClick = vi.fn();
		render(
			<WeekMealCard
				event={baseEvent}
				plannerId="planner-1"
				onClick={onClick}
			/>,
		);

		fireEvent.click(screen.getByTestId('week-meal-card'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders as a Paper button', () => {
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(Paper).toHaveBeenCalledWith(
			expect.objectContaining({
				component: 'button',
				type: 'button',
			}),
			undefined,
		);
	});

	it('renders full width', () => {
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(Paper).toHaveBeenCalledWith(
			expect.objectContaining({
				w: '100%',
			}),
			undefined,
		);
	});

	it('renders text left-aligned', () => {
		render(<WeekMealCard event={baseEvent} plannerId="planner-1" />);
		expect(Paper).toHaveBeenCalledWith(
			expect.objectContaining({
				ta: 'left',
			}),
			undefined,
		);
	});
});
