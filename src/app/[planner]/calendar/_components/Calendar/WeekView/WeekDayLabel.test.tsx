import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WeekDayLabel } from './WeekDayLabel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('WeekDayLabel', () => {
	it("rings today's label", () => {
		render(<WeekDayLabel label="Wed 9/18" isToday />);

		const badge = screen.getByTestId('week-day-today');
		expect(badge.getAttribute('data-variant')).toBe('ring');
		expect(badge.textContent).toBe('Wed 9/18');
	});

	it('shows any other day as plain text', () => {
		render(<WeekDayLabel label="Thu 9/19" isToday={false} />);

		expect(screen.queryByTestId('week-day-today')).toBeNull();
		expect(screen.getByTestId('week-day-label').textContent).toBe('Thu 9/19');
	});
});
