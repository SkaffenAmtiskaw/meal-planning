import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { MonthGridDayCell } from './MonthGridDayCell';
import type {
	DayKeyboardProps,
	MealKeyboardProps,
	MonthGridMeal,
} from './types';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const DAY = DateTime.local(2024, 3, 15);

function dayProps(): DayKeyboardProps {
	return { tabIndex: -1, onClick: vi.fn(), onKeyDown: vi.fn(), ref: vi.fn() };
}

function mealProps(): MealKeyboardProps {
	return { tabIndex: -1, ref: vi.fn() };
}

function renderCell(
	overrides: Partial<React.ComponentProps<typeof MonthGridDayCell>> = {},
) {
	return render(
		<MonthGridDayCell
			day={DAY}
			isToday={false}
			isCurrentMonth
			meals={[]}
			dayProps={dayProps()}
			getMealProps={mealProps}
			{...overrides}
		/>,
	);
}

function meals(count: number): MonthGridMeal[] {
	return Array.from({ length: count }, (_, i) => ({
		id: String(i + 1),
		date: '2024-03-15',
		name: `Meal ${String.fromCharCode(65 + i)}`,
	}));
}

describe('MonthGridDayCell', () => {
	it('highlights today with an ember badge', () => {
		renderCell({ isToday: true });

		const badge = screen.getByText('15').closest('[data-testid="badge"]');
		expect(badge?.getAttribute('data-color')).toBe('ember');
	});

	it('dims a day from an adjacent month', () => {
		renderCell({ isCurrentMonth: false });

		expect(screen.getByText('15').getAttribute('data-c')).toBe('gray.5');
	});

	it('does not dim a day in the current month', () => {
		renderCell();

		expect(screen.getByText('15').getAttribute('data-c')).toBeNull();
	});

	it('limits visible meals to 2 and shows +N more', () => {
		renderCell({ meals: meals(3) });

		const cell = screen.getByTestId('day-cell');
		expect(cell.textContent).toContain('Meal A');
		expect(cell.textContent).toContain('Meal B');
		expect(cell.textContent).not.toContain('Meal C');
		expect(cell.textContent).toContain('+1 more');
	});

	it('does not show +N more when meals are 2 or fewer', () => {
		renderCell({ meals: meals(2) });

		expect(screen.getByTestId('day-cell').textContent).not.toContain('more');
	});

	it('labels the cell with its meal count only when it has meals', () => {
		const { unmount } = renderCell();
		expect(
			screen.getByTestId('day-cell').getAttribute('aria-label'),
		).toBeNull();
		unmount();

		renderCell({ meals: meals(2) });
		expect(screen.getByTestId('day-cell').getAttribute('aria-label')).toBe(
			'March 15, 2 meals',
		);
	});

	it('renders each meal through renderMeal with its keyboard props', () => {
		const firstMealProps = mealProps();
		const getMealProps = vi.fn((mealIndex: number) =>
			mealIndex === 0 ? firstMealProps : mealProps(),
		);
		const renderMeal = vi.fn((meal: MonthGridMeal) => (
			<span>{meal.name} custom</span>
		));
		const cellMeals = meals(1);

		renderCell({ meals: cellMeals, getMealProps, renderMeal });

		expect(getMealProps).toHaveBeenCalledWith(0);
		expect(renderMeal).toHaveBeenCalledWith(cellMeals[0], firstMealProps);
		expect(screen.getByTestId('day-cell').textContent).toContain(
			'Meal A custom',
		);
	});

	it('does not pass a meal click on to the day', () => {
		const props = dayProps();
		renderCell({ meals: meals(1), dayProps: props });

		fireEvent.click(screen.getByText('Meal A'));

		expect(props.onClick).not.toHaveBeenCalled();
	});
});
