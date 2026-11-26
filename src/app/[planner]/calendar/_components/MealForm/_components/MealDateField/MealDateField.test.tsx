import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePickerPopover } from '@/_components';

import { MealDateField } from './MealDateField';

vi.mock('@/_components', () => ({
	DatePickerPopover: vi.fn(
		({
			renderTrigger,
		}: {
			renderTrigger: (trigger: {
				opened: boolean;
				onClick: () => void;
			}) => React.ReactNode;
		}) => renderTrigger({ opened: false, onClick: () => {} }),
	),
	DateFieldTrigger: vi.fn(({ children }: { children?: React.ReactNode }) => (
		<button type="button">{children}</button>
	)),
}));

vi.mock(
	'../../../../_hooks/useCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals'),
);

const popoverProps = () => vi.mocked(DatePickerPopover).mock.lastCall?.[0];

describe('MealDateField', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows the short date and selects it in the picker', () => {
		render(<MealDateField value="2026-11-26" onChange={vi.fn()} />);

		expect(screen.getByRole('button').textContent).toBe('Thu, Nov 26');
		expect(popoverProps()?.value).toBe('2026-11-26');
	});

	it('shows no date and selects none while the meal has no date', () => {
		render(<MealDateField value="" onChange={vi.fn()} />);

		expect(screen.getByRole('button').textContent).toBe('');
		expect(popoverProps()?.value).toBeNull();
	});
});
