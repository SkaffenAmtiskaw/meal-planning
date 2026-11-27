import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { PhoneDayLabel } from './PhoneDayLabel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const date = DateTime.local(2026, 11, 21);

describe('PhoneDayLabel', () => {
	it("rings today's label and marks it as the current date", () => {
		render(<PhoneDayLabel date={date} isToday />);

		const badge = screen.getByTestId('phone-day-today');
		expect(badge.getAttribute('data-variant')).toBe('ring');
		expect(badge.getAttribute('aria-current')).toBe('date');
		expect(badge.textContent).toBe('Sat 21 Nov');
	});

	it('shows any other day without the ring or the current-date mark', () => {
		render(<PhoneDayLabel date={date} isToday={false} />);

		expect(screen.queryByTestId('phone-day-today')).toBeNull();
		const label = screen.getByTestId('phone-day-label');
		expect(label.getAttribute('aria-current')).toBeNull();
		expect(label.textContent).toBe('Sat 21 Nov');
	});
});
